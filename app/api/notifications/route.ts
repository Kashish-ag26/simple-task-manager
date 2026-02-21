import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const unreadCount = await prisma.notification.count({ where: { userId, read: false } });
    return successResponse({ notifications, unreadCount });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/notifications — mark all as read
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return successResponse(null, "All notifications marked as read");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

