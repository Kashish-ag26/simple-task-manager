export const dynamic = 'force-dynamic';

import prisma from "@/server/prisma";
import { generateToken, setAuthCookie } from "@/server/auth";
import { successResponse, errorResponse } from "@/server/api-response";
import { initAchievements } from "@/server/achievements";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) return errorResponse("Email and OTP are required", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse("User not found", 404);
    if (user.emailVerified) return errorResponse("Email already verified", 400);
    if (!user.verificationOtp || !user.otpExpiry) return errorResponse("No OTP found. Please register again.", 400);
    if (new Date() > user.otpExpiry) return errorResponse("OTP expired. Please register again to get a new code.", 410);
    if (user.verificationOtp !== otp) return errorResponse("Invalid OTP", 400);

    const verified = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationOtp: null,
        otpExpiry: null,
      },
      select: { id: true, name: true, email: true, role: true, level: true, totalScore: true, weeklyScore: true, monthlyScore: true, streak: true },
    });

    // Ensure achievements table is seeded
    await initAchievements();

    const token = generateToken({ id: verified.id, email: verified.email, role: verified.role });
    await setAuthCookie(token);

    return successResponse(verified, "Email verified! Welcome to TaskManager 🎉");
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse("Internal server error", 500);
  }
}

