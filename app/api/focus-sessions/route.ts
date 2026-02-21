import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";
import { checkAndGrantAchievements } from "@/server/achievements";

// POST /api/focus-sessions — log a completed session
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;
    const { taskId, duration } = await request.json();

    if (!taskId || !duration) return errorResponse("taskId and duration required", 400);

    const session = await prisma.focusSession.create({
      data: { userId, taskId, duration: Number(duration) },
    });

    // Award focus score
    await prisma.user.update({
      where: { id: userId },
      data: {
        weeklyScore: { increment: 3 },
        monthlyScore: { increment: 3 },
        totalScore: { increment: 3 },
      },
    });

    // Add notification
    await prisma.notification.create({
      data: {
        userId,
        title: "Focus Session Complete! 🎧",
        message: `You completed a ${duration}-minute focus session. +3 points!`,
        type: "success",
      },
    });

    checkAndGrantAchievements(userId).catch(() => {});

    return successResponse(session, "Focus session logged", 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// GET /api/focus-sessions — get user's sessions
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;
    const sessions = await prisma.focusSession.findMany({
      where: { userId },
      include: { task: { select: { id: true, title: true } } },
      orderBy: { completedAt: "desc" },
      take: 20,
    });
    return successResponse(sessions);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

