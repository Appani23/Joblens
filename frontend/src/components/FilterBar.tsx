interface FilterBarProps {
  what: string
  where: string
  datePostedDays: number | undefined
  sort: 'recent' | 'relevance'
  jobLevel: string
  workMode: string
  onWhatChange: (v: string) => void
  onWhereChange: (v: string) => void
  onDatePostedDaysChange: (v: number | undefined) => void
  onSortChange: (v: 'recent' | 'relevance') => void
  onJobLevelChange: (v: string) => void
  onWorkModeChange: (v: string) => void
  onClear: () => void
}

const inputBase =
  'bg-slate-950 border border-slate-800/80 text-slate-200 placeholder:text-slate-600 ' +
  'rounded-lg px-3 py-2 text-sm transition-colors ' +
  'focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20'

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function Sel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
        <ChevronDown />
      </span>
    </div>
  )
}

export default function FilterBar({
  what, where, datePostedDays, sort, jobLevel, workMode,
  onWhatChange, onWhereChange, onDatePostedDaysChange, onSortChange,
  onJobLevelChange, onWorkModeChange, onClear,
}: FilterBarProps) {
  const isActive =
    what !== '' || where !== '' || datePostedDays !== undefined ||
    sort !== 'recent' || jobLevel !== '' || workMode !== ''

  return (
    <div className="flex flex-wrap gap-2 py-3 px-4 border-b border-slate-800/60 bg-[#080b12]">

      {/* Keyword */}
      <div className="relative flex-1 min-w-[150px]">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Job title or keyword…"
          value={what}
          onChange={e => onWhatChange(e.target.value)}
          className={`${inputBase} pl-8 w-full`}
        />
      </div>

      {/* Location */}
      <div className="relative flex-1 min-w-[130px]">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Location…"
          value={where}
          onChange={e => onWhereChange(e.target.value)}
          className={`${inputBase} pl-8 w-full`}
        />
      </div>

      {/* Date Posted */}
      <Sel className="w-36">
        <select
          value={datePostedDays ?? ''}
          onChange={e => onDatePostedDaysChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className={`${inputBase} appearance-none pr-8 w-full cursor-pointer`}
        >
          <option value="">Any time</option>
          <option value="1">Last 24h</option>
          <option value="3">Last 3 days</option>
          <option value="7">Last 7 days</option>
        </select>
      </Sel>

      {/* Job Level */}
      <Sel className="w-32">
        <select
          value={jobLevel}
          onChange={e => onJobLevelChange(e.target.value)}
          className={`${inputBase} appearance-none pr-8 w-full cursor-pointer`}
        >
          <option value="">Any level</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
      </Sel>

      {/* Work Mode */}
      <Sel className="w-32">
        <select
          value={workMode}
          onChange={e => onWorkModeChange(e.target.value)}
          className={`${inputBase} appearance-none pr-8 w-full cursor-pointer`}
        >
          <option value="">Any mode</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Onsite">Onsite</option>
        </select>
      </Sel>

      {/* Sort */}
      <Sel className="w-36">
        <select
          value={sort}
          onChange={e => onSortChange(e.target.value as 'recent' | 'relevance')}
          className={`${inputBase} appearance-none pr-8 w-full cursor-pointer`}
        >
          <option value="recent">Most recent</option>
          <option value="relevance">Relevance</option>
        </select>
      </Sel>

      {/* Clear */}
      <button
        onClick={onClear}
        disabled={!isActive}
        className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive
            ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer'
            : 'text-slate-700 cursor-not-allowed'
          }`}
      >
        Clear
      </button>
    </div>
  )
}
