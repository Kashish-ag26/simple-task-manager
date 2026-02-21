"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color: "indigo" | "green" | "yellow" | "red" | "violet" | "blue";
  index?: number;
}

const colorMap = {
  indigo: "from-primary-500 to-primary-600",
  green: "from-emerald-500 to-emerald-600",
  yellow: "from-amber-500 to-amber-600",
  red: "from-red-500 to-red-600",
  violet: "from-violet-500 to-violet-600",
  blue: "from-blue-500 to-blue-600",
};

const bgColorMap = {
  indigo: "bg-primary-500/10 dark:bg-primary-500/20",
  green: "bg-emerald-500/10 dark:bg-emerald-500/20",
  yellow: "bg-amber-500/10 dark:bg-amber-500/20",
  red: "bg-red-500/10 dark:bg-red-500/20",
  violet: "bg-violet-500/10 dark:bg-violet-500/20",
  blue: "bg-blue-500/10 dark:bg-blue-500/20",
};

export default function StatsCard({ title, value, subtitle, icon, color, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card glass className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={cn("rounded-xl p-3", bgColorMap[color])}>
            <svg
              className={cn("h-6 w-6")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
        </div>
        {/* Decorative gradient */}
        <div
          className={cn(
            "absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl",
            colorMap[color]
          )}
        />
      </Card>
    </motion.div>
  );
}
