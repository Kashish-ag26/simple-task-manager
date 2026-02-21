import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

// PATCH /api/subtasks/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const subtask = await prisma.subtask.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.completed !== undefined && { completed: body.completed }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });

    // Auto-complete parent if all subtasks done
    if (body.completed !== undefined) {
      const all = await prisma.subtask.findMany({ where: { taskId: subtask.taskId } });
      if (all.length > 0 && all.every((s) => s.completed)) {
        await prisma.task.update({
          where: { id: subtask.taskId },
          data: { status: "COMPLETED" },
        });
      }
    }

    return successResponse(subtask, "Subtask updated");
  } catch {
    return errorResponse("Failed to update subtask");
  }
}

// DELETE /api/subtasks/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    await prisma.subtask.delete({ where: { id: params.id } });
    return successResponse(null, "Subtask deleted");
  } catch {
    return errorResponse("Failed to delete subtask");
  }
}
