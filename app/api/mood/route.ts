import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "30");

    const moods = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
    });

    // Insight: best mood productivity
    const completed = await prisma.task.findMany({
      where: { assignedToId: userId, status: "COMPLETED" },
      select: { updatedAt: true },
    });

    const moodProductivity = ["GREAT", "GOOD", "NEUTRAL", "BAD", "TERRIBLE"].map((mood) => {
      const moodDays = moods
        .filter((m) => m.mood === mood)
        .map((m) => new Date(m.date).toDateString());

      const tasksOnMoodDays = completed.filter((t) =>
        moodDays.includes(new Date(t.updatedAt).toDateString())
      ).length;

      return {
        mood,
        days: moodDays.length,
        tasksCompleted: tasksOnMoodDays,
        avgTasksPerDay: moodDays.length > 0 ? +(tasksOnMoodDays / moodDays.length).toFixed(1) : 0,
      };
    });

    const best = moodProductivity.reduce((a, b) => (b.avgTasksPerDay > a.avgTasksPerDay ? b : a), moodProductivity[0]);

    return successResponse({ moods, moodProductivity, bestMood: best });
  } catch {
    return errorResponse("Failed to fetch moods");
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { mood, note } = body;
    if (!mood) return errorResponse("mood required", 400);

    // Check if already logged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.moodEntry.findFirst({
      where: { userId, date: { gte: today, lt: tomorrow } },
    });

    let entry;
    if (existing) {
      entry = await prisma.moodEntry.update({
        where: { id: existing.id },
        data: { mood, note: note || null },
      });
    } else {
      entry = await prisma.moodEntry.create({
        data: { userId, mood, note: note || null },
      });
    }

    return successResponse(entry, "Mood logged");
  } catch {
    return errorResponse("Failed to log mood");
  }
}
