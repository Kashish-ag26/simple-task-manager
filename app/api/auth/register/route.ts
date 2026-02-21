import { NextResponse } from "next/server";
import prisma from "@/server/prisma";
import { hashPassword } from "@/server/auth";
import { registerSchema } from "@/server/validations";
import { successResponse, errorResponse } from "@/server/api-response";
import { generateOTP, sendOTPEmail } from "@/server/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return errorResponse(errors, 400);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.emailVerified) {
      return errorResponse("Email already registered", 409);
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    if (existing && !existing.emailVerified) {
      // Resend OTP for unverified user
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, verificationOtp: otp, otpExpiry },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
          emailVerified: false,
          verificationOtp: otp,
          otpExpiry,
        },
      });
    }

    const emailSent = await sendOTPEmail(email, name, otp);
    const devOtp = emailSent ? undefined : otp;

    return successResponse({ email, devOtp }, emailSent ? "OTP sent to your email. Please verify." : "Account created! (Dev mode — code shown on next screen)", 201);
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}

