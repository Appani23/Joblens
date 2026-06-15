import axios from 'axios'
import type { Job, PageResponse } from '../types/job'

const client = axios.create({ baseURL: 'http://localhost:8083' })

export interface JobSearchParams {
  what?: string
  where?: string
  company?: string
  datePostedDays?: number
  jobLevel?: string
  workMode?: string
  sort?: 'recent' | 'relevance'
  page?: number
  size?: number
}

export async function fetchJobs(params: JobSearchParams = {}): Promise<PageResponse<Job>> {
  const { data } = await client.get<PageResponse<Job>>('/api/jobs', { params })
  return data
}
