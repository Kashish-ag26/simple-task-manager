"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RiskItem {
  type: "overdue_high" | "overloaded_day" | "upcoming_high";
  message: string;
  taskIds: string[];
  date?: string;
  tasks?: { id: string; title: string; dueDate: string | null }[];
}

const riskConfig = {
  overdue_high: { icon: "🚨", color: "border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20", textColor: "text-red-700 dark:text-red-400", badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "OVERDUE" },
  overloaded_day: { icon: "⚠️", color: "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20", textColor: "text-amber-700 dark:text-amber-400", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "OVERLOADED" },
  upcoming_high: { icon: "⏰", color: "border-orange-200 bg-orange-50 dark:border-orange-800/40 dark:bg-orange-900/20", textColor: "text-orange-700 dark:text-orange-400", badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "DUE SOON" },
};

export default function DeadlineRiskWidget() {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/risks")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRisks(d.data.risks); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-6 w-40 rounded bg-slate-100 dark:bg-slate-700" />
        {[1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700" />)}
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/20">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">No deadline risks detected</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-500">You&apos;re on track with all your tasks!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Deadline Risk Detection</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
          {risks.length}
        </span>
      </div>

      <div className="space-y-2">
        {risks.map((risk, i) => {
          const cfg = riskConfig[risk.type];
          const isExpanded = expanded === String(i);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`overflow-hidden rounded-xl border ${cfg.color}`}
            >
              <button
                className="flex w-full items-center gap-3 p-3 text-left"
                onClick={() => setExpanded(isExpanded ? null : String(i))}
              >
                <span className="text-lg">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${cfg.textColor}`}>{risk.message}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cfg.badgeColor}`}>{cfg.label}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""} ${cfg.textColor}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isExpanded && risk.tasks && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-current/10 px-4 pb-3 pt-2 space-y-1">
                      {risk.tasks.map((t) => (
                        <div key={t.id} className="flex items-center justify-between">
                          <span className={`text-xs ${cfg.textColor} truncate`}>• {t.title}</span>
                          {t.dueDate && (
                            <span className="ml-2 shrink-0 text-xs opacity-70">
                              {new Date(t.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
