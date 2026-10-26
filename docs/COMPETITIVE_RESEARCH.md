# Competitive research: Cursor and Stonic AI

**Reviewed:** 26 October 2026  
**Purpose:** Product planning for DIS AI Dev. This is a summary of public vendor documentation and marketing pages, not an independent benchmark or a claim of feature parity.

## Executive summary

Cursor and Stonic AI solve different primary problems:

- **Cursor** is an AI coding environment. Its public documentation describes codebase search/context, agent modes, multi-file edits, terminal execution, change review and cloud/background agents.
- **Stonic AI** is a Windows desktop AI companion. Its public site emphasizes voice, character/personality, memory and PC assistance. Its release notes describe a computer agent with a visible step overlay and Stop control in version 3.0.2.
- **DIS AI Dev** aims to combine a developer workspace with a broader desktop assistant over time. That creates a wider scope than copying either product's main interface. We should implement each capability as a tested module and keep the UI honest about what is and is not connected.

## Public feature comparison

| Area | Cursor public materials | Stonic AI public materials | DIS AI Dev current evidence |
|---|---|---|---|
| Primary purpose | AI coding workflow | Desktop AI companion and PC assistance | Early developer-workspace prototype |
| Codebase understanding | Codebase indexing/search and contextual agent work | Not a primary advertised coding-workflow focus | Basic read-only literal search is proposed in PR #1; not merged into main |
| Multi-file code edits | Agent can edit multiple files and review diffs | Not advertised as a core code-editor workflow | Not implemented |
| Terminal use | Agent can run terminal commands, with controls/settings | Computer agent can operate apps through visible steps | No AI terminal execution |
| Background/cloud agents | Cloud Agents can work in isolated remote environments and create PRs | Not the same core concept as Cursor cloud coding agents | Not implemented |
| Voice and personality | Not its main differentiator | Core advertised experience | Not implemented |
| Persistent memory | Chat/context features exist; inspect current docs for exact behavior | Memory is a core advertised feature | Not implemented |
| PC-level actions | Coding workflow and developer tools | Desktop/computer agent, visible activity and Stop control in current release notes | Not implemented |
| Current DIS AI Dev status | — | — | Electron + React + TypeScript shell; rule-based Local Demo; Python local service with health/echo; no AI provider |

## Research sources

### Cursor (official)

- Agent mode: https://prod.cursor.com/help/ai-features/agent
- Cursor Agent overview: https://prod.cursor.com/docs/agent/overview
- Background / Cloud Agents: https://prod.cursor.com/help/ai-features/background-agents
- Privacy and security: https://docs.cursor.com/account/privacy
- CLI and command approval: https://docs.cursor.com/en/cli/using

The key product pattern to learn from is the agent loop: inspect context, plan work, use scoped tools, show diffs, run checks and report evidence. Cloud execution adds isolation and secret-handling requirements; it should not be copied as an unrestricted local shell.

### Stonic AI (official)

- Product overview: https://stonicai.com/
- Public release notes: https://stonicai.com/releases
- Terms: https://stonicai.com/terms/

The product pattern to learn from is a desktop-resident assistant with a clear character, voice/memory affordances, and visible progress/stop controls for computer actions. Public marketing and release notes can change; verify current details before implementation or purchasing decisions.

## Product strategy for DIS AI Dev

We should not claim to be "better than Cursor and Stonic" until we can show repeatable tests on equivalent tasks. A better initial strategy is a differentiated, local-first developer workspace that can grow into an opt-in desktop assistant.

### Milestone order

1. **Local project context:** read-only code/text search, fixed repository root, excludes for generated and secret-like files, bounded results and tests. Current feature branch proposes this baseline; it is not merged yet.
2. **Provider gateway:** typed request/response, mock provider, explicit configuration, timeouts, cancellation and secret redaction. No API key belongs in source control or renderer code.
3. **Real chat:** stream responses, preserve drafts on errors, support cancel/retry and label which provider is connected.
4. **Code review workflow:** preview context before sharing it, propose edits as diffs, apply only after user approval, and preserve recovery information.
5. **Safe tools:** no shell execution by default; narrow allow-listed actions, explicit consent, timeouts, output caps and redacted audit events.
6. **User-controlled memory and knowledge:** inspect, edit, export and delete stored information; attribute retrieved sources and define retention.
7. **Desktop assistant capabilities:** voice/device access and PC actions only after explicit permissions, visible active-state indicators, stop/cancel controls and reliable error paths.
8. **Cloud/multi-agent work:** treat as a separate architecture milestone requiring sandboxing, access control, secret management, cost controls and reproducible evidence.

## Engineering rules

- A UI card is not evidence that a capability exists.
- Keep the renderer separate from secrets and broad operating-system access.
- Prefer read-only operations before write or execute permissions.
- Require review/approval for code changes and consequential system actions.
- Test both successful and rejected requests, including path traversal, secret exclusion, size limits and service unavailability.
- For each release, report implemented, locally tested, CI-tested, experimental and planned capabilities separately.

## Honest current position

DIS AI Dev is an early-stage prototype. It is not yet a Cursor replacement or a Stonic AI replacement. The Python helper currently verified on the main branch provides local health and echo endpoints; codebase search is the next feature under review. Real model calls, streaming chat, autonomous coding, persistent memory, voice and computer control remain future work.
