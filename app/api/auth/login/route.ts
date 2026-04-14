export const dynamic = 'force-dynamic';

import prisma from "@/server/prisma";
import { comparePassword, generateToken, setAuthCookie } from "@/server/auth";
import { loginSchema } from "@/server/validations";
import { successResponse, errorResponse } from "@/server/api-response";
import { generateOTP, sendOTPEmail } from "@/server/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return errorResponse(errors, 400);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse("Invalid email or password", 401);

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) return errorResponse("Invalid email or password", 401);

    if (!user.emailVerified) {
      // Re-send a fresh OTP so user can verify right away
      const otp = generateOTP();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.user.update({
        where: { email },
        data: { verificationOtp: otp, otpExpiry: expiry },
      });
      const emailSent = await sendOTPEmail(email, user.name, otp);
      const devOtp = emailSent ? undefined : otp;
      return errorResponse(
        "Please verify your email before logging in.",
        403,
        { email, devOtp }
      );
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return successResponse(
      { id: user.id, name: user.name, email: user.email, role: user.role, level: user.level, totalScore: user.totalScore, weeklyScore: user.weeklyScore, monthlyScore: user.monthlyScore, streak: user.streak },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}

