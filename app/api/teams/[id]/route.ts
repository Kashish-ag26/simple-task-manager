import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, level: true, weeklyScore: true, totalScore: true } },
          },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!team) return errorResponse("Team not found", 404);
    return successResponse(team);
  } catch {
    return errorResponse("Failed to fetch team");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!userId) return errorResponse("Unauthorized", 401);
    if (role !== "ADMIN") return errorResponse("Forbidden", 403);

    const body = await req.json();
    const team = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
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

    return successResponse(team, "Team updated");
  } catch {
    return errorResponse("Failed to update team");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.team.delete({ where: { id: params.id } });
    return successResponse(null, "Team deleted");
  } catch {
    return errorResponse("Failed to delete team");
  }
}
