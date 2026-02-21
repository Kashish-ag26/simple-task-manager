"use client";

import { motion } from "framer-motion";
import type { AchievementItem } from "@/types";

interface Props {
  achievement: AchievementItem;
}

export default function AchievementBadge({ achievement }: Props) {
  const unlocked = !!achievement.unlockedAt;

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className={`relative rounded-2xl border-2 p-4 transition-all ${
        unlocked
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-50 grayscale"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-4xl">{achievement.icon}</div>
        <div>
          <p className={`font-semibold ${unlocked ? "text-gray-800 dark:text-white" : "text-gray-500"}`}>
            {achievement.title}
          </p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{achievement.description}</p>
        </div>

        {unlocked ? (
          <p className="text-[11px] text-green-500">
            ✅ Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-[11px] text-gray-400">🔒 Locked</p>
        )}
      </div>
    </motion.div>
  );
}

