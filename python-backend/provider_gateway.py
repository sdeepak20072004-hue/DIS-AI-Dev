"""Typed provider gateway contracts for DIS AI Dev.

The default provider is deterministic and local-only. It does not call an AI model.
A real provider adapter must implement ChatProvider and pass the same contract tests.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Protocol
from uuid import uuid4

MAX_MESSAGE_LENGTH = 4000
MAX_CONVERSATION_ID_LENGTH = 100
MAX_REQUEST_ID_LENGTH = 100


class ProviderError(Exception):
    """Expected provider/request error safe to return to the UI."""

    def __init__(self, code: str, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


@dataclass(frozen=True)
class ChatRequest:
    """Validated input contract shared by all future providers."""

    message: str
    request_id: str
    conversation_id: str | None = None


@dataclass(frozen=True)
class ChatResponse:
    """Stable output contract returned by every provider adapter."""

    request_id: str
    message: str
    provider: str
    model: str
    ai_connected: bool


class ChatProvider(Protocol):
    """Minimal provider interface; implementations must not leak credentials."""

    provider: str
    model: str
    ai_connected: bool

    def complete(self, request: ChatRequest) -> ChatResponse:
        """Return one complete response. Streaming is a later milestone."""
        ...


def validate_chat_request(payload: object) -> ChatRequest:
    """Validate untrusted JSON before it reaches a provider."""
    if not isinstance(payload, dict):
        raise ProviderError("invalid_request", "JSON body must be an object.")

    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        raise ProviderError("invalid_message", "A non-empty message is required.")

    cleaned_message = message.strip()
    if len(cleaned_message) > MAX_MESSAGE_LENGTH:
        raise ProviderError(
            "message_too_long",
            f"Message must be {MAX_MESSAGE_LENGTH} characters or fewer.",
            413,
        )

    conversation_id = payload.get("conversation_id")
    if conversation_id is not None:
        if not isinstance(conversation_id, str) or not conversation_id.strip():
            raise ProviderError("invalid_conversation_id", "Conversation ID must be a non-empty string.")
        if len(conversation_id) > MAX_CONVERSATION_ID_LENGTH:
            raise ProviderError("invalid_conversation_id", "Conversation ID is too long.")

    request_id = payload.get("request_id")
    if request_id is None:
        request_id = uuid4().hex
    if not isinstance(request_id, str) or not request_id.strip():
        raise ProviderError("invalid_request_id", "Request ID must be a non-empty string.")
    if len(request_id) > MAX_REQUEST_ID_LENGTH:
        raise ProviderError("invalid_request_id", "Request ID is too long.")

    return ChatRequest(
        message=cleaned_message,
        request_id=request_id.strip(),
        conversation_id=conversation_id.strip() if isinstance(conversation_id, str) else None,
    )


def _mock_reply(message: str) -> str:
    """Small deterministic replies used only to test the provider contract."""
    query = message.casefold()
    if any(word in query for word in ("python", "backend", "bridge", "endpoint")):
        return (
            "Python bridge received your message. The provider gateway contract is working, "
            "but this is a deterministic mock response—not an AI-generated answer. "
            "Next, test request validation, provider errors, and the UI's fallback behavior."
        )
    if any(word in query for word in ("git", "commit", "github", "repository", "repo")):
        return (
            "Mock provider response: check the current branch, review git status and the diff, "
            "run the relevant tests, and commit only the files intended for this change. "
            "This is a fixed demonstration response, not an AI model."
        )
    if any(word in query for word in ("roadmap", "milestone", "next", "status")):
        return (
            "DIS AI Dev milestone: the Python bridge is in place. The next target is a tested "
            "provider gateway contract, followed by a real provider adapter with secure "
            "configuration. Streaming, coding tools, and autonomous agents are not implemented. "
            "This is a deterministic mock response."
        )
    return (
        "The local provider gateway received your message and returned a deterministic test "
        "response. No external request was made and no AI model is connected. "
        "A real model adapter will be a separate, explicitly configured milestone."
    )


class MockChatProvider:
    """Default safe provider for local development and deterministic testing."""

    provider = "mock"
    model = "dis-ai-dev-mock-v1"
    ai_connected = False

    def complete(self, request: ChatRequest) -> ChatResponse:
        return ChatResponse(
            request_id=request.request_id,
            message=_mock_reply(request.message),
            provider=self.provider,
            model=self.model,
            ai_connected=self.ai_connected,
        )


def complete_chat(payload: object, provider: ChatProvider | None = None) -> dict[str, object]:
    """Validate a request and serialize a provider's response to a plain dict."""
    request = validate_chat_request(payload)
    selected_provider = provider or MockChatProvider()
    response = selected_provider.complete(request)

    if response.request_id != request.request_id:
        raise ProviderError("provider_contract_error", "Provider returned a mismatched request ID.", 502)
    if not isinstance(response.message, str) or not response.message.strip():
        raise ProviderError("provider_contract_error", "Provider returned an empty response.", 502)
    if not response.provider or not response.model:
        raise ProviderError("provider_contract_error", "Provider metadata is missing.", 502)

    result = asdict(response)
    result["ok"] = True
    return result
