import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { updateUserSchema } from "@/server/validations";
import { successResponse, errorResponse } from "@/server/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return errorResponse(errors, 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return successResponse(updated, "User updated");
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const requestUserId = request.headers.get("x-user-id");

    if (id === requestUserId) {
      return errorResponse("You cannot delete your own account", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse("User not found", 404);
    }

    await prisma.task.deleteMany({
      where: { OR: [{ assignedToId: id }, { createdById: id }] },
    });
    await prisma.user.delete({ where: { id } });

    return successResponse(null, "User deleted");
  } catch (error) {
    console.error("Delete user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
