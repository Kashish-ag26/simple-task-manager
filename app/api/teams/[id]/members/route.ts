import { NextRequest } from "next/server";
import prisma from "@/server/prisma";
import { successResponse, errorResponse } from "@/server/api-response";

// POST /api/teams/[id]/members — add member
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!userId) return errorResponse("Unauthorized", 401);
    if (role !== "ADMIN") return errorResponse("Forbidden", 403);

    const body = await req.json();
    const { userId: memberId } = body;
    if (!memberId) return errorResponse("userId required", 400);

    const member = await prisma.teamMember.create({
      data: { teamId: params.id, userId: memberId },
      include: {
        user: { select: { id: true, name: true, email: true, level: true } },
      },
    });

    return successResponse(member, "Member added");
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return errorResponse("User already in team", 409);
    }
    return errorResponse("Failed to add member");
  }
}

// DELETE /api/teams/[id]/members — remove member
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!userId) return errorResponse("Unauthorized", 401);
    if (role !== "ADMIN") return errorResponse("Forbidden", 403);

    const body = await req.json();
    const { userId: memberId } = body;
    if (!memberId) return errorResponse("userId required", 400);

    await prisma.teamMember.deleteMany({
      where: { teamId: params.id, userId: memberId },
    });

    return successResponse(null, "Member removed");
  } catch {
    return errorResponse("Failed to remove member");
  }
}
