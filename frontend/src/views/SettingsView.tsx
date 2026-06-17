import { useState } from 'react'
import type { AuthUser } from '../context/AuthContext'
import { changePasswordApi, extractApiError } from '../api/authApi'
import { useToast } from '../context/ToastContext'

type Section = 'security' | 'subscription'

interface Props {
  token: string
  user: AuthUser
  onLogout: () => void
}

// ── Change Password inline form ───────────────────────────────────────────────

function ChangePasswordForm({ token }: { token: string }) {
  const { addToast } = useToast()
  const [open, setOpen] = useState(false)
  const [current, setCurrent]   = useState('')
  const [next, setNext]         = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  function reset() {
    setCurrent(''); setNext(''); setConfirm(''); setError(null)
  }

  function close() { reset(); setOpen(false) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return }
    if (next !== confirm) { setError('New passwords do not match.'); return }
    setLoading(true)
    try {
      await changePasswordApi(token, current, next)
      addToast('Password updated successfully.', 'neutral')
      close()
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        Change password →
      </button>
    )
  }

  const inputCls =
    'w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 ' +
    'rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors'

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 max-w-sm">
      <input
        type="password"
        placeholder="Current password"
        value={current}
        onChange={e => setCurrent(e.target.value)}
        autoComplete="current-password"
        required
        className={inputCls}
      />
      <input
        type="password"
        placeholder="New password (min 8 chars)"
        value={next}
        onChange={e => setNext(e.target.value)}
        autoComplete="new-password"
        required
        className={inputCls}
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
        className={inputCls}
      />
      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
            text-white text-sm font-semibold transition-colors"
        >
          {loading ? 'Saving…' : 'Update password'}
        </button>
        <button
          type="button"
          onClick={close}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400
            hover:text-slate-200 hover:border-slate-600 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Section shells ────────────────────────────────────────────────────────────

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      {children}
    </div>
  )
}

function SecuritySection({ token, user }: { token: string; user: AuthUser }) {
  return (
    <div className="space-y-4">
      <SettingCard title="Account">
        <Row label="Email">
          <p className="text-sm text-slate-300 font-medium">{user.email}</p>
        </Row>
        {user.name && (
          <Row label="Name">
            <p className="text-sm text-slate-300 font-medium">{user.name}</p>
          </Row>
        )}
      </SettingCard>
      <SettingCard title="Password">
        <Row label="Change password">
          <ChangePasswordForm token={token} />
        </Row>
      </SettingCard>
    </div>
  )
}

function SubscriptionSection({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const features = [
    'Unlimited AI job matches',
    'Resume parsing via Claude',
    'Daily job fetch & indexing',
    'Favorites & applied tracking',
    'Job detail panel',
  ]
  return (
    <div className="space-y-4">
      <SettingCard title="Current Plan">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full
            bg-slate-800 text-slate-300 border border-slate-700">
            Free
          </span>
          <span className="text-sm text-slate-400">Everything you need to get started</span>
        </div>
        <ul className="space-y-2 pt-1">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </SettingCard>
      <SettingCard title="Upgrade to Pro">
        <p className="text-sm text-slate-400 leading-relaxed">
          More matches per day, priority scoring, and advanced filters.
        </p>
        <button
          onClick={onUpgradeClick}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Upgrade to Pro
        </button>
      </SettingCard>
    </div>
  )
}

// ── Main Settings view ────────────────────────────────────────────────────────

export default function SettingsView({ token, user, onLogout }: Props) {
  const { addToast } = useToast()
  const [section, setSection] = useState<Section>('security')

  function handleUpgrade() {
    addToast('Pro plan coming soon!', 'neutral')
  }

  const navItems: { key: Section; label: string }[] = [
    { key: 'security',     label: 'Login & Security' },
    { key: 'subscription', label: 'Subscription' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Left sub-nav */}
        <nav className="w-44 shrink-0 flex flex-col gap-1">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={[
                'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                section === key
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
              ].join(' ')}
            >
              {label}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium
                text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent
                hover:border-rose-500/20 transition-all"
            >
              Log out
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === 'security' && (
            <SecuritySection token={token} user={user} />
          )}
          {section === 'subscription' && (
            <SubscriptionSection onUpgradeClick={handleUpgrade} />
          )}
        </div>
      </div>
    </div>
  )
}
