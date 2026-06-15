import type { MatchResult } from '../api/matchApi'

function timeAgo(dateStr: string): string {
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

function scoreBadgeClass(score: number): string {
  if (score >= 85) return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
  if (score >= 70) return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
  return 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
}

export default function MatchCard({ match }: { match: MatchResult }) {
  return (
    <article className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-3 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-black/40 cursor-default">

      {/* Title + score badge */}
      <div className="flex items-start gap-3">
        <h2 className="flex-1 text-slate-100 font-semibold text-[0.95rem] leading-snug line-clamp-2 min-w-0">
          {match.title}
        </h2>
        <span className={`shrink-0 text-sm font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${scoreBadgeClass(match.score)}`}>
          {match.score}%
        </span>
      </div>

      {/* Claude's one-line reasoning */}
      {match.reasoning && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 -mt-0.5">
          {match.reasoning}
        </p>
      )}

      {/* Company + location */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
        {match.company && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {match.company}
          </span>
        )}
        {match.location && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {match.location}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-slate-800/80">
        <span className="text-xs text-slate-700 whitespace-nowrap">
          Matched {timeAgo(match.matchedAt)}
        </span>
        {match.applyUrl && (
          <a
            href={match.applyUrl}
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
