import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: userId,
        status: { not: "COMPLETED" },
        dueDate: { not: null },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        status: true,
      },
    });

    const risks = [];

    // 1. Overdue high priority
    const overdueHigh = tasks.filter(
      (t) => t.priority === "HIGH" && t.dueDate && new Date(t.dueDate) < now
    );
    if (overdueHigh.length > 0) {
      risks.push({
        type: "overdue_high",
        message: `${overdueHigh.length} overdue high-priority task${overdueHigh.length > 1 ? "s" : ""} need immediate attention`,
        taskIds: overdueHigh.map((t) => t.id),
        tasks: overdueHigh.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
      });
    }

    // 2. Tasks overloaded on same day (3+ tasks due same day)
    const dueDayMap: Record<string, typeof tasks> = {};
    for (const t of tasks) {
      if (t.dueDate) {
        const d = new Date(t.dueDate).toDateString();
        if (!dueDayMap[d]) dueDayMap[d] = [];
        dueDayMap[d].push(t);
      }
    }
    for (const [day, dayTasks] of Object.entries(dueDayMap)) {
      if (dayTasks.length >= 3) {
        risks.push({
          type: "overloaded_day",
          message: `${dayTasks.length} tasks due on ${day} — consider rescheduling`,
          taskIds: dayTasks.map((t) => t.id),
          date: day,
          tasks: dayTasks.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
        });
      }
    }

    // 3. Upcoming high priority within 48h
    const in48h = new Date(now);
    in48h.setHours(in48h.getHours() + 48);
    const upcomingHigh = tasks.filter(
      (t) =>
        t.priority === "HIGH" &&
        t.dueDate &&
        new Date(t.dueDate) >= now &&
        new Date(t.dueDate) <= in48h
    );
    if (upcomingHigh.length > 0) {
      risks.push({
        type: "upcoming_high",
        message: `${upcomingHigh.length} high-priority task${upcomingHigh.length > 1 ? "s" : ""} due within 48 hours`,
        taskIds: upcomingHigh.map((t) => t.id),
        tasks: upcomingHigh.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
      });
    }

    return successResponse({ risks, total: risks.length });
  } catch {
    return errorResponse("Failed to detect risks");
  }
}
