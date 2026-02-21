import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: { emailVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        monthlyScore: true,
        totalScore: true,
        level: true,
        streak: true,
        _count: { select: { assignedTasks: { where: { status: "COMPLETED" } } } },
      },
      orderBy: { monthlyScore: "desc" },
      take: 20,
    });

    const leaderboard = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      monthlyScore: u.monthlyScore,
      totalScore: u.totalScore,
      level: u.level,
      streak: u.streak,
      completedTasks: u._count.assignedTasks,
    }));

    return successResponse(leaderboard);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

