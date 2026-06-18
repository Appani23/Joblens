import { useId } from 'react'

const SIZES = { sm: 28, md: 36, lg: 52 } as const
type Size = keyof typeof SIZES

// ── Mark: magnifying-glass lens ──────────────────────────────────────────────
// Gradient lens ring with an inner highlight and a bold diagonal handle.
// All artwork is on a 32×32 canvas scaled to the requested pixel size.

export function Logo({ size = 'md' }: { size?: Size }) {
  const uid  = useId().replace(/[^a-z0-9]/gi, '')
  const gId  = `jl-g-${uid}`
  const hlId = `jl-h-${uid}`
  const px   = SIZES[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Indigo-400 → Violet-600 diagonal */}
        <linearGradient id={gId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Top-left glass-surface highlight */}
        <radialGradient id={hlId} cx="32%" cy="28%" r="55%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.28" />
          <stop offset="100%" stopColor="white" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Soft outer glow */}
      <circle cx="13" cy="13" r="12" fill={`url(#${gId})`} opacity="0.18" />

      {/* Lens glass fill — very subtle so the ring reads as the main shape */}
      <circle cx="13" cy="13" r="9.5" fill={`url(#${gId})`} fillOpacity="0.14" />

      {/* Main lens ring */}
      <circle cx="13" cy="13" r="9.5" stroke={`url(#${gId})`} strokeWidth="2.4" />

      {/* Inner glass-surface highlight */}
      <circle cx="13" cy="13" r="9.5" fill={`url(#${hlId})`} />

      {/* Tiny specular dot — top-left of lens */}
      <circle cx="9.5" cy="9.5" r="1.8" fill="white" fillOpacity="0.20" />

      {/* Handle — thick rounded stroke, bottom-right diagonal */}
      <line
        x1="20.2" y1="20.2"
        x2="28.4" y2="28.4"
        stroke={`url(#${gId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Wordmark ──────────────────────────────────────────────────────────────────
// "Job" normal-weight slate-200 + "Lens" bold gradient, tight tracking.

export function LogoWordmark({ size = 'md' }: { size?: Size }) {
  const gap  = { sm: 'gap-2.5',  md: 'gap-3',     lg: 'gap-3.5' } as const
  const text = { sm: 'text-xl',  md: 'text-2xl',  lg: 'text-4xl' } as const

  return (
    <div className={`flex items-center ${gap[size]} select-none`}>
      <Logo size={size} />
      <span className={`${text[size]} leading-none tracking-[-0.03em]`}>
        <span className="font-normal text-slate-200">Job</span>
        <span className="font-bold bg-gradient-to-br from-indigo-400 to-violet-500 bg-clip-text text-transparent">
          Lens
        </span>
      </span>
    </div>
  )
}
