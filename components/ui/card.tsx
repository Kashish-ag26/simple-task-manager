"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}

export default function Card({ children, className, glass = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/60 p-6 transition-all duration-300 dark:border-slate-700/60",
        glass
          ? "bg-white/70 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:bg-slate-800/70 dark:shadow-slate-900/50"
          : "bg-white shadow-sm dark:bg-slate-800",
        className
      )}
    >
      {children}
    </div>
  );
}
