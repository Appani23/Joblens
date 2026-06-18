import { useEffect, useState } from 'react'
import type { DrawerFilters } from '../types/filters'
import { DEFAULT_DRAWER } from '../types/filters'

export type DrawerSection = 'date' | 'level' | 'mode' | 'score'

interface Props {
  open: boolean
  onClose: () => void
  initial: DrawerFilters
  onApply: (f: DrawerFilters) => void
  showMinScore: boolean
  focusSection?: DrawerSection
}

const DATE_OPTIONS = [
  { label: 'Any time',      value: undefined },
  { label: 'Past 24 hours', value: 1         },
  { label: 'Past 3 days',   value: 3         },
  { label: 'Past 7 days',   value: 7         },
  { label: 'Past 30 days',  value: 30        },
] as const

// ── Sub-components ─────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function Section({
  title, expanded, onToggle, children,
}: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-800/60 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-4 text-sm font-semibold
          text-slate-200 hover:text-white transition-colors text-left"
      >
        {title}
        <Chevron open={expanded} />
      </button>
      {expanded && (
        <div className="px-6 pb-5 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

// These use onClick on the wrapping <label> — the custom-styled div/checkbox
// is purely visual; the label's click fires onChange.
function RadioRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer group"
      onClick={onChange}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
        ${checked ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700 group-hover:border-slate-500'}`}
      >
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
        {label}
      </span>
    </label>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0
        ${checked ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700 group-hover:border-slate-500'}`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
        {label}
      </span>
    </label>
  )
}

// ── FilterDrawer ──────────────────────────────────────────────────────────────

export default function FilterDrawer({ open, onClose, initial, onApply, showMinScore, focusSection }: Props) {
  const [f, setF] = useState<DrawerFilters>({ ...initial })

  // Sync pending state when drawer opens; expand focusSection if given
  useEffect(() => {
    if (open) {
      setF({ ...initial })
      if (focusSection) {
        setSections(prev => ({ ...prev, [focusSection]: true }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Escape key: close without applying
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const [sections, setSections] = useState<Record<DrawerSection, boolean>>({
    date: true, level: true, mode: true, score: true,
  })
  const toggle = (k: DrawerSection) =>
    setSections(prev => ({ ...prev, [k]: !prev[k] }))

  function handleApply() {
    onApply(f)
    onClose()
  }

  function handleClearAll() {
    onApply({ ...DEFAULT_DRAWER })
    onClose()
  }

  function toggleLevel(level: string, checked: boolean) {
    setF(prev => ({
      ...prev,
      jobLevels: checked
        ? [...prev.jobLevels, level]
        : prev.jobLevels.filter(l => l !== level),
    }))
  }

  function toggleMode(mode: string, checked: boolean) {
    setF(prev => ({
      ...prev,
      workModes: checked
        ? [...prev.workModes, mode]
        : prev.workModes.filter(m => m !== mode),
    }))
  }

  return (
    <>
      {/* Backdrop — close without applying */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-200
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:max-w-[420px]
          bg-[#0d1117] border-l border-slate-800 z-50 flex flex-col shadow-2xl
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 shrink-0">
          <h2 className="text-base font-bold text-white">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable filter sections */}
        <div className="flex-1 overflow-y-auto">

          {/* Date Posted */}
          <Section title="Date Posted" expanded={sections.date} onToggle={() => toggle('date')}>
            {DATE_OPTIONS.map(opt => (
              <RadioRow
                key={String(opt.value)}
                label={opt.label}
                checked={f.datePostedDays === opt.value}
                onChange={() => setF(prev => ({ ...prev, datePostedDays: opt.value }))}
              />
            ))}
          </Section>

          {/* Experience Level */}
          <Section title="Experience Level" expanded={sections.level} onToggle={() => toggle('level')}>
            {['Junior', 'Mid', 'Senior'].map(level => (
              <CheckRow
                key={level}
                label={level}
                checked={f.jobLevels.includes(level)}
                onChange={checked => toggleLevel(level, checked)}
              />
            ))}
          </Section>

          {/* Work Mode */}
          <Section title="Work Mode" expanded={sections.mode} onToggle={() => toggle('mode')}>
            {['Remote', 'Hybrid', 'Onsite'].map(mode => (
              <CheckRow
                key={mode}
                label={mode}
                checked={f.workModes.includes(mode)}
                onChange={checked => toggleMode(mode, checked)}
              />
            ))}
          </Section>

          {/* Minimum Match Score — Recommended only */}
          {showMinScore && (
            <Section title="Minimum Match Score" expanded={sections.score} onToggle={() => toggle('score')}>
              <div className="space-y-3 pt-1">
                <input
                  type="range" min={0} max={100} step={5}
                  value={f.minScore}
                  onChange={e => setF(prev => ({ ...prev, minScore: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500
                    [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">0%</span>
                  <span className="text-sm font-semibold text-indigo-400">{f.minScore}%+ match</span>
                  <span className="text-xs text-slate-600">100%</span>
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-800/60 flex gap-3">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300
              hover:text-white hover:border-slate-500 font-medium text-sm transition-colors"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
              text-white font-semibold text-sm transition-colors"
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  )
}
