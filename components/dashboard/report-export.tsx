"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";

export default function ReportExport() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuthStore();

  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v ?? "")).replace(/,/g, ";"))
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = async (period: "weekly" | "monthly") => {
    setLoading(period);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      const data = await res.json();
      if (!data.success) return;

      const report = data.data;

      // Build a printable HTML report
      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${period === "weekly" ? "Weekly" : "Monthly"} Productivity Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 32px; border-radius: 16px; margin-bottom: 28px; }
  .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .header p { opacity: 0.85; font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .stat .label { font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat .value { font-size: 28px; font-weight: 800; color: #6366f1; }
  .section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); margin-bottom: 20px; }
  .section h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; background: #f1f5f9; font-weight: 600; color: #475569; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
  .HIGH { background: #fee2e2; color: #dc2626; }
  .MEDIUM { background: #fef3c7; color: #d97706; }
  .LOW { background: #dcfce7; color: #16a34a; }
  .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; }
  .bar-container { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .bar-label { width: 80px; font-size: 12px; color: #64748b; }
  .bar-track { flex: 1; height: 10px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 99px; }
  @media print { body { padding: 20px; background: white; } }
</style>
</head>
<body>
  <div class="header">
    <h1>${period === "weekly" ? "📅 Weekly" : "📆 Monthly"} Productivity Report</h1>
    <p>For ${report.user?.name || "User"} &bull; Generated on ${new Date(report.generatedAt).toLocaleString()}</p>
    <p style="margin-top:4px;font-size:12px;">${new Date(report.startDate).toLocaleDateString()} – ${new Date(report.endDate).toLocaleDateString()}</p>
  </div>

  <div class="grid">
    <div class="stat"><div class="label">Total Tasks</div><div class="value">${report.totalTasks}</div></div>
    <div class="stat"><div class="label">Completed</div><div class="value">${report.completedTasks}</div></div>
    <div class="stat"><div class="label">Completion Rate</div><div class="value">${report.completionRate}%</div></div>
    <div class="stat"><div class="label">Score</div><div class="value">${report.score || 0}</div></div>
  </div>

  <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
    <div class="stat"><div class="label">Focus Time</div><div class="value">${report.totalFocusMinutes || 0}m</div></div>
    <div class="stat"><div class="label">Level</div><div class="value" style="font-size:20px;">${report.user?.level || "BEGINNER"}</div></div>
    <div class="stat"><div class="label">Streak</div><div class="value">${report.user?.streak || 0} 🔥</div></div>
  </div>

  <div class="section">
    <h2>Priority Breakdown</h2>
    ${["HIGH", "MEDIUM", "LOW"].map((p) => {
      const count: number = (report.priorityBreakdown as Record<string, number>)?.[p] || 0;
      const max = Math.max(...Object.values(report.priorityBreakdown as Record<string, number>)) || 1;
      const pct = Math.round((count / max) * 100);
      return `<div class="bar-container"><div class="bar-label"><span class="badge ${p}">${p}</span></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span style="font-size:13px;font-weight:700;">${count}</span></div>`;
    }).join("")}
  </div>

  ${report.dailyBreakdown?.length ? `
  <div class="section">
    <h2>Daily Activity</h2>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      ${report.dailyBreakdown.map((d: { day: string; count: number }) => `<div style="text-align:center;min-width:60px;"><div style="font-size:22px;font-weight:800;color:#6366f1;">${d.count}</div><div style="font-size:11px;color:#64748b;">${d.day}</div></div>`).join("")}
    </div>
  </div>` : ""}

  ${report.tasks?.length ? `
  <div class="section">
    <h2>Completed Tasks</h2>
    <table><thead><tr><th>Title</th><th>Priority</th><th>Completed</th></tr></thead>
    <tbody>${report.tasks.map((t: { title: string; priority: string; updatedAt: string }) => `<tr><td>${t.title}</td><td><span class="badge ${t.priority}">${t.priority}</span></td><td>${new Date(t.updatedAt).toLocaleDateString()}</td></tr>`).join("")}</tbody>
    </table>
  </div>` : ""}

  <div class="footer">Generated by TaskFlow &bull; ${new Date().toLocaleDateString()}</div>
</body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      win?.addEventListener("load", () => { win.print(); });
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } finally {
      setLoading(null);
    }
  };

  const downloadAdminCSV = async () => {
    setLoading("csv");
    try {
      const res = await fetch("/api/reports?all=true&period=monthly");
      const data = await res.json();
      if (data.success) {
        downloadCSV(data.data.users, `taskflow-all-users-${new Date().toISOString().split("T")[0]}.csv`);
      }
    } finally {
      setLoading(null);
    }
  };

  const buttons = [
    { id: "weekly", label: "Weekly Report", icon: "📅", desc: "Last 7 days", color: "from-blue-500 to-indigo-500", onClick: () => downloadReport("weekly") },
    { id: "monthly", label: "Monthly Report", icon: "📆", desc: "This month", color: "from-violet-500 to-purple-500", onClick: () => downloadReport("monthly") },
    ...(user?.role === "ADMIN" ? [{ id: "csv", label: "All Users CSV", icon: "📊", desc: "Admin export", color: "from-emerald-500 to-teal-500", onClick: downloadAdminCSV }] : []),
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">📥 Download Reports</h3>
      <div className="grid gap-2">
        {buttons.map((btn) => (
          <motion.button
            key={btn.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={btn.onClick}
            disabled={loading === btn.id}
            className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${btn.color} p-3 text-left text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60`}
          >
            <span className="text-xl">{btn.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{btn.label}</p>
              <p className="text-xs opacity-80">{btn.desc}</p>
            </div>
            {loading === btn.id ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </motion.button>
        ))}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Reports open as printable PDF in a new tab</p>
    </div>
  );
}
