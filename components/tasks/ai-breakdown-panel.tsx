"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/button";

interface AIBreakdown {
  subtasks: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: string;
  reasoning: string;
}

interface AIBreakdownPanelProps {
  title: string;
  onAccept: (data: AIBreakdown) => void;
  onAcceptSelected: (subtasks: string[], priority: string, deadline: string) => void;
}

export default function AIBreakdownPanel({ title, onAccept, onAcceptSelected }: AIBreakdownPanelProps) {
  const [breakdown, setBreakdown] = useState<AIBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    if (!title.trim() || title.trim().length < 3) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (data.success) {
        setBreakdown(data.data);
        setSelected(new Set(data.data.subtasks.map((_: string, i: number) => i)));
        setGenerated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const priorityColor = {
    HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:border-violet-800/40 dark:from-violet-900/20 dark:to-indigo-900/20">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Task Breakdown</h3>
        {!generated && (
          <Button
            size="sm"
            onClick={generate}
            isLoading={loading}
            disabled={!title.trim() || title.trim().length < 3}
            className="ml-auto bg-violet-600 hover:bg-violet-700 text-white text-xs"
          >
            {loading ? "Analyzing..." : "✨ Generate"}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {breakdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Suggestions */}
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColor[breakdown.priority]}`}>
                Priority: {breakdown.priority}
              </span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Deadline: {new Date(breakdown.deadline).toLocaleDateString()}
              </span>
            </div>

            {/* AI reasoning */}
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">{breakdown.reasoning}</p>

            {/* Subtask list */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Suggested subtasks (click to select):</p>
              {breakdown.subtasks.map((st, i) => (
                <motion.label
                  key={i}
                  whileHover={{ scale: 1.01 }}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    selected.has(i)
                      ? "bg-violet-100 text-violet-800 dark:bg-violet-800/30 dark:text-violet-200"
                      : "bg-white/60 text-slate-500 line-through dark:bg-slate-800/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => toggleSelect(i)}
                    className="accent-violet-600"
                  />
                  {st}
                </motion.label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const selectedSubtasks = breakdown.subtasks.filter((_, i) => selected.has(i));
                  onAcceptSelected(selectedSubtasks, breakdown.priority, breakdown.deadline);
                }}
                disabled={selected.size === 0}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs"
              >
                Accept Selected ({selected.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAccept(breakdown)}
                className="text-xs"
              >
                Accept All
              </Button>
              <button
                onClick={() => { setGenerated(false); setBreakdown(null); }}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:border-slate-600"
              >
                ↺
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!generated && !loading && (
        <p className="text-xs text-violet-600/70 dark:text-violet-400/70">
          Enter a task title above and click Generate to get AI-powered subtask suggestions, priority, and deadline.
        </p>
      )}
    </div>
  );
}
