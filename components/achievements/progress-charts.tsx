"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import Card from "@/components/ui/card";

interface WeekRow    { day: string;   thisWeek: number;  lastWeek: number  }
interface MonthRow   { week: string;  thisMonth: number; lastMonth: number }
interface ScoreRow   { week: string;  tasks: number }

interface ProgressData {
  weekComparison:  WeekRow[];
  monthComparison: MonthRow[];
  scoreHistory:    ScoreRow[];
}

const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
  fontSize: "13px",
  padding: "10px 14px",
};

function ChartSkeleton() {
  return (
    <div className="h-[260px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
  );
}

export default function ProgressCharts() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/progress")
      .then((r) => r.json())
      .then((d) => setData(d.data ?? null))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const thisWeekTotal  = data?.weekComparison.reduce((s, r) => s + r.thisWeek, 0)  ?? 0;
  const lastWeekTotal  = data?.weekComparison.reduce((s, r) => s + r.lastWeek, 0)  ?? 0;
  const thisMonthTotal = data?.monthComparison.reduce((s, r) => s + r.thisMonth, 0) ?? 0;
  const lastMonthTotal = data?.monthComparison.reduce((s, r) => s + r.lastMonth, 0) ?? 0;

  const weekDelta  = thisWeekTotal  - lastWeekTotal;
  const monthDelta = thisMonthTotal - lastMonthTotal;

  const deltaLabel = (d: number) =>
    d === 0 ? "same as before" : d > 0 ? `+${d} more than before` : `${d} less than before`;

  return (
    <div className="space-y-6">
      {/* Summary pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3"
      >
        {[
          { label: "This week",  value: thisWeekTotal,  delta: weekDelta,  sub: "tasks completed" },
          { label: "Last week",  value: lastWeekTotal,  delta: null,        sub: "tasks completed" },
          { label: "This month", value: thisMonthTotal, delta: monthDelta, sub: "tasks completed" },
          { label: "Last month", value: lastMonthTotal, delta: null,        sub: "tasks completed" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{isLoading ? "—" : stat.value}</span>
            {stat.delta !== null && !isLoading && (
              <span
                className={`text-xs font-medium ${
                  stat.delta > 0
                    ? "text-green-500"
                    : stat.delta < 0
                    ? "text-red-400"
                    : "text-slate-400"
                }`}
              >
                {deltaLabel(stat.delta)}
              </span>
            )}
            <span className="text-[11px] text-slate-400">{stat.sub}</span>
          </div>
        ))}
      </motion.div>

      {/* Week-vs-week bar chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card glass>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Week vs Previous Week
          </h3>
          <p className="mb-4 text-xs text-slate-400">Tasks completed per day — this week vs last week</p>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.weekComparison ?? []} barCategoryGap="30%" barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Legend
                  height={32}
                  formatter={(v: string) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {v === "thisWeek" ? "This Week" : "Last Week"}
                    </span>
                  )}
                />
                <Bar dataKey="thisWeek" name="thisWeek" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastWeek" name="lastWeek" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>

      {/* Month-vs-month bar chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <Card glass>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Month vs Previous Month
          </h3>
          <p className="mb-4 text-xs text-slate-400">Tasks completed per week — this month vs last month</p>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.monthComparison ?? []} barCategoryGap="30%" barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Legend
                  height={32}
                  formatter={(v: string) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {v === "thisMonth" ? "This Month" : "Last Month"}
                    </span>
                  )}
                />
                <Bar dataKey="thisMonth" name="thisMonth" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastMonth" name="lastMonth"  fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>

      {/* 8-week trend line chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card glass>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            8-Week Trend
          </h3>
          <p className="mb-4 text-xs text-slate-400">Tasks completed each week over the past 8 weeks</p>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data?.scoreHistory ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  name="Tasks completed"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
