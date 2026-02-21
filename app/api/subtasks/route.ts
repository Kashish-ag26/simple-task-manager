import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

// GET /api/subtasks?taskId=xxx
export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get("taskId");
    if (!taskId) return errorResponse("taskId required", 400);

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: "asc" },
    });

    return successResponse(subtasks);
  } catch {
    return errorResponse("Failed to fetch subtasks");
  }
}

// POST /api/subtasks
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { taskId, title } = body;
    if (!taskId || !title) return errorResponse("taskId and title required", 400);

    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId, OR: [{ assignedToId: userId }, { createdById: userId }] },
    });
    if (!task) return errorResponse("Task not found", 404);

    const count = await prisma.subtask.count({ where: { taskId } });
    const subtask = await prisma.subtask.create({
      data: { taskId, title, order: count },
    });

    return successResponse(subtask, "Subtask created");
  } catch {
    return errorResponse("Failed to create subtask");
  }
}
