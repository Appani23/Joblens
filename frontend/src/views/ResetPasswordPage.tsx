import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPasswordApi, extractApiError } from '../api/authApi'
import { LogoWordmark } from '../components/Logo'

const inputClass =
  'w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 ' +
  'rounded-lg px-3.5 py-2.5 text-sm transition-colors ' +
  'focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  // Redirect to /login 2s after success
  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => navigate('/login', { replace: true }), 2000)
    return () => clearTimeout(id)
  }, [success, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Missing or invalid reset token. Please request a new reset link.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetPasswordApi(token, password)
      setSuccess(true)
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Indigo accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        <div className="p-6">

          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <a href="/">
              <LogoWordmark size="md" />
            </a>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">
                {success ? 'Password updated' : 'Set a new password'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {success
                  ? 'Redirecting you to sign in…'
                  : 'Choose a strong password for your account'}
              </p>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-400 text-center">
                Your password has been reset. Taking you to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

              {!token && (
                <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-amber-400">Invalid reset link. Please request a new one.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">New password</label>
                <input
                  ref={firstInputRef}
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                  required
                  disabled={!token}
                />
              </div>

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
                  disabled={!token}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-400 mt-1.5 ml-0.5">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !token}
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
                {submitting ? 'Saving…' : 'Set new password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-600 mt-5">
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Back to sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
