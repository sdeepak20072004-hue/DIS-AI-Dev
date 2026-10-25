$ErrorActionPreference = 'Stop'

$project = 'C:\Projects\DIS-AI-Dev'
$expectedHead = '73c4669fbabde5a190e86285dd9f5c7e7fc2a2da'
if (-not (Test-Path (Join-Path $project '.git'))) { throw "Git repository not found. No files changed." }
Set-Location $project
if ((git branch --show-current).Trim() -ne 'main') { throw "Switch to main before running this update. No files changed." }
if ((git rev-parse HEAD).Trim() -ne $expectedHead) { throw "Unexpected commit. This script is for foundation commit 73c4669. No files changed." }
if (git status --porcelain) { throw "Working tree is not clean. Commit or back up changes first. No files changed." }

$appPath = Join-Path $project 'src\renderer\src\App.tsx'
$cssPath = Join-Path $project 'src\renderer\src\assets\main.css'
$readmePath = Join-Path $project 'README.md'
$componentPath = Join-Path $project 'src\renderer\src\components\WorkspaceScreen.tsx'
$screenshotsDir = Join-Path $project 'docs\screenshots'
if (Test-Path $componentPath) { throw "Workspace component already exists. No files changed." }

$app = [IO.File]::ReadAllText($appPath)
$css = [IO.File]::ReadAllText($cssPath)
$readme = [IO.File]::ReadAllText($readmePath)
$importMarker = "import { useMemo, useState, type ReactNode } from 'react'"
$screenMarker = "          {activeScreen === 'overview' ? ("
$clonePlaceholder = 'https://github.com/<your-github-username>/DIS-AI-Dev.git'
if (-not $app.Contains($importMarker) -or -not $app.Contains($screenMarker)) { throw "Expected App.tsx markers were not found. No files changed." }
if (-not $readme.Contains($clonePlaceholder)) { throw "Expected README clone placeholder was not found. No files changed." }
if ($css.Contains('.workspace-demo')) { throw "Workspace styles appear to be installed already. No files changed." }

$component = @'
import { useState } from 'react'

type ChatRole = 'user' | 'assistant'
type ChatMessage = { id: number; role: ChatRole; text: string }

const suggestions = [
  { title: 'Understand this project', prompt: 'Explain the DIS AI Dev project structure and current status.' },
  { title: 'Fix an Electron issue', prompt: 'Help me debug an Electron startup or cache issue.' },
  { title: 'Plan the next milestone', prompt: 'Help me plan the next safe milestone for DIS AI Dev.' },
  { title: 'Prepare a Git commit', prompt: 'Show me a safe Git review and commit workflow.' }
]

function localReply(prompt: string): string {
  const query = prompt.toLowerCase()
  if (/(git|commit|push|github|repository|repo)/.test(query)) {
    return 'Safe Git workflow:\n1. Check git status and confirm the branch.\n2. Run npm run typecheck, npm run lint and npm run build.\n3. Review git diff before staging.\n4. Stage only intended files and create a specific commit.\n5. Push and verify the commit on GitHub.\n\nLocal demo: this is a fixed rule-based reply, not an AI model.'
  }
  if (/(electron|cache|startup|launch|fetch failed|timeout)/.test(query)) {
    return 'Electron troubleshooting:\n1. Read the first error, not just later stack traces.\n2. Ensure only one dev server is running for this project.\n3. Run typecheck and build to separate code errors from runtime issues.\n4. For download timeouts, test the download host independently.\n5. Do not delete caches or stop unrelated processes without identifying them.\n\nLocal demo: no system diagnostics were run automatically.'
  }
  if (/(structure|project|status|roadmap|milestone|next)/.test(query)) {
    return 'DIS AI Dev foundation:\n• Desktop shell: Electron + electron-vite.\n• Renderer: React + TypeScript.\n• UI: dashboard navigation and placeholder screens.\n• Current milestone: local interaction demo.\n\nRecommended next: verify the workspace, capture a real screenshot, then design a provider adapter with explicit error and secret-handling rules.\n\nLocal demo: this reply comes from simple keyword rules, not a model.'
  }
  if (/(readme|screenshot|public|portfolio|profile)/.test(query)) {
    return 'For a portfolio-ready repository:\n1. Capture the running app with Win + Shift + S.\n2. Save it as docs/screenshots/dashboard.png.\n3. Review it for private information before committing.\n4. Keep the README clear about implemented versus planned features.\n5. Run checks, review the diff, commit and push.\n\nLocal demo: no screenshot was captured or uploaded by this app.'
  }
  return 'I received your message: "' + prompt.trim() + '"\n\nThis workspace is in Local Demo mode. Replies use built-in rules; no AI model is connected and your text is not sent to a server.\n\nTry a suggested prompt to explore the prototype. A real provider adapter, secure configuration and streaming responses are future milestones.'
}

export default function WorkspaceScreen(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('Local demo ready · No provider connected')

  const send = (value = input): void => {
    const text = value.trim()
    if (!text) return
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text },
      { id: Date.now() + 1, role: 'assistant', text: localReply(text) }
    ])
    setInput('')
    setStatus('Local demo replied · No external model was called')
  }

  const newChat = (): void => {
    setMessages([])
    setInput('')
    setStatus('New local demo conversation')
  }

  const copyReply = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('Reply copied to clipboard')
    } catch {
      setStatus('Clipboard unavailable · Select and copy manually')
    }
  }

  return (
    <section className="workspace-demo" aria-label="AI Workspace local demo">
      <aside className="workspace-rail">
        <div className="workspace-rail-heading">
          <div><span className="workspace-kicker">WORKSPACE</span><h2>Conversations</h2></div>
          <button type="button" className="workspace-new-button" onClick={newChat}>+ New</button>
        </div>
        <div className="workspace-thread">
          <span className="workspace-thread-icon">◇</span>
          <span><strong>Local demo chat</strong><small>In-memory only</small></span>
        </div>
        <div className="workspace-rail-note">
          <span className="workspace-mode-dot" />
          <div><strong>Local sandbox</strong><p>Messages stay in this window session. They are not saved to disk or sent to a provider.</p></div>
        </div>
        <div className="workspace-rail-footer">DIS AI DEV · EARLY PROTOTYPE</div>
      </aside>
      <div className="workspace-chat">
        <header className="workspace-chat-header">
          <div className="workspace-chat-title">
            <div className="workspace-chat-mark">✳</div>
            <div><h2>AI Workspace</h2><p>Explore ideas and developer workflows</p></div>
          </div>
          <span className="workspace-local-badge"><i /> RULE-BASED DEMO</span>
        </header>
        <div className="workspace-demo-banner" role="note">
          <span className="workspace-banner-icon">i</span>
          <p><strong>Local demo mode.</strong> Replies use simple built-in rules. No AI model or external service is connected.</p>
        </div>
        <div className="workspace-messages" aria-live="polite" aria-label="Conversation messages">
          {messages.length === 0 ? (
            <div className="workspace-intro">
              <div className="workspace-intro-orb">✳</div>
              <span className="workspace-kicker">YOUR BUILDING PARTNER · PROTOTYPE</span>
              <h1>What are we building today?</h1>
              <p>Start with a suggested task or ask a question. This prototype demonstrates the interaction flow locally.</p>
              <div className="workspace-suggestions">
                {suggestions.map((item) => (
                  <button key={item.title} type="button" onClick={() => send(item.prompt)}>
                    <strong>{item.title}</strong><span>{item.prompt}</span><b aria-hidden="true">↗</b>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {messages.map((message) => (
            <article className={'workspace-message ' + message.role} key={message.id}>
              <div className={'workspace-message-avatar ' + message.role}>{message.role === 'assistant' ? 'D' : 'Y'}</div>
              <div className="workspace-message-body">
                <div className="workspace-message-meta">
                  <strong>{message.role === 'assistant' ? 'DIS AI · Local demo' : 'You'}</strong>
                  {message.role === 'assistant' ? <button type="button" className="workspace-copy-button" onClick={() => void copyReply(message.text)}>Copy reply</button> : null}
                </div>
                <p>{message.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="workspace-composer-wrap">
          <form className="workspace-composer" onSubmit={(event) => { event.preventDefault(); send() }}>
            <label className="workspace-composer-label" htmlFor="workspace-prompt">Message DIS AI Dev</label>
            <textarea
              id="workspace-prompt"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              }}
              placeholder="Ask about Git, the project roadmap, Electron or React..."
              rows={3}
            />
            <div className="workspace-composer-toolbar">
              <span>Enter to send · Shift + Enter for a new line</span>
              <button type="submit" className="workspace-send-button" disabled={!input.trim()}>Send <b aria-hidden="true">↗</b></button>
            </div>
          </form>
          <div className="workspace-composer-foot"><span>{status}</span><span>Nothing leaves this renderer in Local Demo mode.</span></div>
        </div>
      </div>
    </section>
  )
}
'@

$styles = @'

/* Interactive local-only AI Workspace prototype. */
.workspace-demo{display:grid;grid-template-columns:minmax(190px,230px) minmax(0,1fr);min-height:600px;height:100%;overflow:hidden;border:1px solid rgba(151,166,200,.12);border-radius:16px;background:rgba(12,16,25,.68);box-shadow:0 18px 50px rgba(0,0,0,.12)}
.workspace-rail{display:flex;flex-direction:column;min-width:0;padding:20px 14px 15px;border-right:1px solid rgba(151,166,200,.1);background:rgba(255,255,255,.012)}
.workspace-rail-heading,.workspace-chat-header,.workspace-chat-title,.workspace-message-meta,.workspace-composer-toolbar,.workspace-composer-foot{display:flex;align-items:center;justify-content:space-between;gap:12px}
.workspace-kicker{color:#758196;font-size:9px;font-weight:750;letter-spacing:.15em}
.workspace-rail-heading h2{margin-top:7px;color:#e4e9f5;font-size:15px;font-weight:650;letter-spacing:-.03em}
.workspace-new-button{padding:7px 9px;border:1px solid rgba(139,230,224,.2);border-radius:8px;color:#a9f2e8;background:rgba(117,218,208,.06);font-size:10px;font-weight:650;cursor:pointer}
.workspace-new-button:hover{background:rgba(117,218,208,.12)}
.workspace-thread{display:flex;align-items:flex-start;gap:10px;width:100%;margin-top:22px;padding:11px 9px;border:1px solid rgba(130,225,216,.14);border-radius:10px;color:#c5d0e0;background:rgba(117,218,208,.055);text-align:left}
.workspace-thread-icon{display:grid;width:28px;height:28px;flex:0 0 auto;place-items:center;border-radius:8px;color:#a6f0e5;background:rgba(117,218,208,.1);font-size:21px}
.workspace-thread strong,.workspace-thread small{display:block}
.workspace-thread strong{margin-top:1px;color:#dbe5f0;font-size:10.5px;font-weight:650}
.workspace-thread small{margin-top:5px;color:#7e8a9f;font-size:9px}
.workspace-rail-note{display:flex;align-items:flex-start;gap:8px;margin-top:auto;padding:10px 9px;border:1px solid rgba(151,166,200,.1);border-radius:9px;background:rgba(255,255,255,.018)}
.workspace-mode-dot,.workspace-local-badge i{display:inline-block;width:6px;height:6px;flex:0 0 auto;margin-top:4px;border-radius:50%;background:#8ee0bb;box-shadow:0 0 8px rgba(142,224,187,.25)}
.workspace-rail-note strong{color:#aebbd0;font-size:10px;font-weight:650}
.workspace-rail-note p{margin-top:5px;color:#778399;font-size:9px;line-height:1.6}
.workspace-rail-footer{margin-top:14px;color:#535f73;font-size:8px;font-weight:750;letter-spacing:.12em}
.workspace-chat{display:flex;flex-direction:column;min-width:0;min-height:0}
.workspace-chat-header{min-height:69px;padding:13px 20px;border-bottom:1px solid rgba(151,166,200,.1)}
.workspace-chat-title{justify-content:flex-start}
.workspace-chat-mark,.workspace-intro-orb{display:grid;place-items:center;color:#9bf0e5;border:1px solid rgba(139,230,224,.21);background:linear-gradient(145deg,rgba(117,218,208,.13),rgba(139,127,255,.12))}
.workspace-chat-mark{width:36px;height:36px;flex:0 0 auto;border-radius:12px;font-size:22px}
.workspace-chat-title h2{color:#e3e8f4;font-size:13px;font-weight:700}
.workspace-chat-title p{margin-top:4px;color:#78859a;font-size:10px}
.workspace-local-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 8px;border:1px solid rgba(142,224,187,.14);border-radius:7px;color:#9cb7ae;font-size:8px;font-weight:750;letter-spacing:.08em;white-space:nowrap}
.workspace-local-badge i{margin-top:0}
.workspace-demo-banner{display:flex;align-items:flex-start;gap:9px;margin:15px 20px 0;padding:10px 12px;border:1px solid rgba(161,151,255,.15);border-radius:9px;background:rgba(145,132,255,.045)}
.workspace-banner-icon{display:grid;width:17px;height:17px;flex:0 0 auto;place-items:center;border:1px solid rgba(171,164,255,.35);border-radius:50%;color:#bbb1ff;font-size:10px;font-weight:700}
.workspace-demo-banner p{color:#969db2;font-size:10px;line-height:1.55}
.workspace-demo-banner strong{color:#c7c0ff;font-weight:700}
.workspace-messages{display:flex;flex:1;flex-direction:column;min-height:250px;overflow-y:auto;padding:22px clamp(16px,3vw,32px);scrollbar-width:thin;scrollbar-color:#292f3f transparent}
.workspace-intro{max-width:640px;margin:auto;padding:15px 0 25px;text-align:center}
.workspace-intro-orb{width:48px;height:48px;margin:0 auto 17px;border-radius:17px;box-shadow:0 0 35px rgba(117,218,208,.06);font-size:28px}
.workspace-intro h1{margin-top:10px;color:#edf0fa;font-size:clamp(22px,2.5vw,29px);font-weight:650;letter-spacing:-.045em}
.workspace-intro>p{max-width:470px;margin:10px auto 0;color:#8993a8;font-size:11px;line-height:1.75}
.workspace-suggestions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:24px;text-align:left}
.workspace-suggestions button{position:relative;min-width:0;padding:13px 29px 13px 13px;border:1px solid rgba(151,166,200,.12);border-radius:10px;color:#cbd3e1;background:rgba(255,255,255,.018);cursor:pointer;text-align:left}
.workspace-suggestions button:hover{border-color:rgba(139,230,224,.3);background:rgba(117,218,208,.04)}
.workspace-suggestions strong{display:block;color:#dfe7f4;font-size:10.5px;font-weight:650}
.workspace-suggestions span{display:block;margin-top:6px;color:#7f8ba1;font-size:9.5px;line-height:1.55}
.workspace-suggestions b{position:absolute;top:12px;right:12px;color:#8c9bb0;font-size:14px;font-weight:500}
.workspace-message{display:flex;align-items:flex-start;gap:11px;max-width:760px;margin:0 auto 22px;width:100%}
.workspace-message-avatar{display:grid;width:30px;height:30px;flex:0 0 auto;place-items:center;border:1px solid rgba(151,166,200,.15);border-radius:10px;color:#b9c4d9;background:rgba(255,255,255,.04);font-size:10px;font-weight:750}
.workspace-message-avatar.assistant{color:#9ef0e4;border-color:rgba(139,230,224,.2);background:rgba(117,218,208,.08)}
.workspace-message-body{min-width:0;flex:1;padding-top:2px}
.workspace-message-meta{justify-content:flex-start;min-height:23px}
.workspace-message-meta strong{color:#d8deeb;font-size:10px;font-weight:700}
.workspace-copy-button{padding:3px 6px;border:1px solid transparent;border-radius:5px;color:#7e8ba0;background:transparent;font-size:9px;cursor:pointer}
.workspace-copy-button:hover{border-color:rgba(151,166,200,.17);color:#d4dced}
.workspace-message-body p{color:#aeb8cb;font-size:11px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}
.workspace-message.user .workspace-message-body p{color:#dfe5f1}
.workspace-composer-wrap{padding:0 20px 15px}
.workspace-composer{max-width:820px;margin:0 auto;padding:12px 13px 10px;border:1px solid rgba(151,166,200,.17);border-radius:12px;background:rgba(255,255,255,.025);box-shadow:0 8px 30px rgba(0,0,0,.1)}
.workspace-composer:focus-within{border-color:rgba(139,230,224,.35)}
.workspace-composer-label{display:block;margin-bottom:6px;color:#8f9bb0;font-size:9px;font-weight:700}
.workspace-composer textarea{display:block;width:100%;min-height:58px;resize:vertical;border:0;outline:0;color:#e4e9f5;background:transparent;font:inherit;font-size:11px;line-height:1.7}
.workspace-composer textarea::placeholder{color:#677389}
.workspace-composer-toolbar{padding-top:9px;border-top:1px solid rgba(151,166,200,.08)}
.workspace-composer-toolbar>span{color:#68758b;font-size:9px}
.workspace-send-button{display:inline-flex;align-items:center;gap:10px;padding:8px 11px;border:1px solid rgba(155,249,235,.38);border-radius:8px;color:#081616;background:linear-gradient(105deg,#9ef0e4,#8ed9da);font-size:10px;font-weight:750;cursor:pointer}
.workspace-send-button:disabled{opacity:.42;cursor:not-allowed}
.workspace-composer-foot{max-width:820px;margin:9px auto 0;color:#69758a;font-size:8.5px}
.workspace-composer-foot span:first-child{color:#93ab9f}
@media(max-width:900px){.workspace-demo{grid-template-columns:minmax(160px,190px) minmax(0,1fr)}.workspace-rail{padding:15px 10px 12px}.workspace-chat-header{padding-right:13px;padding-left:13px}.workspace-demo-banner{margin-right:13px;margin-left:13px}.workspace-composer-wrap{padding-right:13px;padding-left:13px}}
@media(max-width:660px){.workspace-demo{display:flex;flex-direction:column;min-height:660px}.workspace-rail{display:none}.workspace-chat-header{align-items:flex-start;flex-wrap:wrap}.workspace-suggestions{grid-template-columns:minmax(0,1fr)}.workspace-composer-foot{align-items:flex-start;flex-direction:column;gap:4px}.workspace-local-badge{font-size:7px}}
'@

$backupDir = 'C:\Projects\DIS-AI-Dev-backup-20261025-workspace'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item $appPath (Join-Path $backupDir 'App.tsx') -Force
Copy-Item $cssPath (Join-Path $backupDir 'main.css') -Force
Copy-Item $readmePath (Join-Path $backupDir 'README.md') -Force

$newLine = [Environment]::NewLine
$app = $app.Replace($importMarker, $importMarker + $newLine + "import WorkspaceScreen from './components/WorkspaceScreen'")
$replacement = "          {activeScreen === 'workspace' ? (" + $newLine + "            <WorkspaceScreen />" + $newLine + "          ) : activeScreen === 'overview' ? ("
$app = $app.Replace($screenMarker, $replacement)
$css = $css + $styles
$readme = $readme.Replace($clonePlaceholder, 'https://github.com/sdeepak20072004-hue/DIS-AI-Dev.git')
$readme = $readme.Replace('- [x] Responsive dark UI shell with honest “not connected” states.', "- [x] Responsive dark UI shell with honest “not connected” states." + $newLine + "- [x] Interactive Local Demo chat with in-memory session state and clearly labeled rule-based replies (no model provider connected).")
$readme = $readme.Replace('| AI Workspace   | Placeholder UI | Streaming chat through a provider adapter                   |', '| AI Workspace   | Local Demo     | Provider adapter and streaming responses (planned)         |')
$readme = $readme.Replace('AI model/provider calls, API-key handling and streaming conversations.', 'Connected AI model/provider calls, API-key handling and streaming conversations. The current workspace replies with fixed local demo rules only.')
$screenshotSection = "## Screenshots" + $newLine + $newLine + "A screenshot captured from the running desktop app will be added at docs/screenshots/dashboard.png after visual verification. See docs/screenshots/README.md for capture instructions. No mock image is presented as a real application screenshot." + $newLine + $newLine + "## Technology choices"
$readme = $readme.Replace('## Technology choices', $screenshotSection)

$utf8 = [System.Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText($appPath, $app, $utf8)
[IO.File]::WriteAllText($cssPath, $css, $utf8)
[IO.File]::WriteAllText($readmePath, $readme, $utf8)
[IO.File]::WriteAllText($componentPath, $component, $utf8)
New-Item -ItemType Directory -Path $screenshotsDir -Force | Out-Null
$screenshotReadme = @'
# Screenshot capture

Capture the actual running DIS AI Dev desktop window after launching npm run dev.

1. Press Win + Shift + S and select the full application window.
2. Save the screenshot as docs/screenshots/dashboard.png.
3. Review it for private information, notifications, paths, API keys, or unrelated windows before committing.
4. Add the verified screenshot to the README in a separate focused commit.

Do not use a generated mockup as evidence of the running application.
'@
[IO.File]::WriteAllText((Join-Path $screenshotsDir 'README.md'), $screenshotReadme, $utf8)

Write-Host ''
Write-Host 'Workspace update applied successfully.' -ForegroundColor Green
Write-Host "Backup folder: $backupDir"
Write-Host 'Next run: npm run format; npm run typecheck; npm run lint; npm run build.'
