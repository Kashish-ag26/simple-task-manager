import prisma from "@/server/prisma";
import { generateOTP, sendOTPEmail } from "@/server/email";
import { successResponse, errorResponse } from "@/server/api-response";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return errorResponse("Email is required", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse("User not found", 404);
    if (user.emailVerified) return errorResponse("Email is already verified", 400);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { verificationOtp: otp, otpExpiry },
    });

    const emailSent = await sendOTPEmail(email, user.name, otp);
    const devOtp = emailSent ? undefined : otp;

    return successResponse(
      { email, devOtp },
      emailSent
        ? "New verification code sent to your email."
        : "New code generated! (Dev mode — shown on screen)"
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return errorResponse("Internal server error", 500);
  }
}

