"""Local-only Python helper service for the DIS AI Dev prototype."""
from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 8765
MAX_BODY_BYTES = 4096
MAX_MESSAGE_LENGTH = 1000
SERVICE_NAME = "DIS AI Dev Python helper"

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
}


class PythonHelperHandler(BaseHTTPRequestHandler):
    """Handle health and echo requests from the desktop prototype."""

    server_version = "DISAIPythonHelper/0.1"

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
        self._send_json(403, {"ok": False, "error": "Origin is not allowed"})
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
        if self.path != "/health":
            self._send_json(404, {"ok": False, "error": "Endpoint not found"})
            return
        self._send_json(
            200,
            {
                "ok": True,
                "service": SERVICE_NAME,
                "runtime": "Python",
                "version": sys.version.split()[0],
                "ai_connected": False,
                "mode": "local-only",
            },
        )

    def do_POST(self) -> None:
        if self._reject_disallowed_origin():
            return
        if self.path != "/echo":
            self._send_json(404, {"ok": False, "error": "Endpoint not found"})
            return
        if "application/json" not in self.headers.get("Content-Type", "").lower():
            self._send_json(415, {"ok": False, "error": "Content-Type must be application/json"})
            return
        try:
            body_length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self._send_json(411, {"ok": False, "error": "Content-Length is required"})
            return
        if body_length < 0:
            self._send_json(400, {"ok": False, "error": "Invalid content length"})
            return
        if body_length > MAX_BODY_BYTES:
            self._send_json(413, {"ok": False, "error": "Request body is too large"})
            return
        try:
            payload = json.loads(self.rfile.read(body_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"ok": False, "error": "Request body must be valid JSON"})
            return
        if not isinstance(payload, dict):
            self._send_json(400, {"ok": False, "error": "JSON body must be an object"})
            return
        message = payload.get("message")
        if not isinstance(message, str) or not message.strip():
            self._send_json(400, {"ok": False, "error": "A non-empty message is required"})
            return
        if len(message) > MAX_MESSAGE_LENGTH:
            self._send_json(413, {"ok": False, "error": "Message is too long"})
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

    def log_message(self, format: str, *args: object) -> None:
        # Request logs include method/path/status, never message body contents.
        super().log_message(format, *args)


def make_server(host: str = HOST, port: int = PORT) -> ThreadingHTTPServer:
    """Create the service; port 0 lets the OS choose an unused test port."""
    return ThreadingHTTPServer((host, port), PythonHelperHandler)


def main() -> None:
    server = make_server()
    print(f"{SERVICE_NAME} listening at http://{HOST}:{PORT}", flush=True)
    print("Endpoints: GET /health and POST /echo. Press Ctrl+C to stop.", flush=True)
    print("Local prototype only: no AI provider is connected.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping the Python helper...", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
