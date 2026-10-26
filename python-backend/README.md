# Python helper (learning milestone)

This optional local service is the first Python component in DIS AI Dev. It uses only Python's standard library, so no pip install is required.

## What it does

- GET /health reports service status, the Python version, and ai_connected=false.
- POST /echo accepts a small JSON message and returns it from Python to verify the TypeScript-to-Python bridge.
- It binds to 127.0.0.1, so it listens on this computer only.
- It does not call an AI model, run shell commands, read project files, or save messages to disk.

## Run it on Windows

Open a second PowerShell 7 window:

    cd C:\Projects\DIS-AI-Dev
    py -3 .\python-backend\server.py

Keep this terminal open while using the desktop app. Stop the service with Ctrl+C in that terminal.

## Run automated tests

In a separate PowerShell window:

    cd C:\Projects\DIS-AI-Dev
    py -3 -m unittest discover -s .\python-backend -p "test_*.py" -v

## Test the health endpoint manually

With the service running, use another PowerShell window:

    Invoke-RestMethod -Uri "http://127.0.0.1:8765/health"

A successful response includes ok=True, a Python version, and ai_connected=False.

## Beginner notes

- ThreadingHTTPServer handles requests using Python's standard library.
- GET /health checks whether the service is reachable.
- POST /echo receives JSON data in the request body.
- JSON lets TypeScript and Python exchange structured data.
- 127.0.0.1 is the loopback address for this computer.
- Port 8765 is where the prototype listens.
- unittest runs repeatable checks without installing a test package.
