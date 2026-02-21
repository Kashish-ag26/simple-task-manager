"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatsCard from "@/components/dashboard/stats-card";
import TaskChart from "@/components/dashboard/task-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { AnalyticsData } from "@/types";
import dynamic from "next/dynamic";

const DeadlineRiskWidget = dynamic(() => import("@/components/dashboard/deadline-risk-widget"), { ssr: false });
const MoodTracker = dynamic(() => import("@/components/dashboard/mood-tracker"), { ssr: false });
const ReportExport = dynamic(() => import("@/components/dashboard/report-export"), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Users see their own tasks summary, admins see analytics
        const tasksRes = await fetch("/api/tasks?limit=50");
        const tasksData = await tasksRes.json();

        if (tasksData.success) {
          const tasks = tasksData.data;
          const completed = tasks.filter((t: { status: string }) => t.status === "COMPLETED").length;
          const pending = tasks.filter((t: { status: string }) => t.status === "PENDING").length;
          const inProgress = tasks.filter((t: { status: string }) => t.status === "IN_PROGRESS").length;
          const high = tasks.filter((t: { priority: string }) => t.priority === "HIGH").length;
          const medium = tasks.filter((t: { priority: string }) => t.priority === "MEDIUM").length;
          const low = tasks.filter((t: { priority: string }) => t.priority === "LOW").length;

          setData({
            totalTasks: tasksData.meta?.total || tasks.length,
            completedTasks: completed,
            pendingTasks: pending,
            inProgressTasks: inProgress,
            totalUsers: 0,
            tasksByPriority: [
              { name: "High", value: high, color: "#ef4444" },
              { name: "Medium", value: medium, color: "#f97316" },
              { name: "Low", value: low, color: "#94a3b8" },
            ],
            recentTasks: tasks.slice(0, 5),
          });
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s an overview of your tasks
        </p>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tasks"
            value={data?.totalTasks || 0}
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            color="indigo"
            index={0}
          />
          <StatsCard
            title="Completed"
            value={data?.completedTasks || 0}
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="green"
            index={1}
          />
          <StatsCard
            title="In Progress"
            value={data?.inProgressTasks || 0}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="blue"
            index={2}
          />
          <StatsCard
            title="Pending"
            value={data?.pendingTasks || 0}
            icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            color="yellow"
            index={3}
          />
        </div>
      )}

      {/* Charts & Activity */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TaskChart data={data.tasksByPriority} />
          <RecentActivity tasks={data.recentTasks} />
        </div>
      )}

      {/* Bottom row: Risk Detection + Mood Tracker + Reports */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <DeadlineRiskWidget />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">😊 Daily Mood Tracker</h3>
          <MoodTracker />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <ReportExport />
        </div>
      </div>
    </div>
  );
}
