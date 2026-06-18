import { useEffect, useRef, useState } from 'react'
import { fetchJobs } from '../api/api'
import type { Job, PageResponse } from '../types/job'
import { jobToPanel, type PanelItem } from '../types/panel'
import { useDebounce } from '../hooks/useDebounce'
import JobCard from '../components/JobCard'

// ── Sub-components ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-4">
      <div className="flex justify-between gap-3">
        <div className="h-5 bg-slate-800 rounded-lg w-3/4" />
        <div className="h-5 bg-slate-800 rounded-full w-10 shrink-0" />
      </div>
      <div className="flex gap-3">
        <div className="h-4 bg-slate-800 rounded w-28" />
        <div className="h-4 bg-slate-800 rounded w-24" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-slate-800 rounded-full w-14" />
        <div className="h-5 bg-slate-800 rounded-full w-16" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="h-5 bg-slate-800 rounded-full w-24" />
        <div className="h-7 bg-slate-800 rounded-lg w-16" />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-36 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-slate-300 font-semibold mb-1">Could not load jobs</p>
        <p className="text-slate-600 text-sm max-w-xs">{message}</p>
        <p className="text-slate-700 text-xs mt-2">Make sure job-aggregator-service is running on :8083</p>
      </div>
    </div>
  )
}

function EmptyState({ isFiltered, onClear }: { isFiltered: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-36 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {isFiltered ? (
        <div>
          <p className="text-slate-300 font-semibold mb-1">No jobs match your filters</p>
          <p className="text-slate-600 text-sm mb-4">Try broadening your search or clearing the filters.</p>
          <button
            onClick={onClear}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div>
          <p className="text-slate-300 font-semibold mb-1">No jobs yet</p>
          <p className="text-slate-600 text-sm">
            Trigger a fetch via{' '}
            <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">
              POST /api/jobs/fetch
            </code>
          </p>
        </div>
      )}
    </div>
  )
}

function Pagination({
  page, totalPages, first, last, onPageChange,
}: {
  page: number; totalPages: number; first: boolean; last: boolean
  onPageChange: (n: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-4 mt-10 pt-8 border-t border-slate-800/60">
      <button
        onClick={() => onPageChange(page - 1)} disabled={first}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          border border-slate-800 bg-slate-900 text-slate-300
          hover:border-indigo-500/40 hover:text-white hover:bg-slate-800
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-800
          disabled:hover:bg-slate-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      <span className="text-sm text-slate-500 tabular-nums">
        Page <span className="text-slate-300 font-medium">{page + 1}</span>
        {' '}of{' '}
        <span className="text-slate-300 font-medium">{totalPages}</span>
      </span>
      <button
        onClick={() => onPageChange(page + 1)} disabled={last}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          border border-slate-800 bg-slate-900 text-slate-300
          hover:border-indigo-500/40 hover:text-white hover:bg-slate-800
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-800
          disabled:hover:bg-slate-900 transition-colors"
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

// ── AllJobsView ───────────────────────────────────────────────────────────────

interface Props {
  rawWhat: string
  rawWhere: string
  datePostedDays: number | undefined
  sort: 'recent' | 'relevance' | 'salary'
  jobLevels: string[]
  workModes: string[]
  page: number
  onPageChange: (n: number) => void
  onClear: () => void
  jobStatus: Record<number, { favorited: boolean; applied: boolean }>
  onFavorite: (jobId: number, favorited: boolean) => void
  onApply: (jobId: number, title: string) => void
  onCardClick: (item: PanelItem) => void
}

const PAGE_SIZE = 20

export default function AllJobsView({
  rawWhat, rawWhere, datePostedDays, sort, jobLevels, workModes,
  page, onPageChange, onClear,
  jobStatus, onFavorite, onApply, onCardClick,
}: Props) {
  const [result, setResult] = useState<PageResponse<Job> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const what = useDebounce(rawWhat, 400)
  const where = useDebounce(rawWhere, 400)

  const filterKey = `${what}|${where}|${datePostedDays}|${sort}|${jobLevels.join(',')}|${workModes.join(',')}`
  const prevFilterKey = useRef(filterKey)
  useEffect(() => { prevFilterKey.current = filterKey }, [filterKey])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJobs({
      what: what || undefined,
      where: where || undefined,
      datePostedDays,
      sort,
      jobLevel: jobLevels.length > 0 ? jobLevels : undefined,
      workMode: workModes.length > 0 ? workModes : undefined,
      page,
      size: PAGE_SIZE,
    })
      .then(data => { if (!cancelled) setResult(data) })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unexpected error')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [what, where, datePostedDays, sort, jobLevels, workModes, page])

  const isFiltered =
    rawWhat !== '' || rawWhere !== '' || datePostedDays !== undefined ||
    sort !== 'recent' || jobLevels.length > 0 || workModes.length > 0

  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h1 className="text-base font-bold text-white tracking-tight">
          {isFiltered ? 'Filtered results' : 'Latest Jobs'}
        </h1>
        {result && !loading && (
          <p className="text-xs text-slate-600 shrink-0 tabular-nums">
            {result.totalElements.toLocaleString()} position{result.totalElements !== 1 ? 's' : ''}
            {result.totalPages > 1 && ` · page ${result.number + 1} of ${result.totalPages}`}
          </p>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorState message={error} />}

      {!loading && !error && result && (
        result.content.length === 0
          ? <EmptyState isFiltered={isFiltered} onClear={onClear} />
          : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {result.content.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    favorited={jobStatus[job.id]?.favorited ?? false}
                    applied={jobStatus[job.id]?.applied ?? false}
                    onFavorite={onFavorite}
                    onApply={onApply}
                    onCardClick={() => onCardClick(jobToPanel(job))}
                  />
                ))}
              </div>
              <Pagination
                page={result.number}
                totalPages={result.totalPages}
                first={result.first}
                last={result.last}
                onPageChange={n => { onPageChange(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </>
          )
      )}
    </div>
  )
}
