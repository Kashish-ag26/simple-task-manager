"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/server/validations";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Something went wrong");
        return;
      }
      const devOtp = result.data?.devOtp;
      if (devOtp) {
        toast.success("Code generated! (Dev mode — shown on next screen)");
      } else {
        toast.success("Reset code sent! Check your inbox.");
      }
      const params = new URLSearchParams({ email: data.email });
      if (devOtp) params.set("devOtp", devOtp);
      router.push(`/reset-password?${params.toString()}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-2xl font-bold text-white shadow-lg shadow-primary-500/30">
          🔑
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot password?</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we'll send you a reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
          Send Reset Code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

