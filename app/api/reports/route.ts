import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!userId) return errorResponse("Unauthorized", 401);

    const period = req.nextUrl.searchParams.get("period") || "weekly"; // weekly | monthly
    const exportAll = req.nextUrl.searchParams.get("all") === "true" && role === "ADMIN";

    const now = new Date();
    let startDate: Date;

    if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // weekly — last 7 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    }

    if (exportAll) {
      // Admin: all users summary
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          level: true,
          weeklyScore: true,
          monthlyScore: true,
          totalScore: true,
          streak: true,
          _count: { select: { assignedTasks: true } },
        },
        orderBy: { totalScore: "desc" },
      });

      const usersWithCompletion = await Promise.all(
        users.map(async (u) => {
          const completed = await prisma.task.count({
            where: { assignedToId: u.id, status: "COMPLETED", updatedAt: { gte: startDate } },
          });
          const total = await prisma.task.count({
            where: { assignedToId: u.id, updatedAt: { gte: startDate } },
          });
          return {
            ...u,
            completedInPeriod: completed,
            totalInPeriod: total,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        })
      );

      return successResponse({ users: usersWithCompletion, period, generatedAt: new Date().toISOString() });
    }

    // User-specific report
    const tasks = await prisma.task.findMany({
      where: { assignedToId: userId, updatedAt: { gte: startDate } },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, weeklyScore: true, monthlyScore: true, totalScore: true, streak: true, level: true },
    });

    // Daily breakdown
    const dailyMap: Record<string, number> = {};
    for (const t of completedTasks) {
      const day = new Date(t.updatedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const dailyBreakdown = Object.entries(dailyMap).map(([day, count]) => ({ day, count }));

    const focusSessions = await prisma.focusSession.findMany({
      where: { userId, completedAt: { gte: startDate } },
      select: { duration: true },
    });
    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);

    return successResponse({
      user,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      score: period === "weekly" ? user?.weeklyScore : user?.monthlyScore,
      totalFocusMinutes,
      priorityBreakdown: {
        HIGH: completedTasks.filter((t) => t.priority === "HIGH").length,
        MEDIUM: completedTasks.filter((t) => t.priority === "MEDIUM").length,
        LOW: completedTasks.filter((t) => t.priority === "LOW").length,
      },
      dailyBreakdown,
      tasks: completedTasks.slice(0, 20),
      generatedAt: now.toISOString(),
    });
  } catch {
    return errorResponse("Failed to generate report");
  }
}
