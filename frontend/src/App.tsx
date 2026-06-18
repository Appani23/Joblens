import { useEffect, useState } from 'react'
import Sidebar, { type View } from './components/Sidebar'
import SearchBar from './components/SearchBar'
import AuthModal from './components/AuthModal'
import JobDetailPanel from './components/JobDetailPanel'
import AllJobsView from './views/AllJobsView'
import RecommendedView from './views/RecommendedView'
import ResumeView from './views/ResumeView'
import FavoritesView from './views/FavoritesView'
import AppliedView from './views/AppliedView'
import SettingsView from './views/SettingsView'
import { useAuth } from './context/AuthContext'
import { useToast } from './context/ToastContext'
import { getMyJobStatus, toggleFavorite, toggleApplied } from './api/matchApi'
import type { PanelItem } from './types/panel'
import type { DrawerFilters } from './types/filters'
import { DEFAULT_FILTER } from './types/filters'
import type { FilterState } from './types/filters'

// ── Per-view filter state ─────────────────────────────────────────────────────

type FilterableView = 'all' | 'recommended' | 'favorites' | 'applied'

function isFilterable(v: View): v is FilterableView {
  return v === 'all' || v === 'recommended' || v === 'favorites' || v === 'applied'
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { user, token, logout, restoring } = useAuth()
  const { addToast } = useToast()

  // ── Auth modal ───────────────────────────────────────────────────────────────
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

  // ── Navigation ───────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<View>('all')

  useEffect(() => {
    if (!user && activeView !== 'all') setActiveView('all')
  }, [user, activeView])

  // ── Per-view filter state ────────────────────────────────────────────────────
  const [viewFilters, setViewFilters] = useState<Record<FilterableView, FilterState>>({
    all:         { ...DEFAULT_FILTER },
    recommended: { ...DEFAULT_FILTER },
    favorites:   { ...DEFAULT_FILTER },
    applied:     { ...DEFAULT_FILTER },
  })

  const currentFilters: FilterState =
    isFilterable(activeView) ? viewFilters[activeView] : { ...DEFAULT_FILTER }

  function updateFilter(updates: Partial<FilterState>) {
    if (!isFilterable(activeView)) return
    setViewFilters(prev => ({
      ...prev,
      [activeView]: { ...prev[activeView], ...updates },
    }))
  }

  function applyDrawerFilters(f: DrawerFilters) {
    if (!isFilterable(activeView)) return
    setViewFilters(prev => ({
      ...prev,
      [activeView]: { ...prev[activeView], ...f, page: 0 },
    }))
  }

  function clearAll() {
    if (!isFilterable(activeView)) return
    setViewFilters(prev => ({ ...prev, [activeView]: { ...DEFAULT_FILTER } }))
  }

  function setPage(page: number) {
    if (!isFilterable(activeView)) return
    setViewFilters(prev => ({
      ...prev,
      [activeView]: { ...prev[activeView], page },
    }))
  }

  const { rawWhat, rawWhere, datePostedDays, jobLevels, workModes, sort, minScore, page } =
    currentFilters

  const appliedDrawer: DrawerFilters = { datePostedDays, jobLevels, workModes, minScore }

  // ── Job status (favorites / applied) ─────────────────────────────────────────
  const [jobStatus, setJobStatus] = useState<Record<number, { favorited: boolean; applied: boolean }>>({})

  useEffect(() => {
    if (!token) { setJobStatus({}); return }
    getMyJobStatus(token)
      .then(entries => {
        const map: Record<number, { favorited: boolean; applied: boolean }> = {}
        entries.forEach(e => { map[e.jobId] = { favorited: e.favorited, applied: e.applied } })
        setJobStatus(map)
      })
      .catch(() => {})
  }, [token])

  function handleFavorite(jobId: number, favorited: boolean) {
    if (!token) { openAuth('login'); return }
    setJobStatus(prev => ({
      ...prev,
      [jobId]: { ...(prev[jobId] ?? { applied: false }), favorited },
    }))
    toggleFavorite(token, jobId, favorited).catch(() => {
      setJobStatus(prev => ({
        ...prev,
        [jobId]: { ...(prev[jobId] ?? { applied: false }), favorited: !favorited },
      }))
      addToast('Failed to update favorite', 'error')
    })
  }

  // ── Apply tracking ────────────────────────────────────────────────────────────
  const [pendingApply, setPendingApply] = useState<{ jobId: number; title: string } | null>(null)
  const [applyPrompt, setApplyPrompt]   = useState<{ jobId: number; title: string } | null>(null)

  function handleApply(jobId: number, title: string) {
    if (token) setPendingApply({ jobId, title })
  }

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && pendingApply) {
        const pa = pendingApply
        setPendingApply(null)
        setApplyPrompt(pa)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [pendingApply])

  function confirmApplied(didApply: boolean) {
    if (!applyPrompt || !token) { setApplyPrompt(null); return }
    const { jobId } = applyPrompt
    setApplyPrompt(null)
    if (!didApply) return
    addToast('Marked as applied!', 'neutral')
    setJobStatus(prev => ({
      ...prev,
      [jobId]: { ...(prev[jobId] ?? { favorited: false }), applied: true },
    }))
    toggleApplied(token, jobId, true).catch(() => {
      setJobStatus(prev => ({
        ...prev,
        [jobId]: { ...(prev[jobId] ?? { favorited: false }), applied: false },
      }))
    })
  }

  useEffect(() => {
    if (!applyPrompt) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setApplyPrompt(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [applyPrompt])

  // ── Detail panel ──────────────────────────────────────────────────────────────
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null)

  // ── Auth-gated login prompt ───────────────────────────────────────────────────
  function LoginPrompt() {
    return (
      <div className="flex flex-col items-center justify-center py-36 gap-4 text-center">
        <p className="text-slate-300 font-semibold">Log in to access this feature</p>
        <button
          onClick={() => openAuth('login')}
          className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg transition-colors"
        >
          Log in
        </button>
      </div>
    )
  }

  const statusProps = {
    jobStatus,
    onFavorite: handleFavorite,
    onApply: handleApply,
    onCardClick: setPanelItem,
  }

  const searchBarProps = {
    rawWhat,
    rawWhere,
    onWhatChange:    (v: string) => updateFilter({ rawWhat: v, page: 0 }),
    onWhereChange:   (v: string) => updateFilter({ rawWhere: v, page: 0 }),
    sort,
    onSortChange:    (v: FilterState['sort']) => updateFilter({ sort: v, page: 0 }),
    applied:         appliedDrawer,
    onApplyDrawer:   applyDrawerFilters,
    onClearAll:      clearAll,
  }

  return (
    <div className="flex h-screen bg-[#080b12] text-white antialiased overflow-hidden">

      <Sidebar
        active={activeView}
        user={user}
        restoring={restoring}
        onNavigate={v => setActiveView(v)}
        onLogin={() => openAuth('login')}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 py-6">

          {activeView === 'all' && (
            <>
              <SearchBar {...searchBarProps} showMinScore={false} />
              <AllJobsView
                rawWhat={rawWhat} rawWhere={rawWhere} datePostedDays={datePostedDays}
                sort={sort} jobLevels={jobLevels} workModes={workModes}
                page={page} onPageChange={setPage} onClear={clearAll}
                {...statusProps}
              />
            </>
          )}

          {activeView === 'recommended' && (
            user && token
              ? (
                <>
                  <SearchBar {...searchBarProps} showMinScore={true} />
                  <RecommendedView
                    token={token}
                    rawWhat={rawWhat} rawWhere={rawWhere}
                    jobLevels={jobLevels} workModes={workModes}
                    sort={sort} minScore={minScore}
                    {...statusProps}
                  />
                </>
              )
              : <LoginPrompt />
          )}

          {activeView === 'favorites' && (
            user && token
              ? (
                <>
                  <SearchBar {...searchBarProps} showMinScore={false} />
                  <FavoritesView
                    token={token}
                    rawWhat={rawWhat} rawWhere={rawWhere}
                    jobLevels={jobLevels} workModes={workModes} sort={sort}
                    onFavorite={handleFavorite} onApply={handleApply} onCardClick={setPanelItem}
                  />
                </>
              )
              : <LoginPrompt />
          )}

          {activeView === 'applied' && (
            user && token
              ? (
                <>
                  <SearchBar {...searchBarProps} showMinScore={false} />
                  <AppliedView
                    token={token}
                    rawWhat={rawWhat} rawWhere={rawWhere}
                    jobLevels={jobLevels} workModes={workModes} sort={sort}
                    onFavorite={handleFavorite} onApply={handleApply} onCardClick={setPanelItem}
                  />
                </>
              )
              : <LoginPrompt />
          )}

          {activeView === 'resume' && (
            user && token ? <ResumeView token={token} /> : <LoginPrompt />
          )}

          {activeView === 'settings' && (
            user && token
              ? <SettingsView token={token} user={user} onLogout={handleLogout} />
              : <LoginPrompt />
          )}

        </main>
      </div>

      {/* Detail panel */}
      <JobDetailPanel
        item={panelItem}
        favorited={panelItem ? (jobStatus[panelItem.jobId]?.favorited ?? false) : false}
        applied={panelItem ? (jobStatus[panelItem.jobId]?.applied ?? false) : false}
        onClose={() => setPanelItem(null)}
        onFavorite={handleFavorite}
        onApply={handleApply}
      />

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />

      {/* "Did you apply?" modal */}
      {applyPrompt && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setApplyPrompt(null)}
            aria-hidden
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 pointer-events-auto">
              <div className="space-y-1.5">
                <p className="text-white font-bold text-lg leading-snug">{applyPrompt.title}</p>
                <p className="text-slate-300 text-sm">Did you apply to this job?</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirmApplied(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
                >
                  Yes, I applied
                </button>
                <button
                  onClick={() => confirmApplied(false)}
                  className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-medium text-sm transition-colors"
                >
                  Not yet
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
