"use client";

import { create } from "zustand";
import type { UserPayload } from "@/types";

interface AuthState {
  user: UserPayload | null;
  isLoading: boolean;
  setUser: (user: UserPayload | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
}));
