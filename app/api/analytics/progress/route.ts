import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

// Returns week-vs-week and month-vs-month completion data for the requesting user.
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    const now = new Date();

    // ── Helpers ────────────────────────────────────────────────────────────
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const endOfDay   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    /** Count completed tasks for a user on a specific calendar day */
    const tasksOnDay = async (date: Date) =>
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: "COMPLETED",
          updatedAt: { gte: startOfDay(date), lte: endOfDay(date) },
        },
      });

    // ── Week comparison (last 7 days vs the 7 days before that) ───────────
    const thisWeekDays: { day: string; thisWeek: number; lastWeek: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const thisDay = new Date(now);
      thisDay.setDate(now.getDate() - i);

      const lastDay = new Date(thisDay);
      lastDay.setDate(thisDay.getDate() - 7);

      const [thisCount, lastCount] = await Promise.all([
        tasksOnDay(thisDay),
        tasksOnDay(lastDay),
      ]);

      thisWeekDays.push({
        day: dayLabels[thisDay.getDay()],
        thisWeek: thisCount,
        lastWeek: lastCount,
      });
    }

    // ── Month comparison (this month vs last month, grouped by week) ───────
    const currentMonth  = now.getMonth();
    const currentYear   = now.getFullYear();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonth     = lastMonthDate.getMonth();

    // Get number of days in each month
    const daysInThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();

    // Build 4-week buckets for both months
    const monthComparison: { week: string; thisMonth: number; lastMonth: number }[] = [];

    for (let weekIdx = 0; weekIdx < 4; weekIdx++) {
      const startDay = weekIdx * 7 + 1;
      const endDay   = Math.min((weekIdx + 1) * 7, daysInThisMonth);

      const thisStart = new Date(currentYear, currentMonth, startDay);
      const thisEnd   = new Date(currentYear, currentMonth, endDay, 23, 59, 59, 999);

      const lastStart = new Date(lastMonthYear, lastMonth, startDay);
      const lastEnd   = new Date(
        lastMonthYear,
        lastMonth,
        Math.min((weekIdx + 1) * 7, daysInLastMonth),
        23,
        59,
        59,
        999,
      );

      const [thisCount, lastCount] = await Promise.all([
        prisma.task.count({
          where: { assignedToId: userId, status: "COMPLETED", updatedAt: { gte: thisStart, lte: thisEnd } },
        }),
        prisma.task.count({
          where: { assignedToId: userId, status: "COMPLETED", updatedAt: { gte: lastStart, lte: lastEnd } },
        }),
      ]);

      monthComparison.push({
        week: `Week ${weekIdx + 1}`,
        thisMonth: thisCount,
        lastMonth: lastCount,
      });
    }

    // ── Score history (last 8 weeks, weekly totalScore snapshots from tasks) ──
    // We approximate this by counting completed tasks per week for the last 8 weeks
    const scoreHistory: { week: string; tasks: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - 6);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const count = await prisma.task.count({
        where: {
          assignedToId: userId,
          status: "COMPLETED",
          updatedAt: { gte: startOfDay(weekStart), lte: endOfDay(weekEnd) },
        },
      });

      const label = `W${8 - i}`;
      scoreHistory.push({ week: label, tasks: count });
    }

    return successResponse({ weekComparison: thisWeekDays, monthComparison, scoreHistory });
  } catch (err) {
    console.error("Progress analytics error:", err);
    return errorResponse("Internal server error", 500);
  }
}

