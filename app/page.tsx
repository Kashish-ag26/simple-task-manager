"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import ThemeToggle from "@/components/layout/theme-toggle";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

const FEATURES = [
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    title: "Smart Task Management",
    desc: "Create, assign, and prioritize tasks with rich metadata — deadlines, descriptions, and automatic AI-generated cover images.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Role-Based Access Control",
    desc: "Granular Admin and User roles keep sensitive data secure. Every API endpoint is guarded with JWT and permission checks.",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Analytics & Insights",
    desc: "Real-time dashboards with completion rates, weekly trends, and individual productivity metrics for every team member.",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Focus Mode — Pomodoro",
    desc: "Built-in 25-minute focus timer with progress ring animation. Complete a session and earn productivity points automatically.",
  },
  {
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    title: "Gamification & Levels",
    desc: "Earn points for completing tasks. Climb from Beginner to Master as your productivity score grows. Unlock achievements along the way.",
  },
  {
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    title: "Real-Time Notifications",
    desc: "Instant alerts for task assignments, approaching deadlines, and unlocked achievements — always up to date.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create an Account",
    desc: "Sign up with your email and verify with a secure one-time password. Your account is ready in under a minute.",
  },
  {
    step: "02",
    title: "Set Up Your Workspace",
    desc: "Admins invite team members, create tasks, and assign priorities. Users receive instant notifications and get to work.",
  },
  {
    step: "03",
    title: "Track, Focus & Grow",
    desc: "Switch between List, Kanban, and Calendar views. Use Focus Mode to deep-work through tasks and watch your score climb.",
  },
];

const STATS = [
  { value: "3 Views", label: "List · Kanban · Calendar" },
  { value: "25 min", label: "Pomodoro Focus Sessions" },
  { value: "7 Achievements", label: "Unlockable Badges" },
  { value: "4 Levels", label: "Beginner → Master" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* ─── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
              T
            </div>
            <span className="text-lg font-semibold tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1920&q=80&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/85 via-[#09090b]/70 to-[#09090b]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Team Productivity Platform
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="mt-8 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Work smarter.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Deliver faster.
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
          >
            TaskFlow is a full-featured team task manager with role-based access, gamification, focus sessions, 
            Kanban boards, and real-time notifications — everything your team needs to stay aligned and productive.
          </motion.p>

          <motion.div
            {...fadeUp(0.3)}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/register">
              <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95">
                Start for Free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <Link href="/login">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-7 py-3.5 text-base font-semibold text-zinc-300 backdrop-blur transition-all hover:bg-white/10 hover:text-white">
                Sign In
              </button>
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.p {...fadeUp(0.4)} className="mt-8 text-sm text-zinc-600">
            No credit card required · Secure OTP verification · Free to use
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="h-2 w-1 rounded-full bg-white/40"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-white/[0.06] sm:grid-cols-4 sm:divide-y-0">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.08)}
              className="flex flex-col items-center gap-1 px-8 py-8"
            >
              <span className="text-2xl font-bold text-white">{s.value}</span>
              <span className="text-center text-xs text-zinc-500">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <motion.div {...fadeUp(0)} className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Everything you need</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for real teams, not toy projects
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Six powerful modules work together seamlessly so your team can focus on shipping, not managing tools.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.07)}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/[0.06]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <motion.div {...fadeUp(0)} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Simple onboarding</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Up and running in minutes</h2>
          </motion.div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connector line */}
            <div className="absolute top-6 hidden h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent sm:block" />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-indigo-500/30 bg-[#09090b] text-sm font-bold text-indigo-400">
                  {step.step}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GAMIFICATION HIGHLIGHT ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent">
          <div className="grid gap-12 p-10 lg:grid-cols-2 lg:items-center lg:p-16">
            <motion.div {...fadeUp(0)}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Productivity Gamification</p>
              <h2 className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Work that rewards you
              </h2>
              <p className="mb-8 text-zinc-400 leading-relaxed">
                TaskFlow turns productivity into a game. Earn points for completing tasks, maintain daily streaks, 
                and unlock achievements as you grow. Compete with teammates on the monthly leaderboard.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "🌱 Beginner", sub: "Starting out — 0 pts" },
                  { label: "⚡ Performer", sub: "Getting traction — 80 pts" },
                  { label: "🔥 Pro", sub: "High output — 200 pts" },
                  { label: "👑 Master", sub: "Elite productivity — 500 pts" },
                ].map((l, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
                    <p className="text-sm font-semibold text-white">{l.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{l.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="space-y-3">
              {[
                { icon: "🎯", title: "Task Completion Points", desc: "+10 pts base · +5 bonus if finished early · +2 for high priority" },
                { icon: "🎧", title: "Focus Sessions", desc: "Log a 25-minute Pomodoro to earn +3 pts automatically" },
                { icon: "🔥", title: "Daily Streaks", desc: "Stay active every day to maintain your streak counter" },
                { icon: "🏆", title: "Achievement Badges", desc: "7 unique badges: First Task, 7-Day Warrior, Century, and more" },
                { icon: "📊", title: "Monthly Leaderboard", desc: "See how you rank against the rest of your team each month" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-white/[0.05] bg-white/[0.03] px-4 py-3.5">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── VIEWS SHOWCASE ──────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <motion.div {...fadeUp(0)} className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Flexible views</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See your work your way</h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-500">
              Switch between three powerful views depending on how you think and work best.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "☰", name: "List View", desc: "Clean, filterable list with full task details, pagination, and instant search." },
              { icon: "⬜", name: "Kanban Board", desc: "Drag and drop tasks across Pending, In Progress, and Completed columns." },
              { icon: "📅", name: "Calendar View", desc: "Monthly calendar with task dots per day. Click any date to see all tasks due." },
            ].map((v, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center transition-all hover:border-indigo-500/30"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl">
                  {v.icon}
                </div>
                <h3 className="mb-2 font-semibold text-white">{v.name}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-center shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform how your team works?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">
              Join TaskFlow today. Create your account in seconds — no credit card, no setup friction, just productivity.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <button className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 active:scale-95">
                  Create Free Account
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
              <Link href="/login">
                <button className="rounded-xl border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
              T
            </div>
            <span className="font-semibold text-zinc-400">TaskFlow</span>
          </div>
          <p className="text-xs text-zinc-600">
            Built with Next.js 14 · TypeScript · PostgreSQL · Prisma · TailwindCSS
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-zinc-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


