import { useEffect, useRef, useState } from 'react'
import {
  getMyResume, uploadResume, clearMyMatches, extractMatchApiError,
  type ResumeInfo,
} from '../api/matchApi'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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

function SkillChip({ label }: { label: string }) {
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full
      bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
      {label}
    </span>
  )
}

export default function ResumeView({ token }: { token: string }) {
  const [resume, setResume] = useState<ResumeInfo | null>(null)
  const [status, setStatus] = useState<'loading' | 'none' | 'exists'>('loading')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMyResume(token)
      .then(r => { setResume(r); setStatus('exists') })
      .catch(() => setStatus('none'))
  }, [token])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(true)
    setError(null)
    try {
      const r = await uploadResume(token, file)
      try { await clearMyMatches(token) } catch { /* ignore */ }
      setResume(r)
      setStatus('exists')
    } catch (err) {
      setError(extractMatchApiError(err))
    } finally {
      setUploading(false)
    }
  }

  function pickFile() { fileInputRef.current?.click() }

  const skills = resume?.parsedJson
    ? (resume.parsedJson['skills'] as string[] | undefined) ?? []
    : []

  const candidateTitle = resume?.parsedJson
    ? (resume.parsedJson['title'] as string | undefined) ?? null
    : null

  const yearsExp = resume?.parsedJson
    ? (resume.parsedJson['yearsExperience'] as number | undefined) ?? null
    : null

  return (
    <div className="max-w-2xl">
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

      <div className="mb-6">
        <h1 className="text-base font-bold text-white">Resume</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your resume is parsed with AI to extract skills and experience for scoring.
        </p>
      </div>

      {status === 'loading' && <Spinner />}

      {status === 'none' && (
        <div className="flex flex-col items-center py-20 gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-200 font-semibold mb-1">No resume uploaded yet</p>
            <p className="text-slate-500 text-sm">Upload a PDF to start getting job recommendations.</p>
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg max-w-xs">
              {error}
            </p>
          )}
          <button
            onClick={pickFile} disabled={uploading}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {uploading ? 'Uploading…' : 'Upload Resume (PDF)'}
          </button>
          <p className="text-slate-700 text-xs">PDF only · max 5 MB</p>
        </div>
      )}

      {status === 'exists' && resume && (
        <div className="flex flex-col gap-5">
          {/* File card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{resume.originalFilename}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {Math.round(resume.fileSizeBytes / 1024)} KB · uploaded {formatDate(resume.uploadedAt)}
              </p>
            </div>
            {resume.parsed
              ? <span className="shrink-0 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">Parsed</span>
              : <span className="shrink-0 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">Not parsed</span>
            }
            <button
              onClick={pickFile} disabled={uploading}
              className="shrink-0 text-xs font-medium text-slate-400 hover:text-white border border-slate-700
                hover:border-slate-500 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg
                transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Change'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Parsed profile */}
          {resume.parsed && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-300">Extracted Profile</h2>

              {(candidateTitle || yearsExp !== null) && (
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {candidateTitle && (
                    <span>
                      <span className="text-slate-600 mr-1.5">Role</span>
                      {candidateTitle}
                    </span>
                  )}
                  {yearsExp !== null && (
                    <span>
                      <span className="text-slate-600 mr-1.5">Experience</span>
                      {yearsExp} yr{yearsExp !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 mb-2.5 uppercase tracking-wide font-medium">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => <SkillChip key={skill} label={skill} />)}
                  </div>
                </div>
              )}

              {skills.length === 0 && !candidateTitle && (
                <p className="text-sm text-slate-600">No structured data extracted.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
