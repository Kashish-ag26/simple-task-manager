"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/server/validations";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) { toast.error(result.error || "Registration failed"); return; }
      const devOtp = result.data?.devOtp;
      if (devOtp) {
        toast.success("Account created! (Email not configured — see code on next screen)");
      } else {
        toast.success("Verification code sent to your email!");
      }
      const params = new URLSearchParams({ email: data.email });
      if (devOtp) params.set("devOtp", devOtp);
      router.push(`/verify-email?${params.toString()}`);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-2xl font-bold text-white shadow-lg shadow-primary-500/30">
          T
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Join TaskManager to start organizing your work
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input id="name" label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register("name")} />
        <Input id="email" label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <div className="relative">
          <Input id="password" label="Password" type={showPw ? "text" : "password"} placeholder="Min 6 characters" error={errors.password?.message} {...register("password")} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-lg text-slate-400 hover:text-slate-600">{showPw ? "🙈" : "👁️"}</button>
        </div>
        <div className="relative">
          <Input id="confirmPassword" label="Confirm Password" type={showCpw ? "text" : "password"} placeholder="Repeat password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-9 text-lg text-slate-400 hover:text-slate-600">{showCpw ? "🙈" : "👁️"}</button>
        </div>
        <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
          Create Account — Verify Email
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}

