export const dynamic = 'force-dynamic';

import prisma from "@/server/prisma";
import { hashPassword } from "@/server/auth";
import { errorResponse, successResponse } from "@/server/api-response";

export async function POST(request: Request) {
  try {
    const { email, otp, password } = await request.json();
    if (!email || !otp || !password) return errorResponse("All fields are required", 400);
    if (password.length < 6) return errorResponse("Password must be at least 6 characters", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse("User not found", 404);
    if (!user.resetPasswordToken || !user.resetPasswordExpiry) {
      return errorResponse("No reset request found. Please request a new code.", 400);
    }
    if (new Date() > user.resetPasswordExpiry) {
      return errorResponse("Reset code expired. Please request a new one.", 410);
    }
    if (user.resetPasswordToken !== otp) {
      return errorResponse("Invalid reset code", 400);
    }

    const hashed = await hashPassword(password);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return successResponse({}, "Password reset successful! You can now sign in.");
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Internal server error", 500);
  }
}

