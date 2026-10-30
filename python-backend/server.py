"""Local-only Python helper and provider gateway for DIS AI Dev."""
from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

from workspace_index import PROJECT_ROOT, search_workspace, summarize_workspace

from provider_gateway import ProviderError, complete_chat

HOST = "127.0.0.1"
PORT = 8765
MAX_BODY_BYTES = 16_384
MAX_ECHO_MESSAGE_LENGTH = 1000
SERVICE_NAME = "DIS AI Dev Python helper"

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
}


class PythonHelperHandler(BaseHTTPRequestHandler):
    """Handle local health, echo, and mock-chat requests."""

    server_version = "DISAIPythonHelper/0.2"

    def _origin_is_allowed(self) -> bool:
        origin = self.headers.get("Origin")
        return origin is None or origin in ALLOWED_ORIGINS

    def _send_json(self, status_code: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(body)

    def _reject_disallowed_origin(self) -> bool:
        if self._origin_is_allowed():
            return False
        self._send_json(403, {"ok": False, "error": {"code": "origin_not_allowed", "message": "Origin is not allowed."}})
        return True

    def do_OPTIONS(self) -> None:
        if self._reject_disallowed_origin():
            return
        self.send_response(204)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "300")
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()

    def do_GET(self) -> None:
        if self._reject_disallowed_origin():
            return
        request_url = urlsplit(self.path)

        if request_url.path == "/health":
            self._send_json(
                200,
                {
                    "ok": True,
                    "service": SERVICE_NAME,
                    "runtime": "Python",
                    "version": sys.version.split()[0],
                    "ai_connected": False,
                    "mode": "local-only",
                    "provider_gateway": "mock",
                },
            )
            return

        if request_url.path == "/workspace/summary":
            self._send_json(200, summarize_workspace(PROJECT_ROOT))
            return

        if request_url.path == "/workspace/search":
            query = parse_qs(
                request_url.query,
                keep_blank_values=True,
            ).get("q", [""])[0]

            try:
                payload = search_workspace(query, PROJECT_ROOT)
            except ValueError as error:
                self._send_json(
                    400,
                    {"ok": False, "error": str(error)},
                )
                return

            self._send_json(200, payload)
            return

        self._send_json(
            404,
            {
                "ok": False,
                "error": {
                    "code": "not_found",
                    "message": "Endpoint not found.",
                },
            },
        )

    def do_POST(self) -> None:
        if self._reject_disallowed_origin():
            return
        if self.path not in {"/echo", "/chat"}:
            self._send_json(404, {"ok": False, "error": {"code": "not_found", "message": "Endpoint not found."}})
            return
        if "application/json" not in self.headers.get("Content-Type", "").lower():
            self._send_json(415, {"ok": False, "error": {"code": "unsupported_media_type", "message": "Content-Type must be application/json."}})
            return
        try:
            body_length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self._send_json(411, {"ok": False, "error": {"code": "length_required", "message": "Content-Length is required."}})
            return
        if body_length < 0:
            self._send_json(400, {"ok": False, "error": {"code": "invalid_length", "message": "Invalid content length."}})
            return
        if body_length > MAX_BODY_BYTES:
            self._send_json(413, {"ok": False, "error": {"code": "body_too_large", "message": "Request body is too large."}})
            return
        try:
            payload = json.loads(self.rfile.read(body_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"ok": False, "error": {"code": "invalid_json", "message": "Request body must be valid JSON."}})
            return
        if not isinstance(payload, dict):
            self._send_json(400, {"ok": False, "error": {"code": "invalid_request", "message": "JSON body must be an object."}})
            return

        if self.path == "/echo":
            message = payload.get("message")
            if not isinstance(message, str) or not message.strip():
                self._send_json(400, {"ok": False, "error": {"code": "invalid_message", "message": "A non-empty message is required."}})
                return
            if len(message) > MAX_ECHO_MESSAGE_LENGTH:
                self._send_json(413, {"ok": False, "error": {"code": "message_too_long", "message": "Message is too long."}})
                return
            self._send_json(
                200,
                {
                    "ok": True,
                    "echo": message,
                    "processed_by": "Python standard-library helper",
                    "ai_connected": False,
                },
            )
            return

        try:
            result = complete_chat(payload)
        except ProviderError as error:
            self._send_json(
                error.status_code,
                {
                    "ok": False,
                    "error": {"code": error.code, "message": error.message},
                    "ai_connected": False,
                },
            )
            return
        self._send_json(200, result)

    def log_message(self, format: str, *args: object) -> None:
        # Log method/path/status only; never log prompts, response bodies, or secrets.
        super().log_message(format, *args)


def make_server(host: str = HOST, port: int = PORT) -> ThreadingHTTPServer:
    """Create the service; port 0 lets the OS choose an unused test port."""
    return ThreadingHTTPServer((host, port), PythonHelperHandler)


def main() -> None:
    server = make_server()
    print(f"{SERVICE_NAME} listening at http://{HOST}:{PORT}", flush=True)
    print("Endpoints: GET /health, POST /echo, and POST /chat. Press Ctrl+C to stop.", flush=True)
    print("The chat endpoint uses a deterministic mock provider; no AI provider is connected.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping the Python helper...", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
