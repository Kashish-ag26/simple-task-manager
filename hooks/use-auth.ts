"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import toast from "react-hot-toast";
import type { UserPayload } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading, logout: clearAuth } = useAuthStore();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    if (!user && isLoading) {
      fetchUser();
    }
  }, [user, isLoading, fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) {
      // If blocked because email isn't verified, redirect to verify-email page
      if (res.status === 403 && data.data?.email) {
        const params = new URLSearchParams({ email: data.data.email });
        if (data.data.devOtp) params.set("devOtp", data.data.devOtp);
        router.push(`/verify-email?${params.toString()}`);
        throw new Error("Please verify your email. A new code has been sent.");
      }
      throw new Error(data.error || "Login failed");
    }
    setUser(data.data);
    toast.success("Welcome back!");
    const u = data.data as UserPayload;
    router.push(u.role === "ADMIN" ? "/admin" : "/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Registration failed");
    }
    setUser(data.data);
    toast.success("Account created successfully!");
    router.push("/dashboard");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    toast.success("Logged out");
    router.push("/login");
  };

  return { user, isLoading, login, register, logout, fetchUser };
}
