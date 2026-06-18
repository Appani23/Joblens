import { useEffect } from 'react'
import type { PanelItem } from '../types/panel'
import { LevelPill, WorkModePill, ApplyButton, formatSalary, timeAgo } from './JobCard'

// ── Description parser ────────────────────────────────────────────────────────

const HEADER_RE =
  /^(position\s+descriptions?|job\s+descriptions?|job\s+functions?|responsibilities?|duties|skills?\s+required|required\s+skills?|requirements?|qualifications?|skills?\s+desired|desired\s+skills?|preferred(?:\s+qualifications?)?|nice[\s-]to[\s-]have|educational?\s+qualifications?|education|about\s+(?:the\s+)?(?:role|us|company|job|position)|overview|summary|what\s+you(?:'ll|'ll|\s+will)\s+do|what\s+you(?:'re|'re|\s+are)\s+looking\s+for|key\s+responsibilities?|key\s+requirements?|must[\s-]have|benefits?|compensation|who\s+we(?:\s+are)?|experience):?$/i

const BULLET_RE = /^[*•\-]\s+/
const NUM_RE    = /^\d+[\.\)]\s+/
const isBullet  = (l: string) => BULLET_RE.test(l) || NUM_RE.test(l)

function renderLines(lines: string[]): React.ReactNode {
  if (lines.length === 0) return null
  const bulletCount = lines.filter(isBullet).length
  if (bulletCount > 0) {
    return (
      <ul className="space-y-1.5">
        {lines.map((l, j) => (
          <li key={j} className="flex gap-2">
            <span className="text-slate-600 shrink-0 mt-0.5 select-none">•</span>
            <span>{isBullet(l) ? l.replace(BULLET_RE, '').replace(NUM_RE, '') : l}</span>
          </li>
        ))}
      </ul>
    )
  }
  return <p>{lines.join(' ')}</p>
}

function parseDescription(html: string | null): React.ReactNode {
  if (!html) return null

  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '* ')
    .replace(/<\/[uo]l>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<h[1-6][^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')

  const blocks = text.split('\n\n').map(b => b.trim()).filter(Boolean)

  const elements = blocks.flatMap((block, i) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return []

    if (HEADER_RE.test(lines[0])) {
      const nodes: React.ReactNode[] = [
        <p key={`h${i}`} className="text-[0.65rem] font-semibold uppercase tracking-widest text-indigo-400 mt-4">
          {lines[0].replace(/:$/, '')}
        </p>,
      ]
      if (lines.length > 1) {
        nodes.push(<div key={`c${i}`}>{renderLines(lines.slice(1))}</div>)
      }
      return nodes
    }

    return [<div key={i}>{renderLines(lines)}</div>]
  })

  return (
    <div className="space-y-2 text-sm text-slate-400 leading-relaxed [&>p:first-child]:mt-0">
      {elements}
    </div>
  )
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 85
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
      : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full border ${cls}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      {score}% match
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  item: PanelItem | null
  favorited: boolean
  applied: boolean
  onClose: () => void
  onFavorite: (jobId: number, favorited: boolean) => void
  onApply: (jobId: number, title: string) => void
}

export default function JobDetailPanel({ item, favorited, applied, onClose, onFavorite, onApply }: Props) {
  // ESC to close
  useEffect(() => {
    if (!item) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [item, onClose])

  // Body scroll lock while open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [item])

  const salary = item ? formatSalary(item.salaryMin, item.salaryMax) : null

  if (!item) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className="fixed inset-0 bg-black/70 z-40 animate-[fadeIn_150ms_ease-out]"
      />

      {/* Centered modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div
          className="relative bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl
            w-full max-w-[920px] max-h-[88vh] flex flex-col pointer-events-auto
            animate-[modalIn_200ms_ease-out]"
          onClick={e => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 shrink-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Job Details</p>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            {/* Header */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white leading-snug">{item.title}</h2>

              {/* Company + Location */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-400">
                {item.company && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {item.company}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.location}
                  </span>
                )}
              </div>

              {/* Pills */}
              <div className="flex flex-wrap gap-1.5">
                {item.jobLevel && <LevelPill level={item.jobLevel} />}
                {item.workMode && <WorkModePill mode={item.workMode} />}
                {item.source && (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.source}
                  </span>
                )}
                {applied && (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Applied
                  </span>
                )}
              </div>

              {/* Meta row */}
              {(salary || item.postedDate) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {salary && (
                    <span className="font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      {salary}
                    </span>
                  )}
                  {item.postedDate && <span>{timeAgo(item.postedDate)}</span>}
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center gap-3 pt-1">
                {item.applyUrl && (
                  <ApplyButton
                    href={item.applyUrl}
                    onApply={() => onApply(item.jobId, item.title)}
                  />
                )}
                <button
                  onClick={() => onFavorite(item.jobId, !favorited)}
                  aria-label={favorited ? 'Unfavorite' : 'Save to favorites'}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                    ${favorited
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20'
                      : 'text-slate-400 border-slate-700 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/10'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {favorited ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Score + Reasoning */}
            {item.score != null && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <ScoreBadge score={item.score} />
                {item.reasoning && (
                  <p className="text-sm text-slate-400 leading-relaxed">{item.reasoning}</p>
                )}
              </div>
            )}

            {/* Matched Skills */}
            {item.matchedSkills && item.matchedSkills.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">
                  Matched Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.matchedSkills.map(skill => (
                    <span key={skill}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {(item.score != null || (item.matchedSkills && item.matchedSkills.length > 0)) && item.description && (
              <hr className="border-slate-800" />
            )}

            {/* Description */}
            {item.description && (
              <div className="space-y-2">
                <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">
                  Job Description
                </p>
                {parseDescription(item.description)}
              </div>
            )}

            {!item.description && (
              <p className="text-sm text-slate-600 italic">No description available.</p>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
