import { useState } from 'react'
import type { DrawerFilters } from '../types/filters'
import { DEFAULT_DRAWER } from '../types/filters'
import FilterDrawer, { type DrawerSection } from './FilterDrawer'

interface Props {
  rawWhat: string
  rawWhere: string
  onWhatChange: (v: string) => void
  onWhereChange: (v: string) => void
  sort: 'recent' | 'relevance' | 'salary'
  onSortChange: (v: 'recent' | 'relevance' | 'salary') => void
  applied: DrawerFilters
  onApplyDrawer: (f: DrawerFilters) => void
  onClearAll: () => void
  showMinScore: boolean
}

const DATE_LABELS: Record<number, string> = {
  1: 'Past 24 hours', 3: 'Past 3 days', 7: 'Past 7 days', 30: 'Past 30 days',
}

export default function SearchBar({
  rawWhat, rawWhere, onWhatChange, onWhereChange,
  sort, onSortChange,
  applied, onApplyDrawer, onClearAll, showMinScore,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [focusSection, setFocusSection] = useState<DrawerSection | undefined>()

  function openDrawerTo(section: DrawerSection) {
    setFocusSection(section)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setFocusSection(undefined)
  }

  // Build active chip list (date, levels, modes, minScore — NOT sort)
  type Chip = { label: string; section: DrawerSection; onRemove: () => void }
  const chips: Chip[] = []

  if (applied.datePostedDays !== undefined) {
    chips.push({
      label: DATE_LABELS[applied.datePostedDays] ?? `Past ${applied.datePostedDays}d`,
      section: 'date',
      onRemove: () => onApplyDrawer({ ...applied, datePostedDays: undefined }),
    })
  }
  applied.jobLevels.forEach(level => chips.push({
    label: level,
    section: 'level',
    onRemove: () => onApplyDrawer({ ...applied, jobLevels: applied.jobLevels.filter(l => l !== level) }),
  }))
  applied.workModes.forEach(mode => chips.push({
    label: mode,
    section: 'mode',
    onRemove: () => onApplyDrawer({ ...applied, workModes: applied.workModes.filter(m => m !== mode) }),
  }))
  if (showMinScore && applied.minScore !== DEFAULT_DRAWER.minScore) {
    chips.push({
      label: `Match ≥ ${applied.minScore}%`,
      section: 'score',
      onRemove: () => onApplyDrawer({ ...applied, minScore: DEFAULT_DRAWER.minScore }),
    })
  }

  const hasAny =
    chips.length > 0 || rawWhat !== '' || rawWhere !== '' || sort !== 'recent'

  return (
    <div className="mb-6 space-y-3">

      {/* ── Unified search pill ── */}
      <div className="max-w-[880px] mx-auto">
        <div className="flex items-stretch rounded-2xl border border-slate-700/80 bg-slate-900/90
          overflow-hidden shadow-lg hover:border-slate-600 focus-within:border-indigo-500/50
          focus-within:ring-1 focus-within:ring-indigo-500/20 transition-colors">

          {/* Keyword input */}
          <div className="relative flex-[3] min-w-0">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Job title, skill, or company"
              value={rawWhat}
              onChange={e => onWhatChange(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-transparent text-slate-200 text-sm
                placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Divider */}
          <div className="w-px bg-slate-800 self-stretch my-2.5 shrink-0" />

          {/* Location input */}
          <div className="relative flex-[2] min-w-0">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Location"
              value={rawWhere}
              onChange={e => onWhereChange(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-transparent text-slate-200 text-sm
                placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Search button */}
          <button
            type="button"
            className="shrink-0 px-6 h-12 bg-indigo-600 hover:bg-indigo-500 text-white
              font-semibold text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Controls row: All filters + Sort + chips ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* All filters button */}
        <button
          type="button"
          onClick={() => { setFocusSection(undefined); setDrawerOpen(true) }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700
            text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/60
            text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          All filters
          {chips.length > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full
              bg-indigo-500/30 text-indigo-300 text-[0.6rem] font-bold leading-none">
              {chips.length}
            </span>
          )}
        </button>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value as 'recent' | 'relevance' | 'salary')}
            className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-slate-700
              bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white
              text-xs font-medium transition-colors focus:outline-none focus:border-indigo-500/50
              cursor-pointer"
          >
            <option value="recent">Most recent</option>
            <option value="relevance">Most relevant</option>
            <option value="salary">Highest salary</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {/* Active chips — clicking label opens drawer to that section */}
        {chips.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full border border-indigo-500/30
              bg-indigo-500/10 text-indigo-300 text-xs font-medium overflow-hidden"
          >
            <button
              type="button"
              onClick={() => openDrawerTo(chip.section)}
              className="pl-2.5 pr-1 py-1 hover:bg-indigo-500/20 transition-colors"
            >
              {chip.label}
            </button>
            <button
              type="button"
              onClick={chip.onRemove}
              aria-label={`Remove ${chip.label} filter`}
              className="pr-2 pl-0.5 py-1 flex items-center text-indigo-400 hover:text-white
                hover:bg-indigo-500/30 transition-colors"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Clear all */}
        {hasAny && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-0.5"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        initial={applied}
        onApply={f => { onApplyDrawer(f); closeDrawer() }}
        showMinScore={showMinScore}
        focusSection={focusSection}
      />
    </div>
  )
}
