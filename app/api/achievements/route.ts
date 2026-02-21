import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";
import { initAchievements } from "@/server/achievements";

export async function GET(request: NextRequest) {
  try {
    // Ensure any newly added achievement definitions are persisted on first access
    await initAchievements();

    const userId = request.headers.get("x-user-id")!;
    const achievements = await prisma.achievement.findMany({
      include: {
        users: {
          where: { userId },
          select: { unlockedAt: true },
        },
      },
    });

    const result = achievements.map((a) => ({
      id: a.id,
      key: a.key,
      title: a.title,
      description: a.description,
      icon: a.icon,
      unlockedAt: a.users[0]?.unlockedAt ?? null,
    }));

    return successResponse(result);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

