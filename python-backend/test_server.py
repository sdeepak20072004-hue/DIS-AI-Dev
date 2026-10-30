"""Tests for the Python helper and provider gateway contracts."""
from __future__ import annotations

import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from provider_gateway import (
    ChatRequest,
    ChatResponse,
    MockChatProvider,
    ProviderError,
    complete_chat,
    validate_chat_request,
)
from server import PythonHelperHandler


class PythonHelperServiceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), PythonHelperHandler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.httpd.server_address[1]}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=2)

    def _post_json(self, path: str, payload: object, origin: str | None = None) -> dict[str, object]:
        body = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if origin:
            headers["Origin"] = origin
        request = Request(
            f"{self.base_url}{path}",
            data=body,
            headers=headers,
            method="POST",
        )
        with urlopen(request, timeout=2) as response:
            return json.loads(response.read().decode("utf-8"))

    def test_health_endpoint_reports_python_and_no_ai_provider(self) -> None:
        with urlopen(f"{self.base_url}/health", timeout=2) as response:
            self.assertEqual(response.status, 200)
            payload = json.loads(response.read().decode("utf-8"))
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["runtime"], "Python")
        self.assertEqual(payload["provider_gateway"], "mock")
        self.assertFalse(payload["ai_connected"])
        self.assertTrue(payload["version"])

    def test_echo_endpoint_returns_message_from_python(self) -> None:
        payload = self._post_json("/echo", {"message": "Hello from test"})
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["echo"], "Hello from test")
        self.assertEqual(payload["processed_by"], "Python standard-library helper")
        self.assertFalse(payload["ai_connected"])

    def test_mock_chat_endpoint_returns_provider_contract(self) -> None:
        payload = self._post_json(
            "/chat",
            {"message": "Help me understand the Python backend", "request_id": "test-req-01"},
        )
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["request_id"], "test-req-01")
        self.assertEqual(payload["provider"], "mock")
        self.assertEqual(payload["model"], "dis-ai-dev-mock-v1")
        self.assertIn("deterministic mock response", payload["message"])
        self.assertFalse(payload["ai_connected"])

    def test_chat_invalid_message_returns_structured_error(self) -> None:
        with self.assertRaises(HTTPError) as captured:
            self._post_json("/chat", {"message": "   "})
        self.assertEqual(captured.exception.code, 400)
        payload = json.loads(captured.exception.read().decode("utf-8"))
        self.assertEqual(payload["error"]["code"], "invalid_message")
        captured.exception.close()

    def test_chat_message_over_limit_returns_413(self) -> None:
        with self.assertRaises(HTTPError) as captured:
            self._post_json("/chat", {"message": "x" * 4001})
        self.assertEqual(captured.exception.code, 413)
        payload = json.loads(captured.exception.read().decode("utf-8"))
        self.assertEqual(payload["error"]["code"], "message_too_long")
        captured.exception.close()

    def test_workspace_summary_returns_bounded_metadata(self) -> None:
        with urlopen(f"{self.base_url}/workspace/summary", timeout=3) as response:
            payload = json.loads(response.read().decode("utf-8"))
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["workspace_name"], "DIS-AI-Dev")
        self.assertTrue(payload["read_only"])
        self.assertFalse(payload["persistent_index"])
        self.assertNotIn(str(Path(__file__).resolve().parents[1]), str(payload))

    def test_workspace_search_returns_relative_code_matches(self) -> None:
        with urlopen(
            f"{self.base_url}/workspace/search?q=PythonHelperHandler", timeout=3
        ) as response:
            payload = json.loads(response.read().decode("utf-8"))
        self.assertTrue(payload["ok"])
        self.assertGreater(payload["match_count"], 0)
        self.assertTrue(payload["read_only"])
        self.assertTrue(
            any(result["path"] == "python-backend/server.py" for result in payload["results"])
        )
        self.assertNotIn(str(__import__("pathlib").Path(__file__).resolve().parents[1]), str(payload))

    def test_workspace_search_rejects_too_short_query(self) -> None:
        request = Request(f"{self.base_url}/workspace/search?q=x", method="GET")
        with self.assertRaises(HTTPError) as captured:
            urlopen(request, timeout=3)
        self.assertEqual(captured.exception.code, 400)
        captured.exception.close()

    def test_disallowed_browser_origin_is_rejected(self) -> None:
        request = Request(
            f"{self.base_url}/health",
            headers={"Origin": "https://example.invalid"},
            method="GET",
        )
        with self.assertRaises(HTTPError) as captured:
            urlopen(request, timeout=2)
        self.assertEqual(captured.exception.code, 403)
        captured.exception.close()

    def test_unknown_endpoint_returns_404(self) -> None:
        with self.assertRaises(HTTPError) as captured:
            self._post_json("/not-a-route", {"message": "hello"})
        self.assertEqual(captured.exception.code, 404)
        captured.exception.close()


class ProviderGatewayContractTests(unittest.TestCase):
    def test_request_is_trimmed_and_request_id_is_preserved(self) -> None:
        request = validate_chat_request({"message": "  hello  ", "request_id": "request-123"})
        self.assertEqual(request.message, "hello")
        self.assertEqual(request.request_id, "request-123")

    def test_empty_message_is_rejected(self) -> None:
        with self.assertRaises(ProviderError) as captured:
            validate_chat_request({"message": " "})
        self.assertEqual(captured.exception.code, "invalid_message")
        self.assertEqual(captured.exception.status_code, 400)

    def test_default_provider_is_explicitly_a_mock(self) -> None:
        response = complete_chat({"message": "Show me the roadmap"})
        self.assertEqual(response["provider"], "mock")
        self.assertEqual(response["model"], "dis-ai-dev-mock-v1")
        self.assertFalse(response["ai_connected"])
        self.assertTrue(response["message"])

    def test_contract_rejects_mismatched_provider_request_id(self) -> None:
        class BrokenProvider:
            provider = "test"
            model = "broken-test"
            ai_connected = False

            def complete(self, request: ChatRequest) -> ChatResponse:
                return ChatResponse(
                    request_id="different-id",
                    message="not a real answer",
                    provider=self.provider,
                    model=self.model,
                    ai_connected=False,
                )

        with self.assertRaises(ProviderError) as captured:
            complete_chat({"message": "hello", "request_id": "expected-id"}, BrokenProvider())
        self.assertEqual(captured.exception.code, "provider_contract_error")
        self.assertEqual(captured.exception.status_code, 502)

    def test_message_over_limit_is_rejected(self) -> None:
        with self.assertRaises(ProviderError) as captured:
            validate_chat_request({"message": "x" * 4001})
        self.assertEqual(captured.exception.code, "message_too_long")
        self.assertEqual(captured.exception.status_code, 413)


if __name__ == "__main__":
    unittest.main()
