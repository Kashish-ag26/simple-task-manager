import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id")!;
    await prisma.notification.updateMany({
      where: { id: params.id, userId },
      data: { read: true },
    });
    return successResponse(null, "Notification marked as read");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
