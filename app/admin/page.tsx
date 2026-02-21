"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import StatsCard from "@/components/dashboard/stats-card";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { LEVEL_CONFIG } from "@/server/scoring";
import type { AnalyticsData } from "@/types";

const CARD = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800";

function CompletionRing({ rate }: { rate: number }) {
  const r = 54, circ = 2 * Math.PI * r, offset = circ - (rate / 100) * circ;
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <motion.circle cx="70" cy="70" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} transform="rotate(-90 70 70)" />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <text x="70" y="66" textAnchor="middle" fill="#1e293b" fontSize="22" fontWeight="700">{rate}%</text>
        <text x="70" y="84" textAnchor="middle" fill="#94a3b8" fontSize="11">Complete</text>
      </svg>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((r) => { if (r.success) setData(r.data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {user?.name} — full system overview
        </p>
      </motion.div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatsCard title="Total Tasks"  value={data?.totalTasks ?? 0}      icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" color="indigo"  index={0} />
          <StatsCard title="Completed"    value={data?.completedTasks ?? 0}  icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"                                                                                                                  color="green"  index={1} />
          <StatsCard title="In Progress"  value={data?.inProgressTasks ?? 0} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"                                                                                                                      color="blue"   index={2} />
          <StatsCard title="Pending"      value={data?.pendingTasks ?? 0}    icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"                           color="yellow" index={3} />
          <StatsCard title="Total Users"  value={data?.totalUsers ?? 0}      icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"                                                color="violet" index={4} />
          <StatsCard title="Done Rate"    value={`${data?.completionRate ?? 0}%`} icon="M13 10V3L4 14h7v7l9-11h-7z"                                                                                                                                   color="green"  index={5} />
        </div>
      )}

      {/* Row 2: Completion Ring + Status Pie + Priority Pie */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={CARD + " flex flex-col items-center justify-center gap-2"}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completion Rate</h3>
            <CompletionRing rate={data.completionRate} />
            <div className="mt-2 flex w-full justify-around text-center text-xs text-slate-500">
              <div><p className="text-lg font-bold text-green-500">{data.completedTasks}</p><p>Done</p></div>
              <div><p className="text-lg font-bold text-blue-500">{data.inProgressTasks}</p><p>Active</p></div>
              <div><p className="text-lg font-bold text-orange-500">{data.pendingTasks}</p><p>Waiting</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className={CARD}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.tasksByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {data.tasksByStatus.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "12px" }} />
                <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-xs text-slate-500">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className={CARD}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.tasksByPriority} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {data.tasksByPriority.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "12px" }} />
                <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-xs text-slate-500">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Row 3: Weekly Activity + User Growth */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={CARD}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Weekly Activity (last 7 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weeklyCompletion} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "12px" }} />
                <Legend verticalAlign="bottom" height={28} formatter={(v) => <span className="text-xs text-slate-500 capitalize">{v}</span>} />
                <Bar dataKey="created"   name="Created"   fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={CARD}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">User Growth (last 6 months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.userGrowth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "12px" }} />
                <Area type="monotone" dataKey="users" name="New Users" stroke="#6366f1" strokeWidth={2.5} fill="url(#userGrad)" dot={{ fill: "#6366f1", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Row 4: Per-User Stats Table */}
      {data?.userStats && data.userStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={CARD + " overflow-hidden p-0"}>
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">All Users — Task Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">User</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Level</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-green-500">Done</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-blue-500">Active</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-orange-400">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Progress</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-violet-500">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.userStats.map((u, i) => {
                  const cfg = LEVEL_CONFIG[u.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG["BEGINNER"];
                  const rate = u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0;
                  return (
                    <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-700">
                          {cfg.emoji} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{u.total}</td>
                      <td className="px-4 py-3 text-center font-semibold text-green-600">{u.completed}</td>
                      <td className="px-4 py-3 text-center font-semibold text-blue-600">{u.inProgress}</td>
                      <td className="px-4 py-3 text-center font-semibold text-orange-500">{u.pending}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                              transition={{ duration: 0.8, delay: i * 0.04 }}
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-green-500" />
                          </div>
                          <span className="w-9 text-right text-xs text-slate-400">{rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-violet-600 dark:text-violet-400">{u.totalScore}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Row 5: Top Performers */}
      {data?.topUsers && data.topUsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={CARD + " p-0 overflow-hidden"}>
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"> Top Performers This Month</h3>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.topUsers.map((u, i) => {
              const cfg = LEVEL_CONFIG[u.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG["BEGINNER"];
              const medals = ["", "", ""];
              return (
                <li key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <span className="w-8 text-center text-lg">{medals[i] ?? `#${i + 1}`}</span>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{u.name}</p>
                    <p className="text-xs text-slate-400">{cfg.emoji} {cfg.label}</p>
                  </div>
                  <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {u.monthlyScore} pts
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
