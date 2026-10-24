# Contributing to DIS AI Dev

Thanks for taking the time to improve DIS AI Dev. The project is early-stage; accuracy about what works is more valuable than feature count.

## Before starting

1. Search existing issues and open a discussion/issue for substantial changes.
2. Keep changes focused. Avoid mixing UI redesigns, architecture changes and dependency upgrades in one pull request.
3. Never add secrets, private user data, production credentials or large generated files.
4. Do not claim a feature works unless its behavior can be demonstrated or tested.

## Local workflow

```powershell
git switch -c feat/short-description
npm install
npm run typecheck
npm run lint
npm run dev
```

Run the commands supported by the current package scripts. If a check fails due to an environment or dependency issue, include the exact non-secret error in your PR notes rather than hiding it.

## Pull request checklist

- [ ] The purpose and user-visible effect are clear.
- [ ] Related docs/roadmap entries are updated.
- [ ] Typecheck and lint were run, or failures are reported accurately.
- [ ] New behavior has a manual test note or automated test when applicable.
- [ ] No secrets, `.env` files, credentials, build outputs or personal data are included.
- [ ] Permissions and trust boundaries were considered for tools, IPC, files, network, microphone and camera.
- [ ] UI states include empty/loading/error states where relevant.
- [ ] README claims match the implementation.

## Commit style

Use a short imperative subject with a conventional prefix, for example:

- `feat: add workspace navigation shell`
- `fix: handle provider connection failure`
- `docs: clarify first-run setup`
- `test: cover safe command approval`

Small commits are easier to understand and revert.
