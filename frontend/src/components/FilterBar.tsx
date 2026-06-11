interface FilterBarProps {
  what: string
  where: string
  datePostedDays: number | undefined
  sort: 'recent' | 'relevance'
  onWhatChange: (v: string) => void
  onWhereChange: (v: string) => void
  onDatePostedDaysChange: (v: number | undefined) => void
  onSortChange: (v: 'recent' | 'relevance') => void
  onClear: () => void
}

const inputClass =
  'w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 ' +
  'rounded-lg px-3.5 py-2.5 text-sm transition-colors ' +
  'focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20'

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default function FilterBar({
  what, where, datePostedDays, sort,
  onWhatChange, onWhereChange, onDatePostedDaysChange, onSortChange,
  onClear,
}: FilterBarProps) {
  const isActive = what !== '' || where !== '' || datePostedDays !== undefined || sort !== 'recent'

  return (
    <div className="mb-6 bg-slate-900/50 border border-slate-800/70 rounded-2xl p-4">
      <div className="flex flex-wrap gap-3">

        {/* Keyword */}
        <div className="relative flex-1 min-w-[160px]">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Job title or keyword…"
            value={what}
            onChange={e => onWhatChange(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        {/* Location */}
        <div className="relative flex-1 min-w-[140px]">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Location…"
            value={where}
            onChange={e => onWhereChange(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        {/* Date Posted */}
        <SelectWrapper>
          <select
            value={datePostedDays ?? ''}
            onChange={e => onDatePostedDaysChange(e.target.value === '' ? undefined : Number(e.target.value))}
            className={`${inputClass} appearance-none pr-9 cursor-pointer w-40`}
          >
            <option value="">Any time</option>
            <option value="1">Last 24 hours</option>
            <option value="2">Last 2 days</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
          </select>
        </SelectWrapper>

        {/* Sort */}
        <SelectWrapper>
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value as 'recent' | 'relevance')}
            className={`${inputClass} appearance-none pr-9 cursor-pointer w-36`}
          >
            <option value="recent">Most recent</option>
            <option value="relevance">Relevance</option>
          </select>
        </SelectWrapper>

        {/* Clear */}
        <button
          onClick={onClear}
          disabled={!isActive}
          className={`shrink-0 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${isActive
              ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer'
              : 'text-slate-700 cursor-not-allowed'
            }`}
        >
          Clear
        </button>

      </div>
    </div>
  )
}
