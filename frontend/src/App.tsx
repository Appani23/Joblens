import { useEffect, useState } from 'react'
import Sidebar, { type View } from './components/Sidebar'
import FilterBar from './components/FilterBar'
import AuthModal from './components/AuthModal'
import AllJobsView from './views/AllJobsView'
import RecommendedView from './views/RecommendedView'
import ResumeView from './views/ResumeView'
import { useAuth } from './context/AuthContext'
import { useToast } from './context/ToastContext'

export default function App() {
  const { user, token, logout, restoring } = useAuth()
  const { addToast } = useToast()

  // ── Auth modal ─────────────────────────────────────────────────────────────
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  function openAuth(mode: 'login' | 'signup' = 'login') {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  function handleLogout() {
    logout()
    addToast("You've been logged out.", 'neutral')
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<View>('all')

  // Drop back to All Jobs when the user logs out
  useEffect(() => {
    if (!user && (activeView === 'recommended' || activeView === 'resume')) {
      setActiveView('all')
    }
  }, [user, activeView])

  // ── Shared filter state (persists across view switches) ────────────────────
  const [rawWhat, setRawWhat]         = useState('')
  const [rawWhere, setRawWhere]        = useState('')
  const [datePostedDays, setDatePostedDays] = useState<number | undefined>(undefined)
  const [sort, setSort]               = useState<'recent' | 'relevance'>('recent')
  const [jobLevel, setJobLevel]        = useState('')
  const [workMode, setWorkMode]        = useState('')
  const [page, setPage]               = useState(0)   // used by AllJobsView

  // Reset page whenever a filter changes (so AllJobsView starts at page 0)
  const handleWhatChange    = (v: string)             => { setRawWhat(v);         setPage(0) }
  const handleWhereChange   = (v: string)             => { setRawWhere(v);        setPage(0) }
  const handleDateChange    = (v: number | undefined) => { setDatePostedDays(v);  setPage(0) }
  const handleSortChange    = (v: 'recent' | 'relevance') => { setSort(v);        setPage(0) }
  const handleLevelChange   = (v: string)             => { setJobLevel(v);        setPage(0) }
  const handleWorkModeChange = (v: string)            => { setWorkMode(v);        setPage(0) }
  const handleClear = () => {
    setRawWhat(''); setRawWhere('')
    setDatePostedDays(undefined); setSort('recent')
    setJobLevel(''); setWorkMode('')
    setPage(0)
  }

  // FilterBar is shown for All Jobs + Recommended (not for Resume)
  const showFilters = activeView === 'all' || activeView === 'recommended'

  return (
    <div className="flex h-screen bg-[#080b12] text-white antialiased overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Sidebar
        active={activeView}
        user={user}
        restoring={restoring}
        onNavigate={v => { setActiveView(v); setPage(0) }}
        onLogin={() => openAuth('login')}
        onLogout={handleLogout}
      />

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Filter bar — only for All Jobs + Recommended */}
        {showFilters && (
          <FilterBar
            what={rawWhat}
            where={rawWhere}
            datePostedDays={datePostedDays}
            sort={sort}
            jobLevel={jobLevel}
            workMode={workMode}
            onWhatChange={handleWhatChange}
            onWhereChange={handleWhereChange}
            onDatePostedDaysChange={handleDateChange}
            onSortChange={handleSortChange}
            onJobLevelChange={handleLevelChange}
            onWorkModeChange={handleWorkModeChange}
            onClear={handleClear}
          />
        )}

        {/* Resume view gets its own simple header bar */}
        {activeView === 'resume' && (
          <div className="h-14 flex items-center px-6 border-b border-slate-800/60 shrink-0">
            <span className="text-sm text-slate-500">Resume</span>
          </div>
        )}

        {/* Scrollable main */}
        <main className="flex-1 overflow-y-auto px-6 py-6">

          {/* All Jobs */}
          {activeView === 'all' && (
            <AllJobsView
              rawWhat={rawWhat}
              rawWhere={rawWhere}
              datePostedDays={datePostedDays}
              sort={sort}
              jobLevel={jobLevel}
              workMode={workMode}
              page={page}
              onPageChange={setPage}
              onClear={handleClear}
            />
          )}

          {/* Recommended — only rendered when logged in */}
          {activeView === 'recommended' && (
            user && token
              ? (
                <RecommendedView
                  token={token}
                  rawWhat={rawWhat}
                  rawWhere={rawWhere}
                  jobLevel={jobLevel}
                  workMode={workMode}
                />
              )
              : (
                <div className="flex flex-col items-center justify-center py-36 gap-4 text-center">
                  <p className="text-slate-300 font-semibold">Log in to see your recommended jobs</p>
                  <button
                    onClick={() => openAuth('login')}
                    className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg transition-colors"
                  >
                    Log in
                  </button>
                </div>
              )
          )}

          {/* Resume — only rendered when logged in */}
          {activeView === 'resume' && (
            user && token
              ? <ResumeView token={token} />
              : (
                <div className="flex flex-col items-center justify-center py-36 gap-4 text-center">
                  <p className="text-slate-300 font-semibold">Log in to manage your resume</p>
                  <button
                    onClick={() => openAuth('login')}
                    className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg transition-colors"
                  >
                    Log in
                  </button>
                </div>
              )
          )}

        </main>
      </div>

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  )
}
