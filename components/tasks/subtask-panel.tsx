"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import type { SubtaskItem } from "@/types";
import Button from "@/components/ui/button";

interface SubtaskPanelProps {
  taskId: string;
  taskStatus?: string;
  onProgressChange?: (percent: number) => void;
}

export default function SubtaskPanel({ taskId, onProgressChange }: SubtaskPanelProps) {
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const progress = subtasks.length === 0 ? 0 : Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100);

  useEffect(() => {
    fetch(`/api/subtasks?taskId=${taskId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSubtasks(data.data);
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  const addSubtask = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubtasks((prev) => [...prev, data.data]);
        setNewTitle("");
        setShowInput(false);
      }
    } finally {
      setAdding(false);
    }
  };

  const toggleSubtask = async (id: string, completed: boolean) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed } : s)));
    await fetch(`/api/subtasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
  };

  const deleteSubtask = async (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/subtasks/${id}`, { method: "DELETE" });
  };

  const handleReorder = async (newOrder: SubtaskItem[]) => {
    setSubtasks(newOrder);
    // Update orders in background
    newOrder.forEach((s, i) => {
      if (s.order !== i) {
        fetch(`/api/subtasks/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i }),
        }).catch(() => {});
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded-lg bg-slate-100 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{subtasks.filter((s) => s.completed).length}/{subtasks.length} subtasks</span>
            <span className="font-semibold text-primary-600">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          {progress === 100 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              ✅ All subtasks complete!
            </motion.p>
          )}
        </div>
      )}

      {/* Subtask list */}
      <Reorder.Group axis="y" values={subtasks} onReorder={handleReorder} className="space-y-1.5">
        <AnimatePresence>
          {subtasks.map((s) => (
            <Reorder.Item key={s.id} value={s}>
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="group flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50"
              >
                {/* Drag handle */}
                <svg className="h-3 w-3 cursor-grab text-slate-300 dark:text-slate-600 active:cursor-grabbing" fill="currentColor" viewBox="0 0 8 12">
                  <circle cx="2" cy="2" r="1" /><circle cx="6" cy="2" r="1" />
                  <circle cx="2" cy="6" r="1" /><circle cx="6" cy="6" r="1" />
                  <circle cx="2" cy="10" r="1" /><circle cx="6" cy="10" r="1" />
                </svg>

                <input
                  type="checkbox"
                  checked={s.completed}
                  onChange={(e) => toggleSubtask(s.id, e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-primary-500"
                />
                <span className={`flex-1 text-sm ${s.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                  {s.title}
                </span>
                <button
                  onClick={() => deleteSubtask(s.id)}
                  className="hidden text-slate-300 transition-colors hover:text-red-400 group-hover:flex dark:text-slate-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add subtask */}
      <AnimatePresence>
        {showInput ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addSubtask(); if (e.key === "Escape") setShowInput(false); }}
              placeholder="Subtask title..."
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <Button size="sm" onClick={addSubtask} isLoading={adding}>Add</Button>
            <button onClick={() => setShowInput(false)} className="rounded-lg px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowInput(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-slate-600 dark:hover:border-primary-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add subtask
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
