# Product Benchmark Notes

Research checked: 29 October 2026. This document summarizes public product documentation and is a direction-setting aid, not a claim that DIS AI Dev already implements these capabilities. Competitor products evolve continuously; re-check their current docs before implementation decisions.

## Cursor: coding workflow benchmark

Public Cursor documentation describes a code-oriented agent that can search and understand a codebase, plan and build features, edit multiple files, run terminal commands, and work through diffs/review. Its documentation also describes reusable rules, external tool integrations such as MCP, and cloud/background agents. Its security docs note that model output may be wrong or malicious; consequential tool calls have approval and execution controls.

Sources:
- https://cursor.com/docs
- https://cursor.com/docs/agent/overview
- https://cursor.com/docs/agent/security
- https://cursor.com/docs/agent/review
- https://cursor.com/docs/rules

## Stonic AI: desktop companion benchmark

Stonic AI publicly positions itself as a Windows desktop character/assistant focused on voice, persona, memory, skills, and help with everyday PC actions. Its public page also describes world-monitor views and a remote calling experience. Its FAQ explicitly distinguishes the product from a business-automation or professional coding-work tool. Release notes describe visible agent activity and a stop action as part of its desktop-agent experience.

Sources:
- https://stonicai.com/
- https://stonicai.com/releases
- https://stonicai.com/terms/

## DIS AI Dev strategy

Do not simply replicate either product's UI. Build a development workspace whose capabilities are observable, tested, and permissioned:

1. Codebase Q&A with file/line citations and an explicit context preview.
2. A typed multi-provider gateway with clear disconnected, mock, connected, and error states.
3. Streaming responses with retry/cancel and deterministic contract tests.
4. Proposed code edits shown as diffs; apply only after explicit user approval.
5. A project-scoped terminal runner disabled by default, with per-command approval, timeout, output limits, cancellation, and redacted audit events.
6. User-controlled memory and knowledge with inspect, edit, export, and delete flows.
7. Optional voice/persona layer after core reliability and privacy controls.
8. Desktop automation only after visible step status, an always-available stop control, least privilege, and action logs.

## What “advanced” must mean here

A feature list alone is not evidence of superiority. Each milestone needs measurable acceptance criteria: task-success tests, regression tests, latency and failure measurements, clear permission boundaries, and recovery from cancelled/failed operations. We should claim superiority only after a repeatable benchmark shows better results on a defined task set.
