"use client";

import { motion } from "framer-motion";
import type { UserLevel } from "@/types";

const LEVEL_CONFIG: Record<UserLevel, { label: string; color: string; emoji: string }> = {
  BEGINNER:  { label: "Beginner",  color: "#64748b", emoji: "🌱" },
  PERFORMER: { label: "Performer", color: "#3b82f6", emoji: "⚡" },
  PRO:       { label: "Pro",       color: "#8b5cf6", emoji: "🔥" },
  MASTER:    { label: "Master",    color: "#f59e0b", emoji: "👑" },
};

interface Props {
  totalScore: number;
  weeklyScore: number;
  monthlyScore: number;
  streak: number;
  level: UserLevel;
}

const LEVEL_THRESHOLDS: Record<string, { min: number; max: number }> = {
  BEGINNER:   { min: 0,   max: 80 },
  PERFORMER:  { min: 80,  max: 200 },
  PRO:        { min: 200, max: 500 },
  MASTER:     { min: 500, max: 1000 },
};

export default function ScoreCard({ totalScore, weeklyScore, monthlyScore, streak, level }: Props) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG["BEGINNER"];
  const { min, max } = LEVEL_THRESHOLDS[level] ?? { min: 0, max: 100 };
  const progress = Math.min(100, ((totalScore - min) / (max - min)) * 100);

  const nextLevel = Object.entries(LEVEL_THRESHOLDS).find(([, v]) => v.min > totalScore)?.[0] ?? "MAX";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ background: cfg.color + "22" }}>
          {cfg.emoji}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{cfg.label}</p>
          <p className="text-xs text-gray-400">{totalScore} total points</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{totalScore - min} / {max - min} XP</span>
          {nextLevel !== "MAX" && <span>Next: {LEVEL_CONFIG[nextLevel as UserLevel]?.label ?? nextLevel}</span>}
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: cfg.color }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 text-center dark:divide-gray-700">
        <div className="pr-2">
          <p className="text-lg font-bold text-gray-800 dark:text-white">{weeklyScore}</p>
          <p className="text-[11px] text-gray-400">This Week</p>
        </div>
        <div className="px-2">
          <p className="text-lg font-bold text-gray-800 dark:text-white">{monthlyScore}</p>
          <p className="text-[11px] text-gray-400">This Month</p>
        </div>
        <div className="pl-2">
          <p className="text-lg font-bold text-orange-500">{streak}🔥</p>
          <p className="text-[11px] text-gray-400">Day Streak</p>
        </div>
      </div>
    </div>
  );
}
