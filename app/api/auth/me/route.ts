import prisma from "@/server/prisma";
import { getTokenFromCookies, verifyToken } from "@/server/auth";
import { successResponse, errorResponse } from "@/server/api-response";

export async function GET() {
  try {
    const token = await getTokenFromCookies();
    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse("Invalid token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error("Auth me error:", error);
    return errorResponse("Internal server error", 500);
  }
}

