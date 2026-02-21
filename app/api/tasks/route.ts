import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { createTaskSchema } from "@/server/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/server/api-response";
import { sendTaskAssignedEmail } from "@/server/email";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;
    const userRole = request.headers.get("x-user-role")!;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const dueDate = searchParams.get("dueDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

    // RBAC: Users can only see their own tasks
    if (userRole !== "ADMIN") {
      where.assignedToId = userId;
    }

    if (status && ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      where.status = status as Prisma.EnumTaskStatusFilter;
    }

    if (priority && ["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      where.priority = priority as Prisma.EnumPriorityFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.dueDate = { gte: date, lt: nextDay };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          subtasks: { orderBy: { order: "asc" } },
          team: { select: { id: true, name: true } },
          _count: { select: { subtasks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return paginatedResponse(tasks, { total, page, limit });
  } catch (error) {
    console.error("Get tasks error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;
    const userRole = request.headers.get("x-user-role")!;
    const body = await request.json();

    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return errorResponse(errors, 400);
    }

    const { title, description, status, priority, dueDate, assignedToId } = parsed.data;
    const recurrenceType = (body.recurrenceType as string) || "NONE";
    const teamId = (body.teamId as string) || null;
    const aiSubtasks: string[] = Array.isArray(body.aiSubtasks) ? body.aiSubtasks : [];

    // RBAC: Users can only assign tasks to themselves
    if (userRole !== "ADMIN" && assignedToId !== userId) {
      return errorResponse("You can only assign tasks to yourself", 403);
    }

    // Verify assigned user exists
    const assignedUser = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignedUser) {
      return errorResponse("Assigned user not found", 404);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "PENDING",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId,
        createdById: userId,
        imageUrl: null,
        recurrenceType: recurrenceType as "NONE" | "DAILY" | "WEEKLY" | "MONTHLY",
        teamId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        subtasks: { orderBy: { order: "asc" } },
        team: { select: { id: true, name: true } },
      },
    });

    // Create AI-generated subtasks if provided
    if (aiSubtasks.length > 0) {
      await prisma.subtask.createMany({
        data: aiSubtasks.map((title: string, order: number) => ({
          taskId: task.id,
          title,
          order,
        })),
      });
    }

    // Notify assigned user (if assigned by someone else)
    if (assignedToId !== userId) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          title: "New Task Assigned 📋",
          message: `You've been assigned: "${title}"`,
          type: "info",
        },
      });
      // Also send email (non-blocking)
      sendTaskAssignedEmail(task.assignedTo.email, task.assignedTo.name, title).catch(() => {});
    }

    return successResponse(task, "Task created", 201);
  } catch (error) {
    console.error("Create task error:", error);
    return errorResponse("Internal server error", 500);
  }
}

