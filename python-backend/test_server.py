"""Standard-library tests for the local DIS AI Dev Python helper."""
from __future__ import annotations

import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen

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

    def test_health_endpoint_reports_python_and_no_ai_provider(self) -> None:
        with urlopen(f"{self.base_url}/health", timeout=2) as response:
            self.assertEqual(response.status, 200)
            payload = json.loads(response.read().decode("utf-8"))
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["runtime"], "Python")
        self.assertFalse(payload["ai_connected"])
        self.assertTrue(payload["version"])

    def test_echo_endpoint_returns_message_from_python(self) -> None:
        body = json.dumps({"message": "Hello from test"}).encode("utf-8")
        request = Request(
            f"{self.base_url}/echo",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(request, timeout=2) as response:
            payload = json.loads(response.read().decode("utf-8"))
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["echo"], "Hello from test")
        self.assertEqual(payload["processed_by"], "Python standard-library helper")

    def test_invalid_payload_is_rejected(self) -> None:
        body = json.dumps({"other": "missing message"}).encode("utf-8")
        request = Request(
            f"{self.base_url}/echo",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(HTTPError) as captured:
            urlopen(request, timeout=2)
        self.assertEqual(captured.exception.code, 400)
        captured.exception.close()

    def test_workspace_summary_returns_bounded_metadata(self) -> None:
        with urlopen(f"{self.base_url}/workspace/summary", timeout=3) as response:
            payload = json.loads(response.read().decode("utf-8"))
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["workspace_name"], "DIS-AI-Dev")
        self.assertTrue(payload["read_only"])
        self.assertFalse(payload["persistent_index"])
        self.assertNotIn(str(__import__("pathlib").Path(__file__).resolve().parents[1]), str(payload))

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


if __name__ == "__main__":
    unittest.main()
