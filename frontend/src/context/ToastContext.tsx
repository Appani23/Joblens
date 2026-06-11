import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type ToastType = 'success' | 'neutral'

interface ToastData {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let _nextId = 0

// ── Individual toast (manages its own enter/exit) ─────────────────────────────

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // rAF so the initial `opacity-0 translate-x-4` class is painted before we transition
    const frame = requestAnimationFrame(() => setVisible(true))
    const exitAt = setTimeout(() => setVisible(false), 2600)
    const removeAt = setTimeout(onRemove, 3000)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(exitAt)
      clearTimeout(removeAt)
    }
  }, [onRemove])

  function dismiss() {
    setVisible(false)
    setTimeout(onRemove, 300)
  }

  return (
    <div
      role="status"
      className={`flex items-center gap-3 bg-slate-900 border border-slate-800/80 rounded-xl
        px-4 py-3 shadow-2xl shadow-black/60 min-w-[240px] max-w-xs
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
    >
      {/* Icon */}
      {toast.type === 'success' ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-slate-700/60 border border-slate-700 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01" />
          </svg>
        </div>
      )}

      <p className="text-sm text-slate-200 leading-snug flex-1">{toast.message}</p>

      <button
        onClick={dismiss}
        className="shrink-0 text-slate-700 hover:text-slate-400 transition-colors ml-1"
        aria-label="Dismiss"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = String(++_nextId)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
