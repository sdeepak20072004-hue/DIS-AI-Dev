import { useState } from 'react'

type ChatRole = 'user' | 'assistant'
type ChatMessage = { id: number; role: ChatRole; text: string }

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

const suggestions = [
  {
    title: 'Understand this project',
    prompt: 'Explain the DIS AI Dev project structure and current status.'
  },
  { title: 'Fix an Electron issue', prompt: 'Help me debug an Electron startup or cache issue.' },
  {
    title: 'Plan the next milestone',
    prompt: 'Help me plan the next safe milestone for DIS AI Dev.'
  },
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
  return (
    'I received your message: "' +
    prompt.trim() +
    '"\n\nThis workspace is in Local Demo mode. Replies use built-in rules; no AI model is connected and your text is not sent to a server.\n\nTry a suggested prompt to explore the prototype. A real provider adapter, secure configuration and streaming responses are future milestones.'
  )
}

export default function WorkspaceScreen(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('Local demo ready · No provider connected')
  const [pythonState, setPythonState] = useState<
    'not-tested' | 'checking' | 'connected' | 'offline'
  >('not-tested')
  const [pythonDetail, setPythonDetail] = useState(
    'Not tested · Start the Python helper to check the bridge'
  )

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
          <div>
            <span className="workspace-kicker">WORKSPACE</span>
            <h2>Conversations</h2>
          </div>
          <button type="button" className="workspace-new-button" onClick={newChat}>
            + New
          </button>
        </div>
        <div className="workspace-thread">
          <span className="workspace-thread-icon">◇</span>
          <span>
            <strong>Local demo chat</strong>
            <small>In-memory only</small>
          </span>
        </div>
        <div className="workspace-rail-note">
          <span className="workspace-mode-dot" />
          <div>
            <strong>Local sandbox</strong>
            <p>
              Messages stay in this window session. They are not saved to disk or sent to a
              provider.
            </p>
          </div>
        </div>
        <div className="workspace-rail-footer">DIS AI DEV · EARLY PROTOTYPE</div>
      </aside>
      <div className="workspace-chat">
        <header className="workspace-chat-header">
          <div className="workspace-chat-title">
            <div className="workspace-chat-mark">✳</div>
            <div>
              <h2>AI Workspace</h2>
              <p>Explore ideas and developer workflows</p>
            </div>
          </div>
          <span className="workspace-local-badge">
            <i /> RULE-BASED DEMO
          </span>
        </header>
        <div
          className="workspace-python-panel"
          data-state={pythonState}
          role="status"
          aria-live="polite"
        >
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
          <span className="workspace-banner-icon">i</span>
          <p>
            <strong>Local demo mode.</strong> Replies use simple built-in rules. No AI model or
            external service is connected.
          </p>
        </div>
        <div className="workspace-messages" aria-live="polite" aria-label="Conversation messages">
          {messages.length === 0 ? (
            <div className="workspace-intro">
              <div className="workspace-intro-orb">✳</div>
              <span className="workspace-kicker">YOUR BUILDING PARTNER · PROTOTYPE</span>
              <h1>What are we building today?</h1>
              <p>
                Start with a suggested task or ask a question. This prototype demonstrates the
                interaction flow locally.
              </p>
              <div className="workspace-suggestions">
                {suggestions.map((item) => (
                  <button key={item.title} type="button" onClick={() => send(item.prompt)}>
                    <strong>{item.title}</strong>
                    <span>{item.prompt}</span>
                    <b aria-hidden="true">↗</b>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {messages.map((message) => (
            <article className={'workspace-message ' + message.role} key={message.id}>
              <div className={'workspace-message-avatar ' + message.role}>
                {message.role === 'assistant' ? 'D' : 'Y'}
              </div>
              <div className="workspace-message-body">
                <div className="workspace-message-meta">
                  <strong>{message.role === 'assistant' ? 'DIS AI · Local demo' : 'You'}</strong>
                  {message.role === 'assistant' ? (
                    <button
                      type="button"
                      className="workspace-copy-button"
                      onClick={() => void copyReply(message.text)}
                    >
                      Copy reply
                    </button>
                  ) : null}
                </div>
                <p>{message.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="workspace-composer-wrap">
          <form
            className="workspace-composer"
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            <label className="workspace-composer-label" htmlFor="workspace-prompt">
              Message DIS AI Dev
            </label>
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
              <button type="submit" className="workspace-send-button" disabled={!input.trim()}>
                Send <b aria-hidden="true">↗</b>
              </button>
            </div>
          </form>
          <div className="workspace-composer-foot">
            <span>{status}</span>
            <span>Nothing leaves this renderer in Local Demo mode.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
