# Provider Gateway v0.1

## Purpose

The gateway separates the chat UI from provider-specific behavior. The current implementation is deliberately a deterministic mock so the request, response, validation, and error contracts can be tested without a model account, API key, network request, or usage cost.

## Current request contract

\`\`\`json
{
  "message": "Explain the Python bridge",
  "request_id": "optional-client-correlation-id",
  "conversation_id": "optional-local-conversation-id"
}
\`\`\`

- \`message\` is required, trimmed, and limited to 4,000 characters.
- \`request_id\` is optional; when absent, the gateway generates one.
- \`conversation_id\` is optional and limited to 100 characters.
- The HTTP request body is limited to 16 KiB.

## Current response contract

\`\`\`json
{
  "ok": true,
  "request_id": "a-generated-or-client-supplied-id",
  "message": "A deterministic mock response.",
  "provider": "mock",
  "model": "dis-ai-dev-mock-v1",
  "ai_connected": false
}
\`\`\`

The \`provider\`, \`model\`, and \`ai_connected\` fields are intentional capability indicators. A real adapter must never masquerade as the mock or claim success while disconnected.

## Error contract

Errors use a stable JSON shape:

\`\`\`json
{
  "ok": false,
  "error": {
    "code": "invalid_message",
    "message": "A non-empty message is required."
  },
  "ai_connected": false
}
\`\`\`

Current codes include \`invalid_request\`, \`invalid_message\`, \`message_too_long\`, \`invalid_request_id\`, \`invalid_conversation_id\`, \`provider_contract_error\`, \`origin_not_allowed\`, and \`not_found\`. Error text is designed for display; logs must not include the user prompt, response body, or credentials.

## Architecture boundary

- The React UI calls the local Python service at \`127.0.0.1:8765/chat\`.
- \`server.py\` validates HTTP input and delegates to \`provider_gateway.py\`.
- \`ChatProvider\` defines the replaceable provider interface.
- \`MockChatProvider\` is the only configured implementation in this milestone.
- \`ai_connected\` remains \`false\`; no remote AI API is called and no secret is read.
- If the Python service is not available, the UI falls back to its clearly labeled Local Demo response.

## Not implemented

Streaming, cancellation tokens, retries, rate-limit handling, conversation persistence, real model adapters, key storage, and production IPC integration are not part of this milestone. Do not describe the mock as AI chat or this local development server as production-secure.

## Acceptance checks

Run these from the repository root:

\`\`\`powershell
py -3 -m unittest discover -s .\\python-backend -p "test_*.py" -v
npm run format
npm run typecheck
npm run lint
npm run build
\`\`\`

Then start \`py -3 .\\python-backend\\server.py\`, run \`npm run dev\` in another terminal, and send a chat message. The assistant should show a \`Python mock provider\` label when \`/chat\` succeeds, or \`Local demo fallback\` when the helper is unavailable.
