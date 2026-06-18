import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractApiError, forgotPasswordApi } from '../api/authApi'
import { LogoWordmark } from './Logo'

interface AuthModalProps {
  isOpen: boolean
  initialMode: 'login' | 'signup'
  onClose: () => void
}

const inputClass =
  'w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 ' +
  'rounded-lg px-3.5 py-2.5 text-sm transition-colors ' +
  'focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20'

type ModalMode = 'login' | 'signup' | 'forgot'

export default function AuthModal({ isOpen, initialMode, onClose }: AuthModalProps) {
  const { login, signup } = useAuth()
  const { addToast } = useToast()

  const [mode, setMode] = useState<ModalMode>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const firstInputRef = useRef<HTMLInputElement>(null)

  // Reset all fields when the modal is opened fresh
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError(null)
      setForgotSent(false)
    }
  }, [isOpen, initialMode])

  // Auto-focus the first field on open
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => firstInputRef.current?.focus(), 60)
      return () => clearTimeout(id)
    }
  }, [isOpen, mode])

  // Escape to close + body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  function switchMode(next: ModalMode) {
    setMode(next)
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setForgotSent(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimEmail = email.trim()

    if (mode === 'forgot') {
      if (!trimEmail) { setError('Email is required.'); return }
      setSubmitting(true)
      try {
        await forgotPasswordApi(trimEmail)
        setForgotSent(true)
      } catch {
        // Always show success to avoid revealing account existence
        setForgotSent(true)
      } finally {
        setSubmitting(false)
      }
      return
    }

    // ── Shared validation ────────────────────────────────────────────────────
    if (!trimEmail || !password) {
      setError('Email and password are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setError('Enter a valid email address.')
      return
    }

    // ── Signup-specific validation ───────────────────────────────────────────
    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        const user = await login(trimEmail, password)
        addToast(`Welcome back, ${user.name ?? trimEmail.split('@')[0]}!`)
        onClose()
      } else {
        await signup(trimEmail, password, name.trim() || undefined)
        // Success: toast, then switch to login with email pre-filled
        addToast('Account created — please log in.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setError(null)
        // Email stays — user doesn't have to retype it
      }
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const title = mode === 'login' ? 'Welcome back'
              : mode === 'signup' ? 'Create account'
              : 'Reset password'

  const subtitle = mode === 'login' ? 'Sign in to your account'
                 : mode === 'signup' ? 'Join JobLens — find your next role'
                 : 'Enter your email and we\'ll send a reset link'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Indigo accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="relative mb-6">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Centered logo + title */}
            <div className="flex flex-col items-center gap-4 pr-6">
              <LogoWordmark size="md" />
              <div className="text-center">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* ── Forgot password: success state ─────────────────────────────── */}
          {mode === 'forgot' && forgotSent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-white font-semibold">Check your inbox</p>
                <p className="text-sm text-slate-500">
                  If <span className="text-slate-300">{email}</span> has an account, a reset link has been sent. It expires in 1 hour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

              {/* Name — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Name <span className="text-slate-700 font-normal">(optional)</span>
                  </label>
                  <input
                    ref={mode === 'signup' ? firstInputRef : undefined}
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputClass}
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  ref={mode !== 'signup' ? firstInputRef : undefined}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password — login/signup only */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-500">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-slate-600 hover:text-indigo-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputClass}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                </div>
              )}

              {/* Confirm password — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`${inputClass}${
                      confirmPassword && confirmPassword !== password
                        ? ' border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20'
                        : confirmPassword && confirmPassword === password
                          ? ' border-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/15'
                          : ''
                    }`}
                    autoComplete="new-password"
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-400 mt-1.5 ml-0.5">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500
                  disabled:bg-indigo-600/40 disabled:cursor-not-allowed
                  text-white text-sm font-semibold transition-colors
                  flex items-center justify-center gap-2"
              >
                {submitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {submitting
                  ? (mode === 'login' ? 'Signing in…' : mode === 'signup' ? 'Creating account…' : 'Sending…')
                  : (mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link')}
              </button>
            </form>
          )}

          {/* Mode toggle */}
          {mode !== 'forgot' && (
            <p className="text-center text-sm text-slate-600 mt-5">
              {mode === 'login' ? (
                <>No account?{' '}
                  <button type="button" onClick={() => switchMode('signup')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Sign up free
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Sign in
                  </button>
                </>
              )}
            </p>
          )}

          {mode === 'forgot' && !forgotSent && (
            <p className="text-center text-sm text-slate-600 mt-5">
              <button type="button" onClick={() => switchMode('login')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
