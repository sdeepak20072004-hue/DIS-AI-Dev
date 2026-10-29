# DIS AI Dev

**A desktop-first AI development workspace — built in the open, one verified milestone at a time.**

> Status: early-stage desktop prototype. The shell, local Python bridge and deterministic mock-provider chat flow are implemented. Real AI model/provider connections, coding-agent actions, voice, camera, persistent memory and workflow execution remain planned.

![Electron](https://img.shields.io/badge/Electron-desktop-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/status-early%20prototype-9B8AFB)
![License](https://img.shields.io/badge/license-not%20decided-lightgrey)

DIS AI Dev is a personal project exploring how a secure desktop workspace could bring together AI-assisted development, project context, agents and practical automation. The goal is to grow deliberately: first a maintainable desktop foundation, then testable modules with clear permission boundaries.

## At a glance

- **Desktop shell:** Electron with the electron-vite starter.
- **Renderer:** React + TypeScript.
- **Current experience:** interactive dark dashboard shell, navigation, status cards, roadmap placeholders and capability-boundary messaging.
- **Local-first direction:** secrets should stay out of source control; tool and device permissions should be explicit.
- **Development model:** small milestones, reproducible commands, visible checks and honest release notes.

## What works today

- [x] Electron desktop app starts in local development mode.
- [x] React + TypeScript renderer and TypeScript checks.
- [x] Navigation across Overview, AI Workspace, Code Studio, Agents, Knowledge, Memory, Activity, Integrations, Roadmap and Settings screens.
- [x] Responsive dark UI shell with honest “not connected” states.
- [x] Local Demo fallback with in-memory session state and clearly labeled rule-based replies (no model provider connected).
- [x] Python mock-provider gateway with typed request/response contracts, structured errors and automated tests (no external AI model connected).
- [x] Initial engineering, security and roadmap documentation.

## Python helper (local development prototype)

DIS AI Dev includes an optional Python standard-library sidecar for learning and bridge verification. It provides GET /health and POST /echo, listens only on 127.0.0.1:8765, and does not call an AI model, execute shell commands, read project files, or persist messages. It is not an AI provider integration.

Start it in a separate PowerShell terminal:

    py -3 .\python-backend\server.py

Run the built-in tests in another terminal:

    py -3 -m unittest discover -s .\python-backend -p "test_*.py" -v

In AI Workspace, select Test Python Bridge to test both endpoints. Stop the Python service with Ctrl+C in its terminal.

## What is not implemented yet

These are planned, not working features in the current UI prototype:

- Connected AI model/provider calls, API-key handling and streaming conversations. The current workspace replies with fixed local demo rules only.
- Autonomous coding-agent behavior, terminal execution, file edits or automatic commits.
- Persistent chat history, memory, retrieval or document indexing.
- Speech-to-text, text-to-speech, wake-word detection or camera-based features.
- Remote accounts, cloud sync, production telemetry, user management or multi-device support.

The interface intentionally labels these modules as placeholders. A visual card is not evidence that a backend feature exists.

## Screens and modules

| Module         | Current state  | Intended direction                                          |
| -------------- | -------------- | ----------------------------------------------------------- |
| Overview       | UI available   | Workspace status, milestones and safe next actions          |
| AI Workspace   | Python mock gateway | Deterministic mock responses; real provider and streaming planned |
| Code Studio    | Placeholder UI | Project context, reviewed diffs and approval-gated commands |
| Agents & Tasks | Placeholder UI | Explicit agent contracts, task state and approvals          |
| Knowledge Base | Placeholder UI | User-approved sources, citations and scoped retrieval       |
| Memory         | Placeholder UI | Inspectable, editable and deletable user-controlled memory  |
| Activity Log   | Placeholder UI | Structured events with secret redaction                     |
| Integrations   | Placeholder UI | Explicit adapters and secure configuration                  |
| Roadmap        | UI available   | Public milestones tied to verified behavior                 |

## Screenshots

A screenshot captured from the running desktop app will be added at docs/screenshots/dashboard.png after visual verification. See docs/screenshots/README.md for capture instructions. No mock image is presented as a real application screenshot.

## Technology choices

- [Electron](https://www.electronjs.org/) for the desktop container.
- [electron-vite](https://electron-vite.org/) for the desktop development/build workflow.
- [React](https://react.dev/) for the renderer UI.
- [TypeScript](https://www.typescriptlang.org/) for typed application code.
- CSS variables and local styles for the first dashboard pass; no extra UI/icon dependency is required for this screen.

The future backend and provider design is not locked. A planned integration with the separate DIS AI platform must begin by inspecting its actual API contracts. It must not assume that unreleased endpoints exist.

## Getting started

### Requirements

- Windows 10/11 (initial development target).
- Node.js and npm compatible with the installed project dependencies.
- Git for version control.

### Install

```powershell
git clone https://github.com/sdeepak20072004-hue/DIS-AI-Dev.git
cd DIS-AI-Dev
npm install
npm run typecheck
npm run dev
```

If the Electron binary download fails on a network that can reach npm but cannot reach GitHub Releases, test the official download path/network first. For this project’s verified setup, the following session-scoped mirror setting allowed Electron to download; it does not permanently change npm configuration:

```powershell
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
npm install
```

Use only a trusted network and review the destination before relying on any mirror. Do not paste API keys or private tokens into terminal transcripts or source files.

### Common commands

```powershell
npm run dev          # Run the desktop app in development mode
npm run typecheck    # Check main/preload and renderer TypeScript
npm run lint         # Run ESLint
npm run build        # Typecheck and build distributable app files
```

## Architecture principles

1. **Keep trust boundaries explicit.** Treat renderer input as untrusted. Use narrow, typed IPC rather than exposing Node APIs to UI code.
2. **Ask before powerful actions.** File changes, shell commands, external calls and device access need clear scope and user approval.
3. **Separate UI from providers.** Model-specific behavior should live behind an adapter/gateway rather than being spread through components.
4. **Make state visible.** Show whether a service is connected, a task is running, an approval is waiting or a tool has failed.
5. **Design for deletion and recovery.** Memory and project context should be inspectable and removable; file changes should have diffs and recovery paths.
6. **Prove before announcing.** Tests, screenshots, sample outputs and release notes should support claims about working features.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/GITHUB_PUBLISHING.md`](docs/GITHUB_PUBLISHING.md) for the first public-repository workflow.

## Security and privacy

- Never commit `.env` files, API keys, access tokens, personal data or local credentials.
- Keep Electron `nodeIntegration` disabled and `contextIsolation` enabled; expose only minimal typed APIs via preload.
- Do not run model-generated shell commands automatically.
- Show previews/diffs before applying file edits and require approval for consequential actions.
- Request camera/microphone permission only when a specific feature is in active use, with a visible indicator and clear off switch.
- Avoid logging secrets, full private prompts or sensitive file contents.
- Report security concerns privately as described in [`SECURITY.md`](SECURITY.md).

These are development requirements, not a claim that every future control is already implemented. Review the actual Electron configuration before describing this app as production-secure.

## Contributing

This project is currently maintained as a learning and portfolio project. Small, focused contributions are easiest to review. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md), create a branch, run typecheck/lint where possible and explain what was verified.

## Roadmap

1. **Foundation:** stable local app, navigation shell, README, Git history and baseline checks.
2. **Design system:** accessibility, compact/responsive layouts, loading/empty/error states and component cleanup.
3. **Provider gateway:** typed provider interface, safe config, cancellation and predictable error handling.
4. **Streaming chat:** token streaming, conversation lifecycle and useful failure recovery.
5. **Coding workflow:** workspace scoping, diff review, approval-gated commands and audit events.
6. **Memory and knowledge:** explicit consent, source attribution, retention and deletion.
7. **Voice/device features:** opt-in speech and camera work only after privacy and performance tests.
8. **DIS AI integration:** adapter-backed integration only after the separate platform’s real API contract is verified.

Roadmap order may change as tests and real constraints are discovered. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for acceptance criteria.

## Project status and transparency

This repository is a work in progress. Do not use the project as a security boundary for sensitive workloads yet. There is no production release, no hosted AI service, no verified benchmark suite and no supported update channel in this prototype.

## License

No open-source license has been selected yet. Until a license is added, do not assume others have permission to redistribute or create derivative works. Choose and add a license before inviting public contributions under open-source terms.

---

Built by Deepak as an iterative engineering project. Ideas are welcome through GitHub Issues; claims about working functionality should always match the code in the repository.
