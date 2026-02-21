import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!userId) return errorResponse("Unauthorized", 401);

    const where = role === "ADMIN" ? {} : {
      OR: [
        { createdById: userId },
        { members: { some: { userId } } },
      ],
    };

    const teams = await prisma.team.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, level: true } },
          },
        },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(teams);
  } catch {
    return errorResponse("Failed to fetch teams");
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!userId) return errorResponse("Unauthorized", 401);
    if (role !== "ADMIN") return errorResponse("Forbidden", 403);

    const body = await req.json();
    const { name, description, memberIds = [] } = body;
    if (!name) return errorResponse("Team name required", 400);

    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        createdById: userId,
        members: {
          create: [
            { userId },
            ...memberIds.filter((id: string) => id !== userId).map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, level: true } },
          },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    return successResponse(team, "Team created");
  } catch {
    return errorResponse("Failed to create team");
  }
}
