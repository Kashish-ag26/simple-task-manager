import nodemailer from "nodemailer";
import { Resend } from "resend";

const DEV_MODE =
  !process.env.RESEND_API_KEY &&
  (!process.env.EMAIL_FROM ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_FROM === "your_gmail@gmail.com");

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpHtml(name: string, otp: string, purpose = "verification") {
  const title = purpose === "reset" ? "Password Reset Code" : "Email Verification Code";
  const sub = purpose === "reset"
    ? `Hi ${name}, use the code below to reset your TaskManager password.`
    : `Hi ${name}, verify your email to get started with TaskManager.`;
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#09090b;padding:32px;border-radius:16px;">
      <h1 style="color:#6366f1;margin:0 0 8px;">TaskFlow</h1>
      <p style="color:#a1a1aa;margin:0 0 24px;">${sub}</p>
      <div style="background:#18181b;border:2px solid #312e81;border-radius:12px;padding:24px;text-align:center;">
        <p style="color:#a1a1aa;margin:0 0 8px;font-size:14px;">${title}</p>
        <p style="font-size:40px;font-weight:800;letter-spacing:8px;color:#818cf8;margin:0;">${otp}</p>
        <p style="color:#52525b;font-size:12px;margin:16px 0 0;">Expires in 10 minutes</p>
      </div>
      <p style="color:#52525b;font-size:12px;margin:24px 0 0;">If you didn't request this, you can safely ignore it.</p>
    </div>`;
}

async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "TaskFlow <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  });
  if (error) { console.error("Resend error:", error); return false; }
  return true;
}

async function sendViaGmail(to: string, subject: string, html: string): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({ from: `"TaskFlow" <${process.env.EMAIL_FROM}>`, to, subject, html });
  return true;
}

async function dispatchEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (DEV_MODE) {
    console.log(`\n🔐 [DEV MODE — no email configured] OTP for ${to}: (shown on screen)\n`);
    return false; // signals caller to include devOtp in response
  }
  try {
    if (process.env.RESEND_API_KEY) return await sendViaResend(to, subject, html);
    return await sendViaGmail(to, subject, html);
  } catch (err) {
    console.error("Email dispatch error:", err);
    return false;
  }
}

/** Returns true = email sent, false = dev mode (show OTP in UI) */
export async function sendOTPEmail(email: string, name: string, otp: string): Promise<boolean> {
  return dispatchEmail(email, "Your TaskFlow Verification Code", otpHtml(name, otp, "verify"));
}

/** Returns true = email sent, false = dev mode */
export async function sendPasswordResetEmail(email: string, name: string, otp: string): Promise<boolean> {
  return dispatchEmail(email, "Reset Your TaskFlow Password", otpHtml(name, otp, "reset"));
}

export async function sendTaskAssignedEmail(email: string, name: string, taskTitle: string): Promise<void> {
  if (DEV_MODE) return;
  try {
    const html = `<div style="font-family:sans-serif;padding:24px;background:#09090b;color:#a1a1aa;border-radius:12px;">
      <h2 style="color:#6366f1;">New Task Assigned</h2>
      <p>Hi ${name}, you have been assigned a new task:</p>
      <p style="font-size:18px;font-weight:600;color:#fff;">${taskTitle}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View Task</a>
    </div>`;
    if (process.env.RESEND_API_KEY) { await sendViaResend(email, `New task: ${taskTitle}`, html); return; }
    await sendViaGmail(email, `New task: ${taskTitle}`, html);
  } catch {}
}
