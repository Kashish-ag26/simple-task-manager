"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AchievementBadge from "@/components/achievements/achievement-badge";
import ProgressCharts from "@/components/achievements/progress-charts";
import type { AchievementItem } from "@/types";

// Category groupings — each key maps to achievement keys that belong to it
const CATEGORIES: { label: string; emoji: string; keys: string[] }[] = [
  {
    label: "Task Milestones",
    emoji: "✅",
    keys: ["first_task", "tasks_5", "tasks_10", "tasks_25", "tasks_50", "tasks_100", "tasks_250", "tasks_500"],
  },
  {
    label: "Streaks",
    emoji: "🔥",
    keys: ["streak_3", "streak_7", "streak_14", "streak_30", "streak_60"],
  },
  {
    label: "Priority Master",
    emoji: "⚡",
    keys: ["high_priority_5", "high_priority_20", "medium_priority_15", "low_priority_20"],
  },
  {
    label: "Focus Sessions",
    emoji: "🧘",
    keys: [
      "focus_session",
      "focus_sessions_5",
      "focus_sessions_10",
      "focus_sessions_25",
      "focus_time_60",
      "focus_time_300",
    ],
  },
  {
    label: "Score & Level",
    emoji: "🏆",
    keys: ["score_100", "score_500", "score_1000", "score_5000", "level_performer", "level_pro", "level_master"],
  },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"achievements" | "progress">("achievements");

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => setAchievements(d.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const unlocked = achievements.filter((a) => !!a.unlockedAt);
  const locked   = achievements.filter((a) => !a.unlockedAt);
  const pct      = achievements.length ? Math.round((unlocked.length / achievements.length) * 100) : 0;

  const byKey = Object.fromEntries(achievements.map((a) => [a.key, a]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Achievements 🏅</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {unlocked.length} / {achievements.length} unlocked &mdash; {pct}% complete
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full sm:w-72">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Overall progress</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 w-fit">
          {(["achievements", "progress"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-800 shadow dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab === "achievements" ? "🏅 Achievements" : "📈 My Progress"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Achievements tab ──────────────────────────────────────────── */}
      {activeTab === "achievements" && (
        <>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            <>
              {/* Unlocked first */}
              {unlocked.length > 0 && (
                <section>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
                    Unlocked ({unlocked.length})
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {unlocked.map((a) => (
                      <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <AchievementBadge achievement={a} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Locked, grouped by category */}
              {locked.length > 0 && (
                <section className="space-y-8">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                    Locked ({locked.length})
                  </h2>
                  {CATEGORIES.map((cat) => {
                    const catLocked = cat.keys
                      .map((k) => byKey[k])
                      .filter((a) => a && !a.unlockedAt);
                    if (catLocked.length === 0) return null;
                    return (
                      <div key={cat.label}>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <span>{cat.emoji}</span> {cat.label}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {catLocked.map((a) => (
                            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <AchievementBadge achievement={a} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}

              {achievements.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl">🔒</p>
                  <p className="mt-2">Complete tasks to unlock achievements!</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Progress tab ─────────────────────────────────────────────── */}
      {activeTab === "progress" && <ProgressCharts />}
    </div>
  );
}

