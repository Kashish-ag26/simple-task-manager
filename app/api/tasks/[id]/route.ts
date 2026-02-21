import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { updateTaskSchema } from "@/server/validations";
import { successResponse, errorResponse } from "@/server/api-response";
import { updateUserScore } from "@/server/scoring";
import { checkAndGrantAchievements } from "@/server/achievements";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id")!;
    const userRole = request.headers.get("x-user-role")!;
    const { id } = params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // RBAC: Users can only edit their own tasks
    if (userRole !== "ADMIN" && task.assignedToId !== userId) {
      return errorResponse("You can only edit your own tasks", 403);
    }

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return errorResponse(errors, 400);
    }

    const { assignedToId, dueDate, ...rest } = parsed.data;

    // RBAC: Users cannot reassign tasks
    if (userRole !== "ADMIN" && assignedToId && assignedToId !== userId) {
      return errorResponse("You cannot reassign tasks", 403);
    }

    const updateData: Record<string, unknown> = { ...rest };
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        subtasks: { orderBy: { order: "asc" } },
        team: { select: { id: true, name: true } },
      },
    });

    // Gamification: update score if task was completed
    if (parsed.data.status === "COMPLETED" && task.status !== "COMPLETED") {
      const targetUserId = task.assignedToId;
      await updateUserScore({
        userId: targetUserId,
        taskStatus: "COMPLETED",
        priority: task.priority,
        dueDate: task.dueDate,
        previousStatus: task.status,
      });
      checkAndGrantAchievements(targetUserId).catch(() => {});

      // Auto-create next recurring task
      if (task.recurrenceType && task.recurrenceType !== "NONE") {
        const nextDue = task.dueDate ? new Date(task.dueDate) : new Date();
        if (task.recurrenceType === "DAILY") nextDue.setDate(nextDue.getDate() + 1);
        else if (task.recurrenceType === "WEEKLY") nextDue.setDate(nextDue.getDate() + 7);
        else if (task.recurrenceType === "MONTHLY") nextDue.setMonth(nextDue.getMonth() + 1);

        await prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            status: "PENDING",
            priority: task.priority,
            dueDate: nextDue,
            assignedToId: task.assignedToId,
            createdById: task.createdById,
            recurrenceType: task.recurrenceType,
            parentTaskId: task.id,
            teamId: task.teamId,
            imageUrl: null,
          },
        }).catch(() => {});

        await prisma.notification.create({
          data: {
            userId: task.assignedToId,
            title: "Recurring Task Created 🔄",
            message: `Next instance of "${task.title}" scheduled for ${nextDue.toLocaleDateString()}`,
            type: "info",
          },
        }).catch(() => {});
      }
    }

    // Notify on deadline approaching (if due date set and within 24h)
    if (parsed.data.dueDate && !parsed.data.status) {
      const due = new Date(parsed.data.dueDate);
      const hoursUntilDue = (due.getTime() - Date.now()) / 36e5;
      if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
        await prisma.notification.create({
          data: {
            userId: task.assignedToId,
            title: "Deadline Approaching ⏰",
            message: `"${task.title}" is due in less than 24 hours!`,
            type: "warning",
          },
        }).catch(() => {});
      }
    }

    return successResponse(updated, "Task updated");
  } catch (error) {
    console.error("Update task error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id")!;
    const userRole = request.headers.get("x-user-role")!;
    const { id } = params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // RBAC: Users can only delete their own tasks
    if (userRole !== "ADMIN" && task.assignedToId !== userId) {
      return errorResponse("You can only delete your own tasks", 403);
    }

    await prisma.task.delete({ where: { id } });
    return successResponse(null, "Task deleted");
  } catch (error) {
    console.error("Delete task error:", error);
    return errorResponse("Internal server error", 500);
  }
}
