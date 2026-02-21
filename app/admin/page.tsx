"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatsCard from "@/components/dashboard/stats-card";
import TaskChart from "@/components/dashboard/task-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { LEVEL_CONFIG } from "@/server/scoring";
import type { AnalyticsData } from "@/types";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const maxWeekly = Math.max(...(data?.weeklyCompletion?.map((d) => d.completed) ?? [1]), 1);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard 🔐
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {user?.name} — here&apos;s your system overview
        </p>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard title="Total Tasks" value={data?.totalTasks || 0} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" color="indigo" index={0} />
          <StatsCard title="Completed" value={data?.completedTasks || 0} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="green" index={1} />
          <StatsCard title="In Progress" value={data?.inProgressTasks || 0} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="blue" index={2} />
          <StatsCard title="Pending" value={data?.pendingTasks || 0} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" color="yellow" index={3} />
          <StatsCard title="Total Users" value={data?.totalUsers || 0} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" color="violet" index={4} />
        </div>
      )}

      {/* Charts & Activity */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TaskChart data={data.tasksByPriority} />
          <RecentActivity tasks={data.recentTasks} />
        </div>
      )}

      {/* Weekly Completion Bar Chart */}
      {data?.weeklyCompletion && data.weeklyCompletion.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">Completions This Week</h2>
          <div className="flex items-end gap-3 h-36">
            {data.weeklyCompletion.map((day, i) => {
              const height = maxWeekly > 0 ? Math.max((day.completed / maxWeekly) * 100, day.completed > 0 ? 10 : 2) : 2;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{day.completed > 0 ? day.completed : ""}</span>
                  <div className="w-full rounded-t-lg bg-indigo-500/20 relative overflow-hidden" style={{ height: "100px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Top Users */}
      {data?.topUsers && data.topUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">Top Performers This Month</h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.topUsers.map((u, i) => {
              const cfg = LEVEL_CONFIG[u.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG["BEGINNER"];
              return (
                <li key={i} className="flex items-center gap-4 px-6 py-3">
                  <span className="w-6 text-center font-bold text-gray-400">#{i + 1}</span>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">{cfg.emoji} {cfg.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{u.monthlyScore} pts</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </div>
  );
}


