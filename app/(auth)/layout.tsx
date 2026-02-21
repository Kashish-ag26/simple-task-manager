export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      {/* Background orbs */}
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary-500/20 blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent-500/20 blur-[100px]" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/80">
        {children}
      </div>
    </div>
  );
}
