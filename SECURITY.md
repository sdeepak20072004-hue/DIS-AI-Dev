# Security Policy

## Project maturity

DIS AI Dev is an early-stage local UI prototype and is **not currently intended for sensitive or production workloads**. Security principles documented here describe requirements and plans; they are not proof that every control has been implemented.

## Supported versions

There are no production releases or formal supported-version policy yet. Please reproduce issues against the latest public default branch where possible.

## Reporting a vulnerability

Please do not publish exploit details, secrets or private data in a public issue. Use GitHub’s private vulnerability reporting feature if it is enabled for the repository; otherwise contact the maintainer privately through a verified contact method listed on the maintainer’s GitHub profile. Do not include working API keys, passwords, personal files or production credentials in a report.

A useful report includes the affected version/commit, a concise impact statement, safe reproduction steps and any relevant sanitized logs.

## Security requirements for planned capabilities

- Keep Electron renderer Node integration disabled and context isolation enabled.
- Expose a narrow, typed preload/IPC surface and validate all IPC payloads.
- Limit file operations to explicitly approved workspace roots.
- Require human approval for shell commands and consequential external actions.
- Present diffs before applying code edits and preserve rollback/recovery paths.
- Do not persist provider secrets in renderer state, README examples or Git history.
- Request camera and microphone permissions only when clearly needed; provide visible usage status and an easy disable path.
- Redact secrets from logs and diagnostics.
- Give users visibility and deletion controls for future conversation, memory and knowledge data.
