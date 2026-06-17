import type { Job } from '../types/job'

// ── Shared helpers ────────────────────────────────────────────────────────────

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Recently'
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  const hours = Math.floor(seconds / 3600)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(seconds / 86400)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// ── Pill components ───────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<string, string> = {
  Junior: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Mid:    'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  Senior: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
}

const MODE_STYLES: Record<string, string> = {
  Remote: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Hybrid: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  Onsite: 'bg-slate-700/40 text-slate-400 border border-slate-700/60',
}

export function LevelPill({ level }: { level: string }) {
  return (
    <span className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${LEVEL_STYLES[level] ?? 'bg-slate-700/40 text-slate-400 border border-slate-700/60'}`}>
      {level}
    </span>
  )
}

export function WorkModePill({ mode }: { mode: string }) {
  return (
    <span className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${MODE_STYLES[mode] ?? 'bg-slate-700/40 text-slate-400 border border-slate-700/60'}`}>
      {mode}
    </span>
  )
}

// ── Apply button ──────────────────────────────────────────────────────────────

export function ApplyButton({ href, onApply }: { href: string; onApply?: () => void }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => { e.stopPropagation(); onApply?.() }}
      className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold
        px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white
        transition-colors duration-150"
    >
      Apply
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

// ── JobCard ───────────────────────────────────────────────────────────────────

interface Props {
  job: Job
  favorited?: boolean
  applied?: boolean
  onFavorite?: (jobId: number, favorited: boolean) => void
  onCardClick?: () => void
  onApply?: (jobId: number, title: string) => void
}

export default function JobCard({
  job, favorited = false, applied = false, onFavorite, onCardClick, onApply,
}: Props) {
  const salary = formatSalary(job.salaryMin, job.salaryMax)

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    onFavorite?.(job.id, !favorited)
  }

  return (
    <article
      onClick={onCardClick}
      className={`group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-3
        transition-all duration-200 hover:border-indigo-500/30 hover:bg-slate-800/50
        hover:shadow-xl hover:shadow-black/30 ${onCardClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Row 1: Title + Favorite */}
      <div className="flex items-start gap-2">
        <h2 className="flex-1 text-slate-100 font-semibold text-[0.92rem] leading-snug line-clamp-2">
          {job.title}
        </h2>
        <button
          onClick={handleFavorite}
          aria-label={favorited ? 'Unfavorite' : 'Favorite'}
          className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors
            ${favorited
              ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
              : 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Row 2: Company + Location */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        {job.company && (
          <span className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{job.company}</span>
          </span>
        )}
        {job.location && (
          <span className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{job.location}</span>
          </span>
        )}
      </div>

      {/* Row 3: Pills */}
      <div className="flex flex-wrap gap-1.5">
        {job.jobLevel && <LevelPill level={job.jobLevel} />}
        {job.workMode && <WorkModePill mode={job.workMode} />}
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {job.source}
        </span>
        {applied && (
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Applied
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          {salary && (
            <span className="shrink-0 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              {salary}
            </span>
          )}
          <span className="text-xs text-slate-700 whitespace-nowrap">{timeAgo(job.postedDate)}</span>
        </div>
        {job.applyUrl && (
          <ApplyButton
            href={job.applyUrl}
            onApply={onApply ? () => onApply(job.id, job.title) : undefined}
          />
        )}
      </div>
    </article>
  )
}
