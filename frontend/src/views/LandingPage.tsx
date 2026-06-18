import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Upload, Zap, CheckCircle2, Sparkles, Globe, SlidersHorizontal,
  BookmarkCheck, FileSearch, UserCheck, ArrowRight,
} from 'lucide-react'
import { LogoWordmark } from '../components/Logo'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function useFade(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FadeIn({
  children, className = '', delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useFade()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── Faux product preview card ─────────────────────────────────────────────────

function ProductPreview() {
  return (
    <div className="relative w-full max-w-[360px] mx-auto lg:mx-0"
      style={{ animation: 'float 5s ease-in-out infinite' }}>

      {/* Glow halo behind the card */}
      <div className="absolute inset-0 rounded-2xl bg-indigo-600/20 blur-2xl scale-110 pointer-events-none" />

      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-2xl">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">TechCorp · San Francisco, CA</p>
            <h3 className="text-slate-100 font-bold text-base leading-snug">
              Senior Java Developer
            </h3>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
            92%
          </span>
        </div>

        {/* Reasoning snippet */}
        <p className="text-xs text-slate-500 leading-relaxed">
          Strong match — 8 of 9 required skills found on your resume, including Spring Boot, Kafka, and AWS.
        </p>

        {/* Pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            Senior
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400 border border-slate-700/60">
            Onsite
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Adzuna
          </span>
        </div>

        {/* Matched skills */}
        <div className="space-y-1.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Matched Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {['Spring Boot', 'Kafka', 'AWS', 'Java 17', 'PostgreSQL'].map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-600">$140k – $180k · 2d ago</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white">
            Apply <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Landing sections ──────────────────────────────────────────────────────────

const CONTAINER = 'max-w-7xl mx-auto px-6 lg:px-8'

function TopNav({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300
        ${scrolled
          ? 'bg-slate-950/95 backdrop-blur border-b border-slate-800/60 shadow-lg'
          : 'bg-transparent'
        }`}
    >
      <div className={`${CONTAINER} flex items-center justify-between h-16`}>
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <LogoWordmark size="lg" />
        </Link>

        {/* Center nav — desktop only */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Features',     id: 'features'      },
            { label: 'How it works', id: 'how-it-works'  },
            { label: 'Pricing',      id: 'cta'           },
            { label: 'About',        id: 'footer'        },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm font-medium text-slate-300 hover:text-white border border-slate-700
              hover:border-slate-500 px-4 py-2 rounded-lg transition-colors"
          >
            Log in
          </button>
          <button
            onClick={onSignup}
            className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500
              px-4 py-2 rounded-lg transition-colors"
          >
            Sign up free
          </button>
        </div>
      </div>
    </header>
  )
}

function HeroSection({ onSignup }: { onSignup: () => void }) {
  const [what, setWhat] = useState('')
  const [where, setWhere] = useState('')

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#080b12]" />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]
          bg-indigo-900/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px]
          bg-violet-900/20 rounded-full blur-[100px]" />
      </div>
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className={`${CONTAINER} relative z-10 w-full py-24`}>
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left: text + search */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Claude AI
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                Find your next job
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-violet-500 bg-clip-text text-transparent">
                  with AI that actually
                </span>
                <br />
                reads your resume.
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                JobLens uses Claude AI to score every job against your skills, so you only see the
                matches worth applying to — not thousands of irrelevant listings.
              </p>
            </div>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row items-stretch rounded-2xl border border-slate-700/80
              bg-slate-900/80 backdrop-blur overflow-hidden shadow-xl max-w-2xl mx-auto lg:mx-0">
              <div className="relative flex-[3] min-w-0">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text" value={what} onChange={e => setWhat(e.target.value)}
                  placeholder="Job title, skill, or company"
                  className="w-full h-14 pl-11 pr-4 bg-transparent text-slate-200 text-sm
                    placeholder:text-slate-600 focus:outline-none"
                />
              </div>
              <div className="w-px bg-slate-800 self-stretch my-3 hidden sm:block shrink-0" />
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
                  type="text" value={where} onChange={e => setWhere(e.target.value)}
                  placeholder="Location"
                  className="w-full h-14 pl-10 pr-4 bg-transparent text-slate-200 text-sm
                    placeholder:text-slate-600 focus:outline-none"
                />
              </div>
              <button
                onClick={onSignup}
                className="h-14 sm:h-auto shrink-0 px-7 bg-indigo-600 hover:bg-indigo-500
                  text-white font-semibold text-sm transition-colors"
              >
                Search
              </button>
            </div>

            {/* Social proof stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2
              text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                100+ open roles
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                AI-scored in seconds
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Always free for job seekers
              </span>
            </div>
          </div>

          {/* Right: product preview */}
          <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-[380px]">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      num: '01', icon: <Upload className="w-6 h-6" />,
      title: 'Upload your resume',
      desc: 'We parse your skills, experience, and titles using Claude AI — takes under 10 seconds.',
    },
    {
      num: '02', icon: <Zap className="w-6 h-6" />,
      title: 'We score every job',
      desc: 'Claude reads each posting and scores it 0–100 against your actual skills, not just keywords.',
    },
    {
      num: '03', icon: <CheckCircle2 className="w-6 h-6" />,
      title: 'See only the matches',
      desc: 'Browse jobs ranked by how well they fit you — with transparent reasoning per listing.',
    },
  ]

  return (
    <section id="how-it-works" className="py-28 bg-slate-950">
      <div className={CONTAINER}>
        <FadeIn className="text-center mb-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">How it works</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Three steps. No noise.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 100}>
              <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-8
                hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/20
                    flex items-center justify-center text-indigo-400 shrink-0">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-bold text-slate-800 leading-none">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'AI-powered matching',
      body: 'Every job is scored 0–100 against your resume by Claude — not keyword stuffing, but real skill alignment.',
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'Real-time aggregation',
      body: 'Fresh listings aggregated daily from multiple sources. Always current, never stale.',
    },
    {
      icon: <SlidersHorizontal className="w-5 h-5" />,
      title: 'Smart filters',
      body: 'Filter by level, work mode, location, date posted, salary range, and minimum match score.',
    },
    {
      icon: <BookmarkCheck className="w-5 h-5" />,
      title: 'Favorites & applied tracking',
      body: 'Save listings you love, track what you\'ve applied to, and never lose a lead.',
    },
    {
      icon: <FileSearch className="w-5 h-5" />,
      title: 'Matched skills breakdown',
      body: 'See exactly which skills on your resume match each job — so you know why it fits.',
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: 'Built for serious job seekers',
      body: 'No ads, no spam, no pay-to-apply gimmicks. Just clean data and honest match scores.',
    },
  ]

  return (
    <section id="features" className="py-28 bg-[#080b12]">
      <div className={CONTAINER}>
        <FadeIn className="text-center mb-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Features</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Everything you need to land the right role.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We built the tool we wished existed when we were job hunting.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 60}>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 lg:p-7
                hover:border-indigo-500/25 hover:bg-slate-900/80 hover:-translate-y-0.5
                transition-all duration-300 h-full">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20
                  flex items-center justify-center text-indigo-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhySection() {
  const BEFORE = [
    'Thousands of irrelevant listings to scroll through',
    'No idea why a job was "matched" to you',
    'Manually scan every job description for your skills',
    'Generic email alerts that miss the point',
    'Score hidden behind a paywall or company login',
  ]
  const AFTER = [
    'Only AI-scored matches above your minimum threshold',
    'Transparent 0–100 score with written reasoning',
    'Matched skills highlighted per listing',
    'Ranked by how well the role actually fits you',
    'Free, honest, no upsell required',
  ]

  return (
    <section className="py-28 bg-slate-950">
      <div className={CONTAINER}>
        <FadeIn className="text-center mb-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Why JobLens</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Job boards are broken. Here's the fix.
          </h2>
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <h3 className="text-base font-semibold text-slate-400">Traditional job boards</h3>
              </div>
              <ul className="space-y-4">
                {BEFORE.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm text-slate-500 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* JobLens */}
            <div className="bg-indigo-950/40 border border-indigo-500/25 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-violet-900/10 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="text-base font-semibold text-indigo-300">JobLens</h3>
                </div>
                <ul className="space-y-4">
                  {AFTER.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-300 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function PoweredBySection() {
  const items = [
    { label: 'Claude AI', sub: 'by Anthropic' },
    { label: 'Spring Boot', sub: 'Java backend' },
    { label: 'React 19', sub: '+ TypeScript' },
    { label: 'Tailwind CSS', sub: 'v4' },
    { label: 'MySQL', sub: 'via JPA' },
    { label: 'Adzuna API', sub: 'job listings' },
  ]
  return (
    <section className="py-14 bg-[#080b12] border-y border-slate-800/60">
      <div className={CONTAINER}>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Powered by</p>
          {items.map(item => (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-semibold text-slate-400">{item.label}</span>
              <span className="text-[0.65rem] text-slate-700">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection({ onSignup }: { onSignup: () => void }) {
  return (
    <section id="cta" className="py-28 bg-slate-950">
      <div className={CONTAINER}>
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Glow orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 px-10 py-20 text-center space-y-8">
              <div className="space-y-4 max-w-3xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                  Stop scrolling.<br />Start matching.
                </h2>
                <p className="text-lg text-indigo-200 max-w-lg mx-auto leading-relaxed">
                  Upload your resume in 30 seconds and see every job scored against your actual skills.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onSignup}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl
                    bg-white hover:bg-slate-100 text-slate-900 font-bold text-base
                    transition-colors shadow-lg shadow-black/20"
                >
                  Get started — it's free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium text-indigo-200 hover:text-white transition-colors"
                >
                  See how it works
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="footer" className="bg-[#080b12] border-t border-slate-800/60">
      <div className={CONTAINER}>
        <div className="py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <LogoWordmark size="lg" />
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-powered job matching. Find the roles you deserve, not just the ones that show up.
            </p>
            <p className="text-xs text-slate-700">
              © 2026 JobLens. Built by Vignesh Appani.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-5">Product</p>
            <ul className="space-y-3">
              {[
                { label: 'Features',     id: 'features'     },
                { label: 'How it works', id: 'how-it-works' },
                { label: 'Pricing',      id: 'cta'          },
              ].map(({ label, id }) => (
                <li key={id}>
                  <button
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-5">Company</p>
            <ul className="space-y-3">
              {['About', 'Privacy', 'Terms'].map(label => (
                <li key={label}>
                  <span className="text-sm text-slate-600">
                    {label} <span className="text-slate-700">— coming soon</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="py-5 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-700">© 2026 JobLens. All rights reserved.</p>
          <p className="text-xs text-slate-700">
            Built with{' '}
            <span className="text-indigo-500">Claude AI</span>
            {' '}· React · Spring Boot
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── LandingPage ───────────────────────────────────────────────────────────────

interface Props {
  initialMode?: 'login' | 'signup'
}

export default function LandingPage({ initialMode }: Props) {
  const { user } = useAuth()
  const navigate  = useNavigate()

  // If user logs in while on landing, redirect to app
  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  // Modal state
  const [modalOpen, setModalOpen] = useState(!!initialMode)
  const [modalMode, setModalMode] = useState<'login' | 'signup'>(initialMode ?? 'login')

  // Sync when route changes (e.g. / → /login)
  useEffect(() => {
    if (initialMode) {
      setModalMode(initialMode)
      setModalOpen(true)
    } else {
      setModalOpen(false)
    }
  }, [initialMode])

  function openLogin() {
    navigate('/login')
    setModalMode('login')
    setModalOpen(true)
  }

  function openSignup() {
    navigate('/signup')
    setModalMode('signup')
    setModalOpen(true)
  }

  function closeModal() {
    navigate('/')
    setModalOpen(false)
  }

  return (
    <div className="bg-[#080b12] text-white antialiased">
      <TopNav onLogin={openLogin} onSignup={openSignup} />
      <HeroSection onSignup={openSignup} />
      <HowItWorksSection />
      <FeaturesSection />
      <WhySection />
      <PoweredBySection />
      <CtaSection onSignup={openSignup} />
      <Footer />

      <AuthModal
        isOpen={modalOpen}
        initialMode={modalMode}
        onClose={closeModal}
      />
    </div>
  )
}
