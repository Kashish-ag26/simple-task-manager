import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET() {
  try {
    const now = new Date();

    const [
      totalTasks, completedTasks, pendingTasks, inProgressTasks,
      highPriority, mediumPriority, lowPriority, totalUsers, recentTasks, topUsers, allUsers,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.task.count({ where: { status: "PENDING" } }),
      prisma.task.count({ where: { status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { priority: "HIGH" } }),
      prisma.task.count({ where: { priority: "MEDIUM" } }),
      prisma.task.count({ where: { priority: "LOW" } }),
      prisma.user.count(),
      prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { monthlyScore: "desc" },
        take: 5,
        select: { name: true, monthlyScore: true, level: true },
      }),
      prisma.user.findMany({
        select: {
          id: true, name: true, email: true, level: true, totalScore: true, createdAt: true,
          _count: { select: { assignedTasks: true } },
        },
        orderBy: { totalScore: "desc" },
      }),
    ]);

    // Per-user task breakdown
    const userStats = await Promise.all(
      allUsers.map(async (u) => {
        const [completed, inProgress, pending] = await Promise.all([
          prisma.task.count({ where: { assignedToId: u.id, status: "COMPLETED" } }),
          prisma.task.count({ where: { assignedToId: u.id, status: "IN_PROGRESS" } }),
          prisma.task.count({ where: { assignedToId: u.id, status: "PENDING" } }),
        ]);
        return {
          name: u.name,
          email: u.email,
          level: u.level,
          totalScore: u.totalScore,
          total: u._count.assignedTasks,
          completed,
          inProgress,
          pending,
        };
      })
    );

    // Weekly completion data (last 7 days)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyCompletion = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const start = new Date(new Date(d).setHours(0, 0, 0, 0));
        const end = new Date(new Date(d).setHours(23, 59, 59, 999));
        const [completed, created] = await Promise.all([
          prisma.task.count({ where: { status: "COMPLETED", updatedAt: { gte: start, lte: end } } }),
          prisma.task.count({ where: { createdAt: { gte: start, lte: end } } }),
        ]);
        return { day: days[start.getDay()], completed, created };
      })
    );

    // Monthly user growth (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const userGrowth = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const users = await prisma.user.count({ where: { createdAt: { gte: start, lte: end } } });
        return { month: monthNames[start.getMonth()], users };
      })
    );

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse({
      totalTasks, completedTasks, pendingTasks, inProgressTasks, totalUsers, completionRate,
      tasksByPriority: [
        { name: "High", value: highPriority, color: "#ef4444" },
        { name: "Medium", value: mediumPriority, color: "#f97316" },
        { name: "Low", value: lowPriority, color: "#94a3b8" },
      ],
      tasksByStatus: [
        { name: "Completed", value: completedTasks, color: "#22c55e" },
        { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
        { name: "Pending", value: pendingTasks, color: "#f97316" },
      ],
      recentTasks,
      weeklyCompletion,
      userGrowth,
      topUsers,
      userStats,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return errorResponse("Internal server error", 500);
  }
}

