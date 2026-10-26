$ErrorActionPreference = 'Stop'
$project = 'C:\Projects\DIS-AI-Dev'
$expectedHead = '73c4669fbabde5a190e86285dd9f5c7e7fc2a2da'
$payloadCommit = '11c047b368444517a202f60bc1d17db7548a0998'
$payloadBase = "https://raw.githubusercontent.com/sdeepak20072004-hue/DIS-AI-Dev/$payloadCommit/tools/payloads/python-backend"

if (-not (Test-Path (Join-Path $project '.git'))) { throw "Git repository not found at $project. No files changed." }
Set-Location $project
if ((git branch --show-current).Trim() -ne 'main') { throw "This update expects the main branch. No files changed." }
if ((git rev-parse HEAD).Trim() -ne $expectedHead) { throw "Unexpected base commit. Expected foundation commit 73c4669. No files changed." }
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { throw "Staged changes detected. Review or unstage them before this update. No files changed." }

$workspacePath = Join-Path $project 'src\renderer\src\components\WorkspaceScreen.tsx'
$cssPath = Join-Path $project 'src\renderer\src\assets\main.css'
$htmlPath = Join-Path $project 'src\renderer\index.html'
$readmePath = Join-Path $project 'README.md'
$pythonDir = Join-Path $project 'python-backend'
foreach ($path in @($workspacePath, $cssPath, $htmlPath, $readmePath)) {
    if (-not (Test-Path $path -PathType Leaf)) { throw "Expected file missing: $path. No files changed." }
}
if (Test-Path $pythonDir) { throw "python-backend already exists. No files changed; review the existing folder first." }
if (-not (Get-Command py -ErrorAction SilentlyContinue)) { throw "Python launcher 'py' was not found. No files changed." }
& py -3 --version
if ($LASTEXITCODE -ne 0) { throw "Python 3 could not start with py -3. No files changed." }

$workspace = [IO.File]::ReadAllText($workspacePath)
$css = [IO.File]::ReadAllText($cssPath)
$html = [IO.File]::ReadAllText($htmlPath)
$readme = [IO.File]::ReadAllText($readmePath)
$chatTypeMarker = "type ChatMessage = { id: number; role: ChatRole; text: string }"
$statusMarker = "  const [status, setStatus] = useState('Local demo ready · No provider connected')"
$headerMarker = @'
        </header>
        <div className="workspace-demo-banner" role="note">
'@
$cspOld = "content=""default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:""
$readmeMarker = '## What is not implemented yet'

foreach ($check in @(
    @{ Value = $workspace; Marker = $chatTypeMarker; Label = 'Workspace chat type marker' },
    @{ Value = $workspace; Marker = $statusMarker; Label = 'Workspace status marker' },
    @{ Value = $workspace; Marker = $headerMarker; Label = 'Workspace header marker' },
    @{ Value = $html; Marker = $cspOld; Label = 'Content Security Policy marker' },
    @{ Value = $readme; Marker = $readmeMarker; Label = 'README status section marker' }
)) {
    if (([regex]::Matches($check.Value, [regex]::Escape($check.Marker))).Count -ne 1) {
        throw "$($check.Label) was missing or not unique. No files changed."
    }
}
if ($workspace.Contains('workspace-python-panel') -or $html.Contains('http://127.0.0.1:8765')) { throw "Python bridge already appears to be installed. No files changed." }

$tempDir = Join-Path $env:TEMP ('DIS-AI-Dev-python-bridge-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
try {
    foreach ($file in @('server.py', 'test_server.py', 'README.md')) {
        Invoke-WebRequest -Uri "$payloadBase/$file" -OutFile (Join-Path $tempDir $file)
    }
    if (-not (Select-String -Path (Join-Path $tempDir 'server.py') -Pattern 'class PythonHelperHandler' -Quiet)) { throw "Downloaded Python server failed its content check. No project files changed." }
    if (-not (Select-String -Path (Join-Path $tempDir 'test_server.py') -Pattern 'test_health_endpoint' -Quiet)) { throw "Downloaded Python tests failed their content check. No project files changed." }

    $pythonTypes = @'
type PythonBridgeHealth = {
  ok: boolean
  version: string
  ai_connected: boolean
}

type PythonBridgeEcho = {
  ok: boolean
  echo: string
  processed_by: string
  ai_connected: boolean
}
'@
    $nl = [Environment]::NewLine
    $workspace = $workspace.Replace($chatTypeMarker, $chatTypeMarker + $nl + $nl + $pythonTypes.TrimEnd())

    $pythonFunction = @'
  const [pythonState, setPythonState] = useState<'not-tested' | 'checking' | 'connected' | 'offline'>('not-tested')
  const [pythonDetail, setPythonDetail] = useState('Not tested · Start the Python helper to check the bridge')

  const testPythonBridge = async (): Promise<void> => {
    setPythonState('checking')
    setPythonDetail('Checking local Python service…')
    try {
      const healthResponse = await fetch('http://127.0.0.1:8765/health', {
        signal: AbortSignal.timeout(2500)
      })
      if (!healthResponse.ok) throw new Error('Python health check failed')
      const health = (await healthResponse.json()) as PythonBridgeHealth
      if (!health.ok || !health.version || health.ai_connected) {
        throw new Error('Unexpected Python health response')
      }

      const echoResponse = await fetch('http://127.0.0.1:8765/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello from DIS AI Dev' }),
        signal: AbortSignal.timeout(2500)
      })
      if (!echoResponse.ok) throw new Error('Python echo test failed')
      const echo = (await echoResponse.json()) as PythonBridgeEcho
      if (!echo.ok || echo.echo !== 'Hello from DIS AI Dev' || echo.ai_connected) {
        throw new Error('Python echo response did not match')
      }

      setPythonState('connected')
      setPythonDetail('Python ' + health.version + ' · health + echo passed')
      setStatus('Python bridge verified · Local helper only · No AI provider connected')
    } catch {
      setPythonState('offline')
      setPythonDetail('Not connected · Run py -3 .\\python-backend\\server.py in another terminal')
      setStatus('Python bridge unavailable · Chat remains in Local Demo mode')
    }
  }
'@
    $workspace = $workspace.Replace($statusMarker, $statusMarker + $nl + $pythonFunction.TrimEnd())

    $newHeader = @'
        </header>
        <div className="workspace-python-panel" data-state={pythonState} role="status" aria-live="polite">
          <div className="workspace-python-info">
            <span className={'workspace-python-dot ' + pythonState} />
            <div>
              <strong>Python helper bridge</strong>
              <small>{pythonDetail}</small>
            </div>
          </div>
          <button
            type="button"
            className="workspace-python-button"
            onClick={() => void testPythonBridge()}
            disabled={pythonState === 'checking'}
          >
            {pythonState === 'checking' ? 'Checking…' : 'Test Python Bridge'}
          </button>
        </div>
        <div className="workspace-demo-banner" role="note">
'@
    $workspace = $workspace.Replace($headerMarker, $newHeader)

    $pythonStyles = @'

/* Python sidecar status for the local development bridge. */
.workspace-python-panel{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 22px;border-bottom:1px solid rgba(151,166,200,.1);background:rgba(255,255,255,.012)}
.workspace-python-info{display:flex;align-items:center;gap:10px;min-width:0}
.workspace-python-info strong,.workspace-python-info small{display:block}
.workspace-python-info strong{color:#cdd8e8;font-size:11px;font-weight:700}
.workspace-python-info small{margin-top:4px;color:#8290a6;font-size:10px;line-height:1.5}
.workspace-python-dot{display:inline-block;width:8px;height:8px;flex:0 0 auto;border-radius:50%;background:#7c879b}
.workspace-python-dot.checking{background:#e8c57a;box-shadow:0 0 10px rgba(232,197,122,.2)}
.workspace-python-dot.connected{background:#8ee0bb;box-shadow:0 0 10px rgba(142,224,187,.28)}
.workspace-python-dot.offline{background:#efa38d}
.workspace-python-button{flex:0 0 auto;padding:8px 12px;border:1px solid rgba(117,218,208,.24);border-radius:8px;color:#a9f2e8;background:rgba(117,218,208,.07);font-size:10px;font-weight:700;cursor:pointer}
.workspace-python-button:hover:not(:disabled){background:rgba(117,218,208,.14)}
.workspace-python-button:disabled{opacity:.65;cursor:wait}
@media(max-width:760px){.workspace-python-panel{align-items:flex-start;flex-direction:column;padding:12px 16px}.workspace-python-button{align-self:flex-start}}
'@
    $css = $css + $pythonStyles

    $cspNew = "content=""default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://127.0.0.1:8765 http://localhost:8765"""
    $html = $html.Replace($cspOld, $cspNew)

    $newReadmeSection = @'
## Python helper (local development prototype)

DIS AI Dev includes an optional Python standard-library sidecar for learning and bridge verification. It provides GET /health and POST /echo, listens only on 127.0.0.1:8765, and does not call an AI model, execute shell commands, read project files, or persist messages. It is not an AI provider integration.

Start it in a separate PowerShell terminal:

    py -3 .\python-backend\server.py

Run the built-in tests in another terminal:

    py -3 -m unittest discover -s .\python-backend -p "test_*.py" -v

In AI Workspace, select Test Python Bridge to test both endpoints. Stop the Python service with Ctrl+C in its terminal.

'@
    $readme = $readme.Replace($readmeMarker, $newReadmeSection + $readmeMarker)

    $backupDir = Join-Path (Split-Path $project -Parent) 'DIS-AI-Dev-backup-20261026-python-bridge'
    if (Test-Path $backupDir) { $backupDir = $backupDir + '-' + (Get-Date -Format 'HHmmss') }
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Copy-Item -LiteralPath $workspacePath -Destination (Join-Path $backupDir 'WorkspaceScreen.tsx')
    Copy-Item -LiteralPath $cssPath -Destination (Join-Path $backupDir 'main.css')
    Copy-Item -LiteralPath $htmlPath -Destination (Join-Path $backupDir 'index.html')
    Copy-Item -LiteralPath $readmePath -Destination (Join-Path $backupDir 'README.md')

    $utf8 = [System.Text.UTF8Encoding]::new($false)
    try {
        [IO.File]::WriteAllText($workspacePath, $workspace, $utf8)
        [IO.File]::WriteAllText($cssPath, $css, $utf8)
        [IO.File]::WriteAllText($htmlPath, $html, $utf8)
        [IO.File]::WriteAllText($readmePath, $readme, $utf8)
        New-Item -ItemType Directory -Path $pythonDir -Force | Out-Null
        foreach ($file in @('server.py', 'test_server.py', 'README.md')) {
            Copy-Item -LiteralPath (Join-Path $tempDir $file) -Destination (Join-Path $pythonDir $file)
        }
        & py -3 -m unittest discover -s .\python-backend -p 'test_*.py' -v
        if ($LASTEXITCODE -ne 0) { throw "Python helper tests failed." }
    } catch {
        Copy-Item -LiteralPath (Join-Path $backupDir 'WorkspaceScreen.tsx') -Destination $workspacePath -Force
        Copy-Item -LiteralPath (Join-Path $backupDir 'main.css') -Destination $cssPath -Force
        Copy-Item -LiteralPath (Join-Path $backupDir 'index.html') -Destination $htmlPath -Force
        Copy-Item -LiteralPath (Join-Path $backupDir 'README.md') -Destination $readmePath -Force
        if (Test-Path $pythonDir) { Remove-Item -LiteralPath $pythonDir -Recurse -Force }
        throw "Update was rolled back because the Python checks failed: $($_.Exception.Message)"
    }

    Write-Host ''
    Write-Host 'Python bridge milestone applied. Python unit tests passed.' -ForegroundColor Green
    Write-Host "Backup folder: $backupDir"
    Write-Host 'Next: run npm run format, typecheck, lint, and build.'
} finally {
    if (Test-Path $tempDir) { Remove-Item -LiteralPath $tempDir -Recurse -Force }
}
