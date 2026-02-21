"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Link from "next/link";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const initialDevOtp = searchParams.get("devOtp") || "";

  const [step, setStep] = useState<"otp" | "password">("otp");
  const [otp, setOtp] = useState(initialDevOtp ? initialDevOtp.split("") : ["", "", "", "", "", ""]);
  const [shownDevOtp, setShownDevOtp] = useState(initialDevOtp);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resendCode = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!result.success) { toast.error(result.error || "Failed to resend"); return; }
      const newDevOtp = result.data?.devOtp;
      if (newDevOtp) {
        setShownDevOtp(newDevOtp);
        setOtp(newDevOtp.split(""));
        toast.success("New code generated (shown on screen)");
      } else {
        setShownDevOtp("");
        setOtp(["", "", "", "", "", ""]);
        toast.success("New reset code sent to your email!");
      }
      setResendCooldown(60);
    } catch {
      toast.error("Failed to resend. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const verifyOtp = () => {
    if (otp.join("").length < 6) { toast.error("Enter the 6-digit code"); return; }
    setStep("password");
  };

  const handleReset = async () => {
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), password }),
      });
      const result = await res.json();
      if (!result.success) { toast.error(result.error || "Reset failed"); return; }
      toast.success("Password reset! You can now sign in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-3xl shadow-lg shadow-primary-500/30">
            {step === "otp" ? "🔑" : "🔒"}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === "otp" ? "Enter Reset Code" : "Set New Password"}
          </h1>
          {step === "otp" && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {shownDevOtp ? (
                <>Dev mode — your code is shown below.</>
              ) : (
                <>Code sent to <span className="font-semibold text-primary-600 dark:text-primary-400">{email}</span></>
              )}
            </p>
          )}
          {shownDevOtp && step === "otp" && (
            <div className="mt-3 rounded-xl border-2 border-indigo-500/40 bg-indigo-500/10 p-3">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">Dev Mode — Reset OTP</p>
              <p className="text-3xl font-black tracking-[0.3em] text-indigo-300">{shownDevOtp}</p>
              <p className="text-xs text-zinc-500 mt-1">Pre-filled below. Click Continue.</p>
            </div>
          )}
        </div>

        {step === "otp" ? (
          <div className="space-y-6">
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="h-14 w-12 rounded-xl border-2 border-slate-200 bg-white text-center text-xl font-bold text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              ))}
            </div>
            <Button onClick={verifyOtp} className="w-full" size="lg">
              Continue
            </Button>
            <div className="text-center">
              <button
                onClick={resendCode}
                disabled={resendCooldown > 0 || isResending}
                className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Didn't receive a code? Resend"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Input
                id="password"
                label="New Password"
                type={showPw ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-9 text-lg text-slate-400 hover:text-slate-600"
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handleReset} isLoading={isLoading} className="w-full" size="lg">
              Reset Password
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            ← Back to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
