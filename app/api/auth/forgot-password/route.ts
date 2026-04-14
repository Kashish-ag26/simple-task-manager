export const dynamic = 'force-dynamic';

import prisma from "@/server/prisma";
import { errorResponse, successResponse } from "@/server/api-response";
import { generateOTP, sendPasswordResetEmail } from "@/server/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return errorResponse("Email is required", 400);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({}, "If that email exists, a reset code will be sent.");
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.user.update({
      where: { email },
      data: { resetPasswordToken: otp, resetPasswordExpiry: expiry },
    });

    const emailSent = await sendPasswordResetEmail(email, user.name, otp);
    const devOtp = emailSent ? undefined : otp;

    return successResponse(
      { email, devOtp },
      emailSent
        ? "Reset code sent! Check your inbox."
        : "Reset code generated! (Dev mode — code shown on next screen)"
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Internal server error", 500);
  }
}

