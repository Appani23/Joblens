export interface Job {
  id: number
  externalId: string
  title: string
  company: string | null
  location: string | null
  description: string | null
  source: string
  applyUrl: string | null
  salaryMin: number | null
  salaryMax: number | null
  postedDate: string | null
  fetchedAt: string
  lastSeenAt: string | null
  jobLevel: string | null
  workMode: string | null
  requiredYears: number | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}
