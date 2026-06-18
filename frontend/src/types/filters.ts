export interface DrawerFilters {
  datePostedDays: number | undefined
  jobLevels: string[]
  workModes: string[]
  minScore: number
}

export const DEFAULT_DRAWER: DrawerFilters = {
  datePostedDays: undefined,
  jobLevels: [],
  workModes: [],
  minScore: 70,
}

export interface FilterState extends DrawerFilters {
  rawWhat: string
  rawWhere: string
  page: number
  sort: 'recent' | 'relevance' | 'salary'
}

export const DEFAULT_FILTER: FilterState = {
  ...DEFAULT_DRAWER,
  rawWhat: '',
  rawWhere: '',
  page: 0,
  sort: 'recent',
}
