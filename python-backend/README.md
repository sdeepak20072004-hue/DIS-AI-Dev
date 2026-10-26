# Python helper (local development prototype)

This local Python standard-library service supports the DIS AI Dev learning prototype. No pip install is required.

## Endpoints

- GET /health reports the service status and Python version.
- POST /echo verifies a small JSON round trip from the desktop UI to Python.
- GET /workspace/summary counts eligible code/text files under this repository and returns a few relative sample paths.
- GET /workspace/search?q=term performs case-insensitive literal search and returns bounded file/line/snippet results.

The service binds to 127.0.0.1 only. Project search is read-only, scoped to the repository containing this service, and skips common generated/dependency folders, environment files, credentials, key files, symlinks and oversized files. It does not persist an index or send project contents to a model/provider. This is deterministic line-based search, not semantic search and not an AI feature.

## Run it on Windows

Open a separate PowerShell 7 terminal:

    cd C:\Projects\DIS-AI-Dev
    py -3 .\python-backend\server.py

Keep this terminal open while using the desktop app. Stop it with Ctrl+C.

## Run automated tests

    cd C:\Projects\DIS-AI-Dev
    py -3 -m unittest discover -s .\python-backend -p "test_*.py" -v

## Manual examples

    Invoke-RestMethod -Uri "http://127.0.0.1:8765/health"
    Invoke-RestMethod -Uri "http://127.0.0.1:8765/workspace/summary"
    Invoke-RestMethod -Uri "http://127.0.0.1:8765/workspace/search?q=PythonHelperHandler"

Search text must contain 2–100 characters. Results are limited to 30 snippets; individual files larger than 256 KiB are skipped. This is a simple line-based search, not semantic/vector search.

## Beginner notes

- ThreadingHTTPServer handles local HTTP requests.
- GET retrieves read-only status or search results.
- Query parameters pass small values such as the search term.
- JSON lets TypeScript and Python exchange structured data.
- 127.0.0.1 is this computer's loopback address.
- unittest runs repeatable checks without installing another test package.
