"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LeaderboardUser } from "@/types";
import { LEVEL_CONFIG } from "@/server/scoring";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setUsers(d.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const medalFor = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard 🏆</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Top performers this month</p>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No data yet — complete tasks to earn points!</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((u, i) => {
              const cfg = LEVEL_CONFIG[u.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG["BEGINNER"];
              return (
                <motion.li
                  key={u.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-6 py-4 ${i < 3 ? "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10" : ""}`}
                >
                  <span className="w-8 text-center text-xl font-bold">{medalFor(i)}</span>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-400">{cfg.emoji} {cfg.label} · {u.streak}🔥 streak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{u.monthlyScore}</p>
                    <p className="text-xs text-gray-400">pts / mo</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-600 dark:text-gray-300">{u.totalScore}</p>
                    <p className="text-xs text-gray-400">total</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

