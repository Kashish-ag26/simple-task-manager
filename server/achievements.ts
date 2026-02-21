import prisma from "@/server/prisma";

export const ACHIEVEMENT_DEFINITIONS = [
  // ── Task completion milestones ────────────────────────────────────
  {
    key: "first_task",
    title: "First Step",
    description: "Complete your very first task",
    icon: "🎯",
  },
  {
    key: "tasks_5",
    title: "Warming Up",
    description: "Complete 5 tasks",
    icon: "📝",
  },
  {
    key: "tasks_10",
    title: "Getting Things Done",
    description: "Complete 10 tasks",
    icon: "✅",
  },
  {
    key: "tasks_25",
    title: "Quarter Century",
    description: "Complete 25 tasks",
    icon: "🌟",
  },
  {
    key: "tasks_50",
    title: "Powerhouse",
    description: "Complete 50 tasks",
    icon: "💪",
  },
  {
    key: "tasks_100",
    title: "Century Mark",
    description: "Complete 100 tasks",
    icon: "💎",
  },
  {
    key: "tasks_250",
    title: "Task Machine",
    description: "Complete 250 tasks",
    icon: "🚀",
  },
  {
    key: "tasks_500",
    title: "Legend",
    description: "Complete 500 tasks",
    icon: "🏆",
  },

  // ── Streak achievements ───────────────────────────────────────────
  {
    key: "streak_3",
    title: "Habit Forming",
    description: "Maintain a 3-day productivity streak",
    icon: "🌱",
  },
  {
    key: "streak_7",
    title: "7-Day Warrior",
    description: "Maintain a 7-day productivity streak",
    icon: "🔥",
  },
  {
    key: "streak_14",
    title: "Two-Week Titan",
    description: "Maintain a 14-day productivity streak",
    icon: "⚡",
  },
  {
    key: "streak_30",
    title: "Monthly Marvel",
    description: "Maintain a 30-day productivity streak",
    icon: "🗓️",
  },
  {
    key: "streak_60",
    title: "Unstoppable",
    description: "Maintain a 60-day productivity streak",
    icon: "🔥🔥",
  },

  // ── Priority-based achievements ───────────────────────────────────
  {
    key: "high_priority_5",
    title: "Priority Master",
    description: "Complete 5 high priority tasks",
    icon: "⚡",
  },
  {
    key: "high_priority_20",
    title: "High Achiever",
    description: "Complete 20 high priority tasks",
    icon: "🎯",
  },
  {
    key: "medium_priority_15",
    title: "Balanced Worker",
    description: "Complete 15 medium priority tasks",
    icon: "📊",
  },
  {
    key: "low_priority_20",
    title: "No Task Left Behind",
    description: "Complete 20 low priority tasks",
    icon: "📋",
  },

  // ── Focus session achievements ────────────────────────────────────
  {
    key: "focus_session",
    title: "Deep Focus",
    description: "Complete your first focus session",
    icon: "🎧",
  },
  {
    key: "focus_sessions_5",
    title: "Flow State",
    description: "Complete 5 focus sessions",
    icon: "🎵",
  },
  {
    key: "focus_sessions_10",
    title: "Zen Mode",
    description: "Complete 10 focus sessions",
    icon: "🧘",
  },
  {
    key: "focus_sessions_25",
    title: "Focus Fanatic",
    description: "Complete 25 focus sessions",
    icon: "🧠",
  },
  {
    key: "focus_time_60",
    title: "One Focused Hour",
    description: "Accumulate 60 minutes in focus sessions",
    icon: "⏱️",
  },
  {
    key: "focus_time_300",
    title: "Focus Marathon",
    description: "Accumulate 300 minutes in focus sessions",
    icon: "⌛",
  },

  // ── Score achievements ────────────────────────────────────────────
  {
    key: "score_100",
    title: "Century",
    description: "Reach 100 total score points",
    icon: "💯",
  },
  {
    key: "score_500",
    title: "High Scorer",
    description: "Reach 500 total score points",
    icon: "🌠",
  },
  {
    key: "score_1000",
    title: "Grand Master",
    description: "Reach 1,000 total score points",
    icon: "💰",
  },
  {
    key: "score_5000",
    title: "Elite",
    description: "Reach 5,000 total score points",
    icon: "👑",
  },

  // ── Level achievements ────────────────────────────────────────────
  {
    key: "level_performer",
    title: "Rising Star",
    description: "Reach the PERFORMER level",
    icon: "📈",
  },
  {
    key: "level_pro",
    title: "Professional",
    description: "Reach the PRO level",
    icon: "🎖️",
  },
  {
    key: "level_master",
    title: "Master",
    description: "Reach the MASTER level — the pinnacle of productivity",
    icon: "🦾",
  },
];

export async function initAchievements(): Promise<void> {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { key: def.key },
      create: def,
      update: def,
    });
  }
}

export async function checkAndGrantAchievements(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: { include: { achievement: true } } },
  });
  if (!user) return [];

  const unlockedKeys = new Set(user.achievements.map((ua) => ua.achievement.key));
  const newlyUnlocked: string[] = [];

  const [
    completedTasks,
    highPriorityCompleted,
    mediumPriorityCompleted,
    lowPriorityCompleted,
    focusSessions,
    focusTimeResult,
  ] = await Promise.all([
    prisma.task.count({ where: { assignedToId: userId, status: "COMPLETED" } }),
    prisma.task.count({ where: { assignedToId: userId, status: "COMPLETED", priority: "HIGH" } }),
    prisma.task.count({ where: { assignedToId: userId, status: "COMPLETED", priority: "MEDIUM" } }),
    prisma.task.count({ where: { assignedToId: userId, status: "COMPLETED", priority: "LOW" } }),
    prisma.focusSession.count({ where: { userId } }),
    prisma.focusSession.aggregate({ where: { userId }, _sum: { duration: true } }),
  ]);

  const totalFocusMinutes = focusTimeResult._sum.duration ?? 0;

  const conditions: Record<string, boolean> = {
    // Task milestones
    first_task: completedTasks >= 1,
    tasks_5: completedTasks >= 5,
    tasks_10: completedTasks >= 10,
    tasks_25: completedTasks >= 25,
    tasks_50: completedTasks >= 50,
    tasks_100: completedTasks >= 100,
    tasks_250: completedTasks >= 250,
    tasks_500: completedTasks >= 500,
    // Streaks
    streak_3: user.streak >= 3,
    streak_7: user.streak >= 7,
    streak_14: user.streak >= 14,
    streak_30: user.streak >= 30,
    streak_60: user.streak >= 60,
    // Priority
    high_priority_5: highPriorityCompleted >= 5,
    high_priority_20: highPriorityCompleted >= 20,
    medium_priority_15: mediumPriorityCompleted >= 15,
    low_priority_20: lowPriorityCompleted >= 20,
    // Focus sessions
    focus_session: focusSessions >= 1,
    focus_sessions_5: focusSessions >= 5,
    focus_sessions_10: focusSessions >= 10,
    focus_sessions_25: focusSessions >= 25,
    focus_time_60: totalFocusMinutes >= 60,
    focus_time_300: totalFocusMinutes >= 300,
    // Scores
    score_100: user.totalScore >= 100,
    score_500: user.totalScore >= 500,
    score_1000: user.totalScore >= 1000,
    score_5000: user.totalScore >= 5000,
    // Levels
    level_performer: user.level === "PERFORMER" || user.level === "PRO" || user.level === "MASTER",
    level_pro: user.level === "PRO" || user.level === "MASTER",
    level_master: user.level === "MASTER",
  };

  for (const [key, earned] of Object.entries(conditions)) {
    if (earned && !unlockedKeys.has(key)) {
      const achievement = await prisma.achievement.findUnique({ where: { key } });
      if (!achievement) continue;
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      await prisma.notification.create({
        data: {
          userId,
          title: "Achievement Unlocked! 🏆",
          message: `${achievement.icon} ${achievement.title} — ${achievement.description}`,
          type: "achievement",
        },
      });
      newlyUnlocked.push(key);
    }
  }

  return newlyUnlocked;
}

