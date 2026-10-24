import { useMemo, useState, type ReactNode } from 'react'

type IconName =
  | 'grid'
  | 'message'
  | 'code'
  | 'bot'
  | 'book'
  | 'brain'
  | 'activity'
  | 'plug'
  | 'settings'
  | 'search'
  | 'bell'
  | 'plus'
  | 'arrow-up-right'
  | 'sparkles'
  | 'shield'
  | 'mic'
  | 'clock'
  | 'check'
  | 'chevron'
  | 'folder'
  | 'terminal'
  | 'send'
  | 'command'
  | 'layers'
  | 'cpu'
  | 'external'

type ScreenId =
  | 'overview'
  | 'workspace'
  | 'code'
  | 'agents'
  | 'knowledge'
  | 'memory'
  | 'activity'
  | 'integrations'
  | 'roadmap'
  | 'settings'

type NavItem = {
  id: ScreenId
  label: string
  icon: IconName
  group: 'Workspace' | 'System'
  hint?: string
}

const iconContent: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  message: (
    <>
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-1.5 2V11.5A7.5 7.5 0 0 1 11 4h1.5a7.5 7.5 0 0 1 7.5 7.5Z" />
      <path d="M8 11h8M8 14h5" />
    </>
  ),
  code: (
    <>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    </>
  ),
  bot: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 4v4M9 13h.01M15 13h.01M9 17h6" />
      <circle cx="12" cy="3.5" r="1" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5Z" />
      <path d="M4 6h13M8 8.5v5" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5.5a3 3 0 0 0-5.8-1A3.5 3.5 0 0 0 4 10a3.5 3.5 0 0 0 1.5 6.5A3 3 0 0 0 12 18Z" />
      <path d="M12 5.5a3 3 0 0 1 5.8-1A3.5 3.5 0 0 1 20 10a3.5 3.5 0 0 1-1.5 6.5A3 3 0 0 1 12 18ZM8 8.5c1.5 0 2 1 2 2M16 8.5c-1.5 0-2 1-2 2M8 15h2M14 15h2" />
    </>
  ),
  activity: (
    <>
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </>
  ),
  plug: (
    <>
      <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-5 5h0a5 5 0 0 1-5-5Z" />
      <path d="M12 16v5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path
        d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.7a8 8 0 0 1-1.6.9l-.3 1.9h-2.8l-.3-1.9a8 8 0 0 1-1.6-.9l-1.8.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.8.7a8 8 0 0 1 1.6-.9l.3-1.9h2.8l.3 1.9a8 8 0 0 1 1.6.9l1.8-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z"
        transform="translate(-1 -1) scale(.95)"
      />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  'arrow-up-right': (
    <>
      <path d="M7 17 17 7M8 7h9v9" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  chevron: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </>
  ),
  terminal: (
    <>
      <path d="m4 6 6 6-6 6M12 18h8" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  command: (
    <>
      <path d="M9 9V5a2 2 0 1 0-2 2h10a2 2 0 1 0-2-2v14a2 2 0 1 0 2-2H7a2 2 0 1 0 2 2V9Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 9h6v6H9zM9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4 11 13" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </>
  )
}

function Icon({
  name,
  size = 18,
  className = ''
}: {
  name: IconName
  size?: number
  className?: string
}): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconContent[name]}
    </svg>
  )
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'grid', group: 'Workspace' },
  { id: 'workspace', label: 'AI Workspace', icon: 'message', group: 'Workspace', hint: 'UI' },
  { id: 'code', label: 'Code Studio', icon: 'code', group: 'Workspace', hint: 'UI' },
  { id: 'agents', label: 'Agents & Tasks', icon: 'bot', group: 'Workspace' },
  { id: 'knowledge', label: 'Knowledge Base', icon: 'book', group: 'Workspace' },
  { id: 'memory', label: 'Memory', icon: 'brain', group: 'Workspace' },
  { id: 'activity', label: 'Activity Log', icon: 'activity', group: 'System' },
  { id: 'integrations', label: 'Integrations', icon: 'plug', group: 'System' },
  { id: 'roadmap', label: 'Roadmap', icon: 'layers', group: 'System' },
  { id: 'settings', label: 'Settings', icon: 'settings', group: 'System' }
]

const screenCopy: Record<
  Exclude<ScreenId, 'overview'>,
  {
    eyebrow: string
    title: string
    description: string
    icon: IconName
    status: string
    next: string
  }
> = {
  workspace: {
    eyebrow: 'AI WORKSPACE',
    title: 'A focused space for thinking and building.',
    description:
      'The workspace shell is ready for provider routing, chat history, streaming responses and voice controls. Those capabilities will be connected in later milestones.',
    icon: 'message',
    status: 'Provider not connected',
    next: 'Connect a model provider and define the first secure chat contract.'
  },
  code: {
    eyebrow: 'CODE STUDIO',
    title: 'Your development workspace starts here.',
    description:
      'This module is reserved for project navigation, file context, reviewed diffs and developer-approved commands. No shell command is executed by this prototype.',
    icon: 'code',
    status: 'Editor integration planned',
    next: 'Design workspace permissions and a review-before-run command flow.'
  },
  agents: {
    eyebrow: 'AGENTS & TASKS',
    title: 'Build a team of focused AI agents.',
    description:
      'The interface can later host task status, approvals and agent runs. There are no connected agents or background jobs in this UI prototype.',
    icon: 'bot',
    status: 'No agents connected',
    next: 'Define one small agent contract with explicit inputs, tools and outputs.'
  },
  knowledge: {
    eyebrow: 'KNOWLEDGE BASE',
    title: 'Keep project knowledge organized.',
    description:
      'A future knowledge layer can index approved project documents and provide citations. This screen does not currently ingest or store files.',
    icon: 'book',
    status: 'No sources indexed',
    next: 'Choose supported file types, access boundaries and source attribution.'
  },
  memory: {
    eyebrow: 'MEMORY',
    title: 'Useful context, under your control.',
    description:
      'Memory is planned with clear visibility, edit and delete controls. No personal memory is being persisted by this placeholder screen.',
    icon: 'brain',
    status: 'Memory storage not configured',
    next: 'Specify memory scopes, retention and user-controlled deletion.'
  },
  activity: {
    eyebrow: 'ACTIVITY LOG',
    title: 'Understand what the app is doing.',
    description:
      'This area is reserved for an auditable timeline of user actions, tool approvals and run outcomes. A production audit log is not implemented yet.',
    icon: 'activity',
    status: 'Demo events only',
    next: 'Define structured events and redact secrets before any logging.'
  },
  integrations: {
    eyebrow: 'INTEGRATIONS',
    title: 'Connect services deliberately.',
    description:
      'Model providers and external services will be routed through explicit adapters. Nothing is connected and no API key is required for this UI preview.',
    icon: 'plug',
    status: 'No integrations configured',
    next: 'Add a provider interface and store secrets outside source control.'
  },
  roadmap: {
    eyebrow: 'PROJECT ROADMAP',
    title: 'Ship reliable foundations, one milestone at a time.',
    description:
      'The roadmap separates visible UI, verified local capabilities and future integrations so that the public repository never overstates what works.',
    icon: 'layers',
    status: 'Early prototype',
    next: 'Finish dashboard UI, add tests, then open the first public repository milestone.'
  },
  settings: {
    eyebrow: 'SETTINGS',
    title: 'Make privacy and behavior visible.',
    description:
      'Settings will eventually control providers, permissions, appearance and local data. This screen is a placeholder; it does not change system permissions.',
    icon: 'settings',
    status: 'Local preview mode',
    next: 'Design permission prompts and safe defaults before connecting devices or tools.'
  }
}

function BrandMark(): React.JSX.Element {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 42 42" width="34" height="34" fill="none">
        <path
          d="M21 4 37 13v16L21 38 5 29V13Z"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity=".8"
        />
        <path
          d="M13 26V16l8 13 8-13v10"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="5" r="2" fill="#8AF0DE" />
      </svg>
    </div>
  )
}

function App(): React.JSX.Element {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const visibleNav = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return navItems
    return navItems.filter((item) =>
      `${item.label} ${item.group}`.toLowerCase().includes(normalized)
    )
  }, [search])

  const notify = (message: string): void => setToast(message)
  const openScreen = (screen: ScreenId): void => {
    setActiveScreen(screen)
    setSearch('')
  }

  const renderNavGroup = (group: NavItem['group']): React.JSX.Element => (
    <div className="nav-group" key={group}>
      <div className="nav-group-label">{group}</div>
      {visibleNav
        .filter((item) => item.group === group)
        .map((item) => (
          <button
            aria-current={activeScreen === item.id ? 'page' : undefined}
            className={`nav-item ${activeScreen === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => openScreen(item.id)}
            type="button"
          >
            <Icon name={item.icon} size={17} />
            <span>{item.label}</span>
            {item.hint ? <span className="nav-hint">{item.hint}</span> : null}
            {activeScreen === item.id ? <span className="nav-active-dot" /> : null}
          </button>
        ))}
    </div>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand-lockup"
          type="button"
          onClick={() => openScreen('overview')}
          aria-label="DIS AI Dev home"
        >
          <BrandMark />
          <span className="brand-copy">
            <strong>
              DIS AI <span>DEV</span>
            </strong>
            <small>DEVELOPMENT STUDIO</small>
          </span>
        </button>

        <div className="workspace-switcher">
          <div className="workspace-avatar">D</div>
          <div className="workspace-meta">
            <strong>Personal workspace</strong>
            <span>Local environment</span>
          </div>
          <span className="switcher-dots">···</span>
        </div>

        <div className="sidebar-search">
          <Icon name="search" size={15} />
          <input
            aria-label="Filter navigation"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find anything..."
          />
          <kbd>⌘ K</kbd>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {renderNavGroup('Workspace')}
          {renderNavGroup('System')}
          {visibleNav.length === 0 ? <p className="no-nav-results">No matching sections.</p> : null}
        </nav>

        <div className="sidebar-spacer" />
        <div className="privacy-card">
          <div className="privacy-icon">
            <Icon name="shield" size={17} />
          </div>
          <div>
            <strong>Privacy-first by design</strong>
            <p>Local preview. No provider connected.</p>
          </div>
          <span className="privacy-dot" />
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">DS</div>
          <div className="profile-meta">
            <strong>Workspace owner</strong>
            <span>Developer mode</span>
          </div>
          <button
            className="icon-button profile-settings"
            type="button"
            onClick={() => openScreen('settings')}
            aria-label="Open settings"
          >
            <Icon name="settings" size={17} />
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            <span>DIS AI Dev</span>
            <Icon name="chevron" size={14} />
            <strong>
              {navItems.find((item) => item.id === activeScreen)?.label ?? 'Overview'}
            </strong>
          </div>
          <div className="topbar-actions">
            <div className="runtime-status">
              <span className="status-pulse" /> LOCAL PREVIEW
            </div>
            <button
              className="icon-button notification-button"
              type="button"
              aria-label="Notifications"
              onClick={() =>
                notify('You are all caught up. Live notifications are not connected yet.')
              }
            >
              <Icon name="bell" size={18} />
              <span />
            </button>
            <div className="topbar-divider" />
            <div className="topbar-avatar">DS</div>
          </div>
        </header>

        <div className="page-content">
          {activeScreen === 'overview' ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" /> YOUR AI DEVELOPMENT ENVIRONMENT
                  </div>
                  <h1>
                    Build something <span>intelligent.</span>
                  </h1>
                  <p className="welcome-description">
                    One calm workspace for coding, AI workflows and the tools you trust.
                    <br className="wide-only" /> Start with a solid foundation. Grow it into an
                    ecosystem.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="button-primary"
                      type="button"
                      onClick={() => openScreen('workspace')}
                    >
                      <Icon name="sparkles" size={16} /> Open AI workspace{' '}
                      <Icon name="arrow-up-right" size={15} />
                    </button>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => openScreen('roadmap')}
                    >
                      Explore roadmap <Icon name="chevron" size={15} />
                    </button>
                  </div>
                </div>
                <div className="hero-orb" aria-hidden="true">
                  <div className="orb-ring orb-ring-one" />
                  <div className="orb-ring orb-ring-two" />
                  <div className="orb-ring orb-ring-three" />
                  <div className="orb-core">
                    <Icon name="layers" size={37} />
                  </div>
                  <span className="orb-node orb-node-a" />
                  <span className="orb-node orb-node-b" />
                  <span className="orb-node orb-node-c" />
                </div>
                <div className="preview-stamp">
                  <span className="stamp-dot" /> EARLY ACCESS{' '}
                  <span className="stamp-separator">/</span> UI PROTOTYPE
                </div>
              </section>

              <section className="stats-grid" aria-label="Workspace status">
                <article className="stat-card">
                  <div className="stat-heading">
                    <span>PROJECT</span>
                    <span className="stat-icon violet">
                      <Icon name="folder" size={17} />
                    </span>
                  </div>
                  <div className="stat-number">
                    DIS AI <span>Dev</span>
                  </div>
                  <div className="stat-foot">
                    <span className="mini-dot cyan" /> Local desktop workspace
                  </div>
                </article>
                <article className="stat-card">
                  <div className="stat-heading">
                    <span>AI PROVIDERS</span>
                    <span className="stat-icon mint">
                      <Icon name="cpu" size={17} />
                    </span>
                  </div>
                  <div className="stat-number">
                    0 <small>/ configured</small>
                  </div>
                  <div className="stat-foot">
                    <span className="mini-dot muted" /> Connect a provider later
                  </div>
                </article>
                <article className="stat-card">
                  <div className="stat-heading">
                    <span>CONNECTED AGENTS</span>
                    <span className="stat-icon blue">
                      <Icon name="bot" size={17} />
                    </span>
                  </div>
                  <div className="stat-number">
                    0 <small>active</small>
                  </div>
                  <div className="stat-foot">
                    <span className="mini-dot muted" /> No background jobs running
                  </div>
                </article>
                <article className="stat-card">
                  <div className="stat-heading">
                    <span>SECURITY MODE</span>
                    <span className="stat-icon amber">
                      <Icon name="shield" size={17} />
                    </span>
                  </div>
                  <div className="stat-number">
                    Local <span>first</span>
                  </div>
                  <div className="stat-foot">
                    <span className="mini-dot mint-dot" /> No API keys needed for this UI
                  </div>
                </article>
              </section>

              <div className="content-grid">
                <section className="panel build-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">YOUR WORKSPACE</span>
                      <h2>Continue building</h2>
                    </div>
                    <span className="panel-label">
                      <span className="mini-dot cyan" /> Foundation
                    </span>
                  </div>
                  <div className="project-feature">
                    <div className="project-symbol">
                      <BrandMark />
                    </div>
                    <div className="project-info">
                      <div className="project-title-row">
                        <h3>DIS AI Dev</h3>
                        <span className="tag tag-cyan">Desktop app</span>
                      </div>
                      <p>Your own AI development studio — designed to grow module by module.</p>
                      <div className="project-meta">
                        <span>
                          <Icon name="code" size={14} /> React + TypeScript
                        </span>
                        <span>
                          <Icon name="terminal" size={14} /> Electron
                        </span>
                      </div>
                    </div>
                    <button
                      className="round-arrow"
                      type="button"
                      aria-label="Open code studio"
                      onClick={() => openScreen('code')}
                    >
                      <Icon name="arrow-up-right" size={18} />
                    </button>
                  </div>
                  <div className="milestone-box">
                    <div className="milestone-header">
                      <div>
                        <span className="milestone-label">CURRENT MILESTONE</span>
                        <strong>Dashboard & project foundation</strong>
                      </div>
                      <span className="tag tag-violet">In progress</span>
                    </div>
                    <div className="milestone-progress">
                      <span />
                    </div>
                    <p>
                      Next up: verify the UI, document the architecture and publish the first clean
                      commit.
                    </p>
                    <button
                      className="text-link"
                      type="button"
                      onClick={() => openScreen('roadmap')}
                    >
                      View project roadmap <Icon name="arrow-up-right" size={14} />
                    </button>
                  </div>
                  <div className="quick-actions">
                    <button type="button" onClick={() => openScreen('workspace')}>
                      <span className="quick-icon">
                        <Icon name="message" size={17} />
                      </span>
                      <span>
                        <strong>Start a conversation</strong>
                        <small>Workspace UI preview</small>
                      </span>
                      <Icon name="chevron" size={16} />
                    </button>
                    <button type="button" onClick={() => openScreen('integrations')}>
                      <span className="quick-icon">
                        <Icon name="plug" size={17} />
                      </span>
                      <span>
                        <strong>Configure integrations</strong>
                        <small>Provider setup is planned</small>
                      </span>
                      <Icon name="chevron" size={16} />
                    </button>
                  </div>
                </section>

                <section className="panel plan-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">THE BUILD PLAN</span>
                      <h2>Milestones</h2>
                    </div>
                    <button
                      className="icon-button subtle"
                      type="button"
                      aria-label="Open roadmap"
                      onClick={() => openScreen('roadmap')}
                    >
                      <Icon name="arrow-up-right" size={17} />
                    </button>
                  </div>
                  <div className="milestone-list">
                    <div className="milestone-item current">
                      <div className="milestone-marker">
                        <Icon name="check" size={13} />
                      </div>
                      <div className="milestone-copy">
                        <div>
                          <strong>Desktop foundation</strong>
                          <span className="tag tag-mint">Running</span>
                        </div>
                        <p>Electron + React + TypeScript scaffold</p>
                        <small>Milestone 01 · Local app</small>
                      </div>
                    </div>
                    <div className="milestone-item">
                      <div className="milestone-marker numbered">02</div>
                      <div className="milestone-copy">
                        <div>
                          <strong>Dashboard & documentation</strong>
                          <span className="tag tag-violet">Now</span>
                        </div>
                        <p>Build the shell and prepare the public repo</p>
                        <small>Milestone 02 · UI + README</small>
                      </div>
                    </div>
                    <div className="milestone-item">
                      <div className="milestone-marker numbered">03</div>
                      <div className="milestone-copy">
                        <div>
                          <strong>Provider gateway</strong>
                        </div>
                        <p>Secure model interface and error handling</p>
                        <small>Milestone 03 · Planned</small>
                      </div>
                    </div>
                    <div className="milestone-item">
                      <div className="milestone-marker numbered">04</div>
                      <div className="milestone-copy">
                        <div>
                          <strong>Streaming chat</strong>
                        </div>
                        <p>Responses, cancellation and visible state</p>
                        <small>Milestone 04 · Planned</small>
                      </div>
                    </div>
                  </div>
                  <button
                    className="full-width-link"
                    type="button"
                    onClick={() => openScreen('roadmap')}
                  >
                    See all milestones <Icon name="arrow-up-right" size={15} />
                  </button>
                </section>
              </div>

              <section className="bottom-grid">
                <div className="panel system-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">SYSTEM HEALTH</span>
                      <h2>Workspace status</h2>
                    </div>
                    <span className="tag tag-mint">App running</span>
                  </div>
                  <div className="health-row">
                    <span className="health-icon">
                      <Icon name="check" size={15} />
                    </span>
                    <span className="health-copy">
                      <strong>Desktop shell</strong>
                      <small>Electron window opened successfully</small>
                    </span>
                    <span className="health-status">Ready</span>
                  </div>
                  <div className="health-row">
                    <span className="health-icon">
                      <Icon name="check" size={15} />
                    </span>
                    <span className="health-copy">
                      <strong>Renderer typecheck</strong>
                      <small>TypeScript checks passed earlier</small>
                    </span>
                    <span className="health-status">Passed</span>
                  </div>
                  <div className="health-row pending">
                    <span className="health-icon">
                      <Icon name="clock" size={15} />
                    </span>
                    <span className="health-copy">
                      <strong>AI provider connection</strong>
                      <small>No provider keys or network calls configured</small>
                    </span>
                    <span className="health-status neutral">Not set</span>
                  </div>
                </div>
                <div className="panel safety-panel">
                  <div className="safety-art">
                    <div className="safety-orbit" />
                    <div className="safety-shield">
                      <Icon name="shield" size={26} />
                    </div>
                  </div>
                  <div className="safety-copy">
                    <span className="section-kicker">BUILT WITH CARE</span>
                    <h2>
                      Powerful tools.
                      <br />
                      <span>Human approval.</span>
                    </h2>
                    <p>
                      Future tool use, shell commands, camera access and external connections should
                      be opt-in, visible and reviewable.
                    </p>
                    <button
                      className="text-link"
                      type="button"
                      onClick={() => openScreen('roadmap')}
                    >
                      Read the safety principles <Icon name="arrow-up-right" size={14} />
                    </button>
                  </div>
                </div>
              </section>

              <footer className="page-footer">
                <span>
                  DIS AI Dev <span className="footer-separator">/</span> Early-stage project
                </span>
                <span>
                  <span className="footer-dot" /> Local UI preview{' '}
                  <span className="footer-separator">·</span> No AI provider connected
                </span>
              </footer>
            </>
          ) : (
            <section className="module-page">
              <div className="module-breadcrumb">
                <button type="button" onClick={() => openScreen('overview')}>
                  Overview
                </button>
                <Icon name="chevron" size={14} />
                <span>{navItems.find((item) => item.id === activeScreen)?.label}</span>
              </div>
              <div className="module-hero">
                <div className="module-icon">
                  <Icon name={screenCopy[activeScreen].icon} size={26} />
                </div>
                <span className="eyebrow">
                  <span className="eyebrow-line" /> {screenCopy[activeScreen].eyebrow}
                </span>
                <h1>{screenCopy[activeScreen].title}</h1>
                <p>{screenCopy[activeScreen].description}</p>
                <span className="tag tag-violet module-state">
                  {screenCopy[activeScreen].status}
                </span>
              </div>
              <div className="module-content-grid">
                <div className="panel module-next">
                  <span className="section-kicker">RECOMMENDED NEXT STEP</span>
                  <h2>Build the foundation first.</h2>
                  <p>{screenCopy[activeScreen].next}</p>
                  <button
                    className="button-primary"
                    type="button"
                    onClick={() => openScreen(activeScreen === 'roadmap' ? 'overview' : 'roadmap')}
                  >
                    {activeScreen === 'roadmap' ? 'Return to overview' : 'Review roadmap'}{' '}
                    <Icon name="arrow-up-right" size={15} />
                  </button>
                </div>
                <div className="panel module-boundary">
                  <div className="boundary-icon">
                    <Icon name="shield" size={20} />
                  </div>
                  <h3>Current capability boundary</h3>
                  <p>
                    This page is an interactive UI placeholder. It does not call an AI model, run
                    shell commands, store memory, access the camera or connect external services.
                  </p>
                  <div className="boundary-foot">
                    <span className="mini-dot mint-dot" /> Explicitly marked as not connected
                  </div>
                </div>
              </div>
              <div className="module-backdrop">
                <div className="backdrop-grid" />
                <Icon name={screenCopy[activeScreen].icon} size={100} />
              </div>
            </section>
          )}
        </div>
      </main>

      {toast ? (
        <div className="toast" role="status">
          <Icon name="shield" size={17} />
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} aria-label="Dismiss message">
            ×
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default App
