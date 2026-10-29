# Roadmap

This roadmap is a planning document. Milestones are considered complete only when the behavior exists in the repository and can be checked; a visual placeholder does not count as a working backend feature.

## M0 — Desktop foundation

- [x] Electron + React + TypeScript scaffold runs locally.
- [x] TypeScript checks passed in the local setup.
- [ ] Dashboard update merged and smoke-tested on the target Windows machine.
- [ ] Initial Git history and public repository configured.

**Acceptance:** app launches from a clean checkout, core checks run and first-run instructions match reality.

## M1 — Dashboard and public project hygiene

- [x] Initial responsive dashboard shell and navigation states.
- [x] Honest disconnected/placeholder states.
- [x] README, architecture, roadmap, contributing and security notes.
- [ ] Capture an actual screenshot from the app and add it to the repository.
- [ ] Review keyboard navigation, contrast, console warnings and narrow-window layout.

**Acceptance:** UI works without provider credentials, navigation is usable, docs state limitations accurately and no generated secret is tracked.

## M2 — UI quality and baseline checks

- [ ] Extract repeatable components and typed navigation metadata.
- [ ] Add lightweight tests for navigation and empty states.
- [ ] Document exact Electron security settings and review IPC exposure.
- [ ] Add reproducible lint/typecheck/build checks to CI.

## M3 — Provider gateway

- [x] Define typed non-streaming request/response and structured error contracts for mock requests.
- [x] Implement a deterministic mock provider and HTTP contract tests before any real API provider.
- [ ] Define secure configuration and secret-redaction rules for real provider credentials.
- [ ] Define streaming and cancellation contracts.
- [ ] Add provider timeouts, retry policy where appropriate and rate-limit feedback.

Current boundary: only the mock provider is active; ai_connected remains false. The UI calls the local Python service during development and falls back to the Local Demo response if it is unavailable.

## M4 — Streaming chat

- [ ] Message lifecycle and conversation state.
- [ ] Stream partial assistant output and support cancel/retry.
- [ ] Display provider errors and preserve useful user input after failures.
- [ ] Test with deterministic mocked responses.

## M5 — Coding workflow

- [ ] Read-only project explorer scoped to a chosen root.
- [ ] Context preview before sending code to a provider.
- [ ] Proposed patches shown as diffs and applied only after explicit approval.
- [ ] Command execution disabled by default; each allowed run is reviewed, scoped, timed and logged.

## M6 — Memory and knowledge

- [ ] Define storage model and migration plan.
- [ ] Clear source attribution for indexed content.
- [ ] User controls for inspect, edit, export and delete.
- [ ] Retention and secret-redaction behavior tested.

## M7 — Voice and camera

- [ ] Research/benchmark suitable on-device and provider options.
- [ ] Explicit permission requests and visible active-use indicators.
- [ ] Start/stop, cancel, error and device-unavailable flows.
- [ ] Avoid face identification by default; document what is and is not processed.

## M8 — DIS AI integration

- [ ] Inspect the separate platform’s actual API routes, auth and contracts.
- [ ] Write an adapter and contract tests from verified endpoints.
- [ ] Add a mock/staging path and avoid hard-coded secrets.
- [ ] Publish an integration note with actual limitations.

## Release discipline

Every release note should separate implemented, tested, experimental and planned features. No feature should be called secure, real-time, autonomous or production-ready without appropriate evidence.
