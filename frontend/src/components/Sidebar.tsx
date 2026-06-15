import type { AuthUser } from '../context/AuthContext'

export type View = 'all' | 'recommended' | 'resume'

interface Props {
  active: View
  user: AuthUser | null
  restoring: boolean
  onNavigate: (v: View) => void
  onLogin: () => void
  onLogout: () => void
}

// ── Icons (inline SVGs keep dependencies zero) ────────────────────────────────

function IconBriefcase() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  )
}

function IconSparkle() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconCog() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left',
        active
          ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
      ].join(' ')}
    >
      <span className={active ? 'text-indigo-400' : 'text-slate-500'}>{icon}</span>
      <span className="hidden md:block">{label}</span>
    </button>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar({ active, user, restoring, onNavigate, onLogin, onLogout }: Props) {
  const avatar = user ? (user.name ?? user.email).charAt(0).toUpperCase() : null

  return (
    <aside className="w-16 md:w-60 h-screen shrink-0 flex flex-col border-r border-slate-800/60 bg-[#080b12]">

      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-3 md:px-4 border-b border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="hidden md:block text-base font-bold tracking-tight text-white">JobLens</span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 md:px-3 flex flex-col gap-1">
        <NavItem
          icon={<IconBriefcase />}
          label="All Jobs"
          active={active === 'all'}
          onClick={() => onNavigate('all')}
        />
        <NavItem
          icon={<IconSparkle />}
          label="Recommended"
          active={active === 'recommended'}
          onClick={() => user ? onNavigate('recommended') : onLogin()}
        />
        <NavItem
          icon={<IconDocument />}
          label="Resume"
          active={active === 'resume'}
          onClick={() => user ? onNavigate('resume') : onLogin()}
        />
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 px-2 md:px-3 pb-4 flex flex-col gap-1">
        {/* Settings (no-op for now) */}
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
            text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors text-left"
        >
          <IconCog />
          <span className="hidden md:block">Settings</span>
        </button>

        {/* User */}
        {!restoring && (
          user ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                {avatar}
              </div>
              <div className="hidden md:flex flex-col flex-1 min-w-0">
                <span className="text-xs font-medium text-slate-300 truncate">
                  {user.name ?? user.email}
                </span>
                <button
                  onClick={onLogout}
                  className="text-[0.65rem] text-slate-600 hover:text-slate-400 text-left transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 px-1 md:px-0">
              <button
                onClick={onLogin}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium
                  text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white
                  bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <span className="hidden md:inline">Log in</span>
                <span className="md:hidden">←</span>
              </button>
            </div>
          )
        )}
      </div>
    </aside>
  )
}
