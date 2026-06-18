import type { MatchResult } from '../api/matchApi'
import { timeAgo, LevelPill, WorkModePill, ApplyButton } from './JobCard'

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 85
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
      : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'
  return (
    <span className={`shrink-0 text-sm font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${cls}`}>
      {score}%
    </span>
  )
}

interface Props {
  match: MatchResult
  favorited?: boolean
  applied?: boolean
  onFavorite?: (jobId: number, favorited: boolean) => void
  onCardClick?: () => void
  onApply?: (jobId: number, title: string) => void
}

export default function MatchCard({
  match, favorited = false, applied = false, onFavorite, onCardClick, onApply,
}: Props) {
  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    onFavorite?.(match.jobId, !favorited)
  }

  return (
    <article
      onClick={onCardClick}
      className={`group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-3
        transition-all duration-200 hover:border-indigo-500/30 hover:bg-slate-800/50
        hover:shadow-xl hover:shadow-black/30 ${onCardClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Row 1: Title + Score badge + Favorite */}
      <div className="flex items-start gap-2">
        <h2 className="flex-1 text-slate-100 font-semibold text-[0.92rem] leading-snug line-clamp-2">
          {match.title}
        </h2>
        <ScoreBadge score={match.score} />
        <button
          onClick={handleFavorite}
          aria-label={favorited ? 'Unfavorite' : 'Favorite'}
          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-colors
            ${favorited
              ? 'text-rose-400 bg-rose-500/15 hover:bg-rose-500/25'
              : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Reasoning */}
      {match.reasoning && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 -mt-0.5">
          {match.reasoning}
        </p>
      )}

      {/* Company + Location */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        {match.company && (
          <span className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{match.company}</span>
          </span>
        )}
        {match.location && (
          <span className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{match.location}</span>
          </span>
        )}
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5">
        {match.jobLevel && <LevelPill level={match.jobLevel} />}
        {match.workMode && <WorkModePill mode={match.workMode} />}
        {applied && (
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Applied
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-800/80">
        <span className="text-xs text-slate-500 whitespace-nowrap">
          Matched {timeAgo(match.matchedAt)}
        </span>
        {match.applyUrl && (
          <ApplyButton
            href={match.applyUrl}
            onApply={onApply ? () => onApply(match.jobId, match.title) : undefined}
          />
        )}
      </div>
    </article>
  )
}
