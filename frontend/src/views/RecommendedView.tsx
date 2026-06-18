import { useEffect, useRef, useState } from 'react'
import {
  getMyResume, uploadResume, runMatching, getMyMatches, clearMyMatches,
  extractMatchApiError,
  type ResumeInfo, type MatchResult, type MatchSummary,
} from '../api/matchApi'
import { matchToPanel, type PanelItem } from '../types/panel'
import MatchCard from '../components/MatchCard'

type ResumeStatus = 'checking' | 'none' | 'exists'
type MatchStatus = 'idle' | 'loading' | 'running' | 'done' | 'error'

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
      <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  )
}

function UploadPrompt({ uploading, error, onPickFile }: {
  uploading: boolean; error: string | null; onPickFile: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h2 className="text-slate-100 font-bold text-lg mb-2">Upload your resume</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          JobLens will parse your resume with AI and score every job against your skills.
        </p>
      </div>
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg max-w-xs">
          {error}
        </p>
      )}
      <button
        onClick={onPickFile} disabled={uploading}
        className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        {uploading
          ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading…</>
          : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Upload Resume (PDF)</>
        }
      </button>
      <p className="text-slate-700 text-xs">PDF only · max 5 MB</p>
    </div>
  )
}

function ResumeBanner({ resume, uploading, onPickFile }: {
  resume: ResumeInfo; uploading: boolean; onPickFile: () => void
}) {
  const sizeKb = Math.round(resume.fileSizeBytes / 1024)
  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-slate-900/60 border border-slate-800/60 rounded-xl">
      <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm text-slate-400 flex-1 min-w-0 truncate">{resume.originalFilename}</span>
      <span className="text-xs text-slate-600 shrink-0">{sizeKb} KB</span>
      {resume.parsed
        ? <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">parsed</span>
        : <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">not parsed</span>
      }
      <button
        onClick={onPickFile} disabled={uploading}
        className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-50 shrink-0 transition-colors"
      >
        {uploading ? 'Uploading…' : 'Change'}
      </button>
    </div>
  )
}

function FindMatchesPrompt({ onRun }: { onRun: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h2 className="text-slate-100 font-bold text-lg mb-2">Find your best matches</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Claude AI will score every job against your resume — skills, title fit, and experience level.
        </p>
      </div>
      <button
        onClick={onRun}
        className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Find my matches
      </button>
      <p className="text-slate-700 text-xs">Takes ~1 minute · scored by Claude AI</p>
    </div>
  )
}

function RunningState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
      <svg className="w-10 h-10 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <div>
        <p className="text-slate-200 font-semibold mb-1.5">Scoring jobs against your resume…</p>
        <p className="text-slate-500 text-sm">This usually takes about a minute. Hang tight.</p>
      </div>
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-slate-300 font-semibold mb-1">Matching failed</p>
        <p className="text-slate-600 text-sm max-w-xs">{message}</p>
      </div>
      <button onClick={onRetry}
        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-colors">
        Try again
      </button>
    </div>
  )
}

function EmptyMatches({ minScore }: { minScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p className="text-slate-300 font-semibold mb-1">No matches above {minScore}%</p>
    </div>
  )
}

// ── RecommendedView ───────────────────────────────────────────────────────────

interface Props {
  token: string
  rawWhat: string
  rawWhere: string
  jobLevels: string[]
  workModes: string[]
  sort: 'recent' | 'relevance' | 'salary'
  minScore: number
  jobStatus: Record<number, { favorited: boolean; applied: boolean }>
  onFavorite: (jobId: number, favorited: boolean) => void
  onApply: (jobId: number, title: string) => void
  onCardClick: (item: PanelItem) => void
}

export default function RecommendedView({
  token, rawWhat, rawWhere, jobLevels, workModes, sort, minScore,
  jobStatus, onFavorite, onApply, onCardClick,
}: Props) {
  const [resumeStatus, setResumeStatus] = useState<ResumeStatus>('checking')
  const [resume, setResume] = useState<ResumeInfo | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle')
  const [allMatches, setAllMatches] = useState<MatchResult[]>([])
  const [runSummary, setRunSummary] = useState<MatchSummary | null>(null)
  const [matchError, setMatchError] = useState<string | null>(null)

  const sortedMatches = [...allMatches].sort((a, b) => {
    if (sort === 'relevance') return b.score - a.score
    if (sort === 'salary') return (b.salaryMax ?? -Infinity) - (a.salaryMax ?? -Infinity)
    return 0
  })

  const displayedMatches = sortedMatches.filter(m => {
    if (m.score < minScore) return false
    if (rawWhat && !m.title.toLowerCase().includes(rawWhat.toLowerCase())) return false
    if (rawWhere && !m.location?.toLowerCase().includes(rawWhere.toLowerCase())) return false
    if (jobLevels.length > 0 && !jobLevels.includes(m.jobLevel ?? '')) return false
    if (workModes.length > 0 && !workModes.includes(m.workMode ?? '')) return false
    return true
  })

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const r = await getMyResume(token)
        if (cancelled) return
        setResume(r)
        setResumeStatus('exists')
        setMatchStatus('loading')
        const ms = await getMyMatches(token, 0)
        if (cancelled) return
        setAllMatches(ms)
        setMatchStatus(ms.length > 0 ? 'done' : 'idle')
      } catch {
        if (!cancelled) setResumeStatus('none')
      }
    }
    init()
    return () => { cancelled = true }
  }, [token])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(true)
    setUploadError(null)
    try {
      const r = await uploadResume(token, file)
      try { await clearMyMatches(token) } catch { /* stale data stays, harmless */ }
      setResume(r)
      setResumeStatus('exists')
      setAllMatches([])
      setRunSummary(null)
      setMatchStatus('idle')
    } catch (err) {
      setUploadError(extractMatchApiError(err))
    } finally {
      setUploading(false)
    }
  }

  function pickFile() { fileInputRef.current?.click() }

  async function handleRun() {
    setMatchStatus('running')
    setMatchError(null)
    try {
      const summary = await runMatching(token)
      setRunSummary(summary)
      const ms = await getMyMatches(token, 0)
      setAllMatches(ms)
      setMatchStatus('done')
    } catch (err) {
      setMatchError(extractMatchApiError(err))
      setMatchStatus('error')
    }
  }

  const fileInput = (
    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
  )

  if (resumeStatus === 'checking') return <Spinner label="Checking your profile…" />

  if (resumeStatus === 'none') {
    return (
      <>
        {fileInput}
        <UploadPrompt uploading={uploading} error={uploadError} onPickFile={pickFile} />
      </>
    )
  }

  return (
    <div>
      {fileInput}
      <ResumeBanner resume={resume!} uploading={uploading} onPickFile={pickFile} />

      {matchStatus === 'loading' && <Spinner label="Loading your matches…" />}
      {matchStatus === 'idle'    && <FindMatchesPrompt onRun={handleRun} />}
      {matchStatus === 'running' && <RunningState />}
      {matchStatus === 'error'   && <ErrorCard message={matchError ?? 'Matching failed'} onRetry={handleRun} />}

      {matchStatus === 'done' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-bold text-white tracking-tight">Recommended</h2>
              <span className="text-sm text-slate-500">
                {displayedMatches.length} shown
                {runSummary && <> · {runSummary.scored.toLocaleString()} jobs scored</>}
              </span>
            </div>
            <button
              onClick={handleRun}
              className="text-xs font-medium text-slate-500 hover:text-slate-300 border border-slate-800
                hover:border-slate-700 bg-slate-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              Re-score
            </button>
          </div>

          {displayedMatches.length === 0
            ? <EmptyMatches minScore={minScore} />
            : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayedMatches.map(m => (
                  <MatchCard
                    key={m.jobId}
                    match={m}
                    favorited={jobStatus[m.jobId]?.favorited ?? false}
                    applied={jobStatus[m.jobId]?.applied ?? false}
                    onFavorite={onFavorite}
                    onApply={onApply}
                    onCardClick={() => onCardClick(matchToPanel(m))}
                  />
                ))}
              </div>
            )
          }
        </>
      )}
    </div>
  )
}
