import type { Job } from './job'
import type { MatchResult, JobStatusEntry } from '../api/matchApi'

export interface PanelItem {
  jobId: number
  title: string
  company: string | null
  location: string | null
  description: string | null
  applyUrl: string | null
  jobLevel: string | null
  workMode: string | null
  salaryMin: number | null
  salaryMax: number | null
  source: string | null
  postedDate: string | null
  score?: number | null
  reasoning?: string | null
  matchedSkills?: string[] | null
}

export function jobToPanel(j: Job): PanelItem {
  return {
    jobId: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    description: j.description,
    applyUrl: j.applyUrl,
    jobLevel: j.jobLevel,
    workMode: j.workMode,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    source: j.source,
    postedDate: j.postedDate,
  }
}

export function matchToPanel(m: MatchResult): PanelItem {
  return {
    jobId: m.jobId,
    title: m.title,
    company: m.company,
    location: m.location,
    description: m.description,
    applyUrl: m.applyUrl,
    jobLevel: m.jobLevel,
    workMode: m.workMode,
    salaryMin: m.salaryMin,
    salaryMax: m.salaryMax,
    source: null,
    postedDate: null,
    score: m.score,
    reasoning: m.reasoning,
    matchedSkills: m.matchedSkills,
  }
}

export function statusToPanel(e: JobStatusEntry): PanelItem {
  return {
    jobId: e.jobId,
    title: e.title,
    company: e.company,
    location: e.location,
    description: e.description,
    applyUrl: e.applyUrl,
    jobLevel: e.jobLevel,
    workMode: e.workMode,
    salaryMin: e.salaryMin,
    salaryMax: e.salaryMax,
    source: e.source,
    postedDate: null,
    score: e.score,
    reasoning: e.reasoning,
    matchedSkills: e.matchedSkills,
  }
}
