import { useEffect, useState } from 'react'
import { getMyJobStatus, extractMatchApiError, type JobStatusEntry } from '../api/matchApi'
import { statusToPanel, type PanelItem } from '../types/panel'
import { LevelPill, WorkModePill, ApplyButton, formatSalary } from '../components/JobCard'

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <svg className="w-7 h-7 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

function AppliedCard({
  entry, onFavorite, onApply, onCardClick,
}: {
  entry: JobStatusEntry
  onFavorite: (jobId: number, favorited: boolean) => void
  onApply: (jobId: number, title: string) => void
  onCardClick: (item: PanelItem) => void
}) {
  const salary = formatSalary(entry.salaryMin, entry.salaryMax)
  const appliedDate = entry.appliedAt
    ? new Date(entry.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <article
      onClick={() => onCardClick(statusToPanel(entry))}
      className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-3
        transition-all duration-200 hover:border-indigo-500/30 hover:bg-slate-800/50
        hover:shadow-xl hover:shadow-black/30 cursor-pointer"
    >
      <div className="flex items-start gap-2">
        <h2 className="flex-1 text-slate-100 font-semibold text-[0.92rem] leading-snug line-clamp-2">
          {entry.title}
        </h2>
        {entry.score != null && (
          <span className={`shrink-0 text-sm font-bold px-2.5 py-1 rounded-full border whitespace-nowrap
            ${entry.score >= 85
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'}`}>
            {entry.score}%
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onFavorite(entry.jobId, !entry.favorited) }}
          aria-label={entry.favorited ? 'Unfavorite' : 'Favorite'}
          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-colors
            ${entry.favorited
              ? 'text-rose-400 bg-rose-500/15 hover:bg-rose-500/25'
              : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill={entry.favorited ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        {entry.company && <span className="truncate">{entry.company}</span>}
        {entry.location && <span className="truncate text-slate-600">{entry.location}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {entry.jobLevel && <LevelPill level={entry.jobLevel} />}
        {entry.workMode && <WorkModePill mode={entry.workMode} />}
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Applied{appliedDate && ` · ${appliedDate}`}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          {salary && (
            <span className="shrink-0 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              {salary}
            </span>
          )}
          {entry.source && (
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {entry.source}
            </span>
          )}
        </div>
        {entry.applyUrl && (
          <ApplyButton
            href={entry.applyUrl}
            onApply={() => onApply(entry.jobId, entry.title)}
          />
        )}
      </div>
    </article>
  )
}

interface Props {
  token: string
  rawWhat: string
  rawWhere: string
  jobLevels: string[]
  workModes: string[]
  sort: 'recent' | 'relevance' | 'salary'
  onFavorite: (jobId: number, favorited: boolean) => void
  onApply: (jobId: number, title: string) => void
  onCardClick: (item: PanelItem) => void
}

export default function AppliedView({
  token, rawWhat, rawWhere, jobLevels, workModes, sort, onFavorite, onApply, onCardClick,
}: Props) {
  const [entries, setEntries] = useState<JobStatusEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMyJobStatus(token)
      .then(data => { if (!cancelled) { setEntries(data); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(extractMatchApiError(err)); setLoading(false) } })
    return () => { cancelled = true }
  }, [token])

  function handleFavoriteInView(jobId: number, newFavorited: boolean) {
    setEntries(prev => prev.map(e => e.jobId === jobId ? { ...e, favorited: newFavorited } : e))
    onFavorite(jobId, newFavorited)
  }

  const applied = entries.filter(e => e.applied)

  const filtered = applied.filter(e => {
    if (rawWhat && !e.title.toLowerCase().includes(rawWhat.toLowerCase())) return false
    if (rawWhere && !e.location?.toLowerCase().includes(rawWhere.toLowerCase())) return false
    if (jobLevels.length > 0 && !jobLevels.includes(e.jobLevel ?? '')) return false
    if (workModes.length > 0 && !workModes.includes(e.workMode ?? '')) return false
    return true
  })

  const displayed = [...filtered].sort((a, b) => {
    if (sort === 'relevance') return (b.score ?? -Infinity) - (a.score ?? -Infinity)
    if (sort === 'salary') return (b.salaryMax ?? -Infinity) - (a.salaryMax ?? -Infinity)
    return (b.appliedAt ?? '').localeCompare(a.appliedAt ?? '')
  })

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-slate-400 font-medium">Failed to load applied jobs</p>
        <p className="text-slate-600 text-sm">{error}</p>
      </div>
    )
  }

  if (applied.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-200 font-semibold mb-1">No applications tracked yet</p>
          <p className="text-slate-500 text-sm">After clicking Apply on a job, confirm you applied to track it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h1 className="text-base font-bold text-white tracking-tight">Applied</h1>
        <p className="text-xs text-slate-600 tabular-nums">
          {displayed.length} of {applied.length}
        </p>
      </div>
      {displayed.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-20">No applied jobs match current filters.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayed.map(e => (
            <AppliedCard
              key={e.jobId}
              entry={e}
              onFavorite={handleFavoriteInView}
              onApply={onApply}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
