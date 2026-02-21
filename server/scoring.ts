import prisma from "@/server/prisma";
import { TaskStatus, Priority, UserLevel } from "@prisma/client";

interface ScoreEvent {
  userId: string;
  taskStatus: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  previousStatus?: TaskStatus;
}

export function calculateScorePoints(event: ScoreEvent): number {
  const { taskStatus, priority, dueDate, previousStatus } = event;
  if (taskStatus !== "COMPLETED" || previousStatus === "COMPLETED") return 0;

  let points = 10; // base for completion

  // Priority bonus
  if (priority === "HIGH") points += 2;
  if (priority === "LOW") points -= 1;

  // Deadline check
  if (dueDate) {
    const now = new Date();
    if (now <= dueDate) {
      points += 5; // completed before due date
    } else {
      points -= 3; // missed deadline
    }
  }

  return Math.max(points, 1); // at least 1 point
}

export function calculateLevel(totalScore: number): UserLevel {
  if (totalScore >= 500) return "MASTER";
  if (totalScore >= 200) return "PRO";
  if (totalScore >= 80) return "PERFORMER";
  return "BEGINNER";
}

export async function updateUserScore(event: ScoreEvent): Promise<void> {
  const points = calculateScorePoints(event);
  if (points <= 0) return;

  const now = new Date();
  const user = await prisma.user.findUnique({ where: { id: event.userId } });
  if (!user) return;

  // Streak calculation
  let streak = user.streak;
  if (user.lastActiveDate) {
    const diffDays = Math.floor((now.getTime() - user.lastActiveDate.getTime()) / 86400000);
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
  } else {
    streak = 1;
  }

  const newTotal = user.totalScore + points;
  const level = calculateLevel(newTotal);

  await prisma.user.update({
    where: { id: event.userId },
    data: {
      weeklyScore: { increment: points },
      monthlyScore: { increment: points },
      totalScore: { increment: points },
      streak,
      lastActiveDate: now,
      level,
    },
  });
}

export const LEVEL_CONFIG: Record<UserLevel, { label: string; color: string; min: number; max: number; emoji: string }> = {
  BEGINNER:  { label: "Beginner",  color: "text-slate-500", min: 0,   max: 80,  emoji: "🌱" },
  PERFORMER: { label: "Performer", color: "text-blue-500",  min: 80,  max: 200, emoji: "⚡" },
  PRO:       { label: "Pro",       color: "text-violet-500",min: 200, max: 500, emoji: "🔥" },
  MASTER:    { label: "Master",    color: "text-amber-500", min: 500, max: 1000, emoji: "👑" },
};

