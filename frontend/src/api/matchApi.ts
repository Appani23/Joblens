import axios, { AxiosError } from 'axios'

const resumeClient = axios.create({ baseURL: 'http://localhost:8082' })
const matchClient = axios.create({ baseURL: 'http://localhost:8084' })

function auth(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export interface ResumeInfo {
  id: number
  originalFilename: string
  fileSizeBytes: number
  uploadedAt: string
  parsed: boolean
  parsedJson: Record<string, unknown> | null
}

export interface MatchSummary {
  totalJobs: number
  scored: number
  matchesAbove70: number
}

export interface MatchResult {
  jobId: number
  score: number
  reasoning: string
  title: string
  company: string | null
  location: string | null
  applyUrl: string | null
  matchedAt: string
}

export async function getMyResume(token: string): Promise<ResumeInfo> {
  const res = await resumeClient.get<ResumeInfo>('/api/resumes/me', { headers: auth(token) })
  return res.data
}

export async function uploadResume(token: string, file: File): Promise<ResumeInfo> {
  const form = new FormData()
  form.append('file', file)
  // Do NOT set Content-Type — axios/browser sets it with the multipart boundary
  const res = await resumeClient.post<ResumeInfo>('/api/resumes/upload', form, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function runMatching(token: string): Promise<MatchSummary> {
  // Matching can take 1–5 minutes; set a generous timeout
  const res = await matchClient.post<MatchSummary>('/api/matches/run', null, {
    headers: auth(token),
    timeout: 600_000,
  })
  return res.data
}

export async function getMyMatches(token: string, minScore = 0): Promise<MatchResult[]> {
  const res = await matchClient.get<MatchResult[]>('/api/matches/me', {
    headers: auth(token),
    params: { minScore },
  })
  return res.data
}

export async function clearMyMatches(token: string): Promise<void> {
  await matchClient.delete('/api/matches/me', { headers: auth(token) })
}

export function extractMatchApiError(err: unknown): string {
  if (err instanceof AxiosError) {
    const msg = err.response?.data?.error ?? err.response?.data?.message
    if (typeof msg === 'string') return msg
    if (err.response?.status === 401) return 'Session expired — please log in again'
    if (err.response?.status === 404) return 'Not found'
  }
  return err instanceof Error ? err.message : 'Unexpected error'
}
