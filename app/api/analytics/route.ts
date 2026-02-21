import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalTasks, completedTasks, pendingTasks, inProgressTasks,
      highPriority, mediumPriority, lowPriority, totalUsers, recentTasks, topUsers,
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
    ]);

    // Weekly completion data (last 7 days)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyCompletion = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));
        const completed = await prisma.task.count({
          where: { status: "COMPLETED", updatedAt: { gte: start, lte: end } },
        });
        return { day: days[start.getDay()], completed };
      })
    );

    return successResponse({
      totalTasks, completedTasks, pendingTasks, inProgressTasks, totalUsers,
      tasksByPriority: [
        { name: "High", value: highPriority, color: "#ef4444" },
        { name: "Medium", value: mediumPriority, color: "#f97316" },
        { name: "Low", value: lowPriority, color: "#94a3b8" },
      ],
      recentTasks,
      weeklyCompletion,
      topUsers,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return errorResponse("Internal server error", 500);
  }
}

