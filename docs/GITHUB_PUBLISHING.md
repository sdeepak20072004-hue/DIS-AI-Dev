# Publishing DIS AI Dev on GitHub

This guide publishes the local project from `C:\Projects\DIS-AI-Dev`. Check every command result; do not paste access tokens into the terminal transcript or commit history.

## 1. Verify the local project

```powershell
Set-Location "C:\Projects\DIS-AI-Dev"
npm run typecheck
npm run lint
git status --short --branch
```

If the app is running, inspect the screen manually. If lint reports existing starter-template issues, resolve or document them before claiming lint passes.

## 2. Initialize Git if needed

```powershell
Test-Path ".git"
```

If the result is `False`, initialize the repository:

```powershell
git init -b main
```

If it is `True`, keep the existing history. Do not delete `.git`, run `git reset --hard` or overwrite remotes without understanding their state.

Review what will be tracked:

```powershell
git status --short
git check-ignore -v node_modules .env .env.local
```

If any real `.env` file or credentials appear as staged/tracked, stop and remove them from Git tracking before publishing. Do not add build output, `node_modules`, local tokens, private keys or private project files.

## 3. Create the GitHub repository

In GitHub, create a repository named **`DIS-AI-Dev`** under the intended account. Choose **Public** only after checking there are no secrets or private files. Because a local project already exists, leave GitHub's “Add a README”, `.gitignore` and license options unchecked; this update pack provides those project files. A license is intentionally not selected yet.

Copy the repository's HTTPS URL from GitHub. Do not guess the account/owner name.

## 4. Create a reviewable first commit

```powershell
git switch -c feat/dashboard-foundation
git add README.md CHANGELOG.md CONTRIBUTING.md SECURITY.md .gitignore docs .github src/renderer/src/App.tsx src/renderer/src/assets/base.css src/renderer/src/assets/main.css
git status --short
git diff --cached --stat
git diff --cached --check
```

Read the staged file list. Only if it contains the intended app/documentation files and no secrets, commit:

```powershell
git commit -m "feat: add DIS AI Dev dashboard foundation"
```

Push the branch to the remote only after adding the correct remote in the next step. A branch-first workflow gives you room to review before merging into `main`.

## 5. Connect and push

Replace the placeholder with the HTTPS URL copied from GitHub:

```powershell
git remote -v
```

If no `origin` is listed:

```powershell
git remote add origin https://github.com/<your-github-username>/DIS-AI-Dev.git
git push -u origin feat/dashboard-foundation
```

If `origin` already exists, inspect it and confirm it points to the intended repository before pushing. Never paste a token into the URL. Git Credential Manager/browser authentication is preferred.

Open the pushed repository in the browser, confirm the README renders correctly, and verify the commit is visible. Then create a pull request from `feat/dashboard-foundation` into `main`; after review, merge it and use `main` as the portfolio-facing default branch. If you prefer a single first commit on `main`, make that choice deliberately after checking repository state rather than force-pushing.

## 6. Keep history tidy

For later work:

```powershell
git switch -c feat/next-small-change
# edit and test files
git status --short
git diff
git add <specific-files>
git diff --cached --check
git commit -m "feat: describe the small change"
git push -u origin feat/next-small-change
```

Do not stage everything blindly when working across multiple projects. Use `git status` and `git diff` before every commit. Do not rewrite public history with force-push unless there is a specific, reviewed reason.
