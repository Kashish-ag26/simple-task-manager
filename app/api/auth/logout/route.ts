export const dynamic = 'force-dynamic';

import { removeAuthCookie } from "@/server/auth";
import { successResponse, errorResponse } from "@/server/api-response";

export async function POST() {
  try {
    await removeAuthCookie();
    return successResponse(null, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Internal server error", 500);
  }
}

