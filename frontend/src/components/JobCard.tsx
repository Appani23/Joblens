import type { Job } from '../types/job'

interface Props {
  job: Job
}

function timeAgo(dateStr: string | null): string {
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

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

// Adzuna descriptions sometimes contain raw HTML tags — strip them for the preview
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const SOURCE_STYLES: Record<string, string> = {
  Adzuna: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
}
const DEFAULT_SOURCE_STYLE = 'bg-slate-700/30 text-slate-400 border border-slate-700/40'

export default function JobCard({ job }: Props) {
  const salary = formatSalary(job.salaryMin, job.salaryMax)
  const sourceStyle = SOURCE_STYLES[job.source] ?? DEFAULT_SOURCE_STYLE
  const description = job.description ? stripHtml(job.description) : null

  return (
    <article className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-4 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-black/40 cursor-default">

      {/* Title + source badge */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-slate-100 font-semibold text-[0.95rem] leading-snug line-clamp-2 flex-1">
          {job.title}
        </h2>
        <span className={`shrink-0 text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${sourceStyle}`}>
          {job.source}
        </span>
      </div>

      {/* Company + location */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
        {job.company && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {job.company}
          </span>
        )}
        {job.location && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        )}
      </div>

      {/* Description preview */}
      {description && (
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          {salary && (
            <span className="shrink-0 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              {salary}
            </span>
          )}
          <span className="text-xs text-slate-700 whitespace-nowrap">
            {timeAgo(job.postedDate)}
          </span>
        </div>

        {job.applyUrl && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-150"
            onClick={e => e.stopPropagation()}
          >
            Apply
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </article>
  )
}
