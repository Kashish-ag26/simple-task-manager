"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { TaskWithRelations } from "@/types";
import { getPriorityColor } from "@/utils/format";

interface CalendarViewProps {
  tasks: TaskWithRelations[];
  onEdit?: (task: TaskWithRelations) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarView({ tasks, onEdit }: CalendarViewProps) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const getTasksForDay = (day: number) => {
    const d = new Date(year, month, day);
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due.getFullYear() === year && due.getMonth() === month && due.getDate() === day;
    });
  };

  const selectedTasks = selected
    ? tasks.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due.getDate() === selected.getDate() && due.getMonth() === selected.getMonth() && due.getFullYear() === selected.getFullYear();
      })
    : [];

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{MONTHS[month]} {year}</h2>
        <button onClick={next} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayTasks = getTasksForDay(day);
          const isSelected = selected?.getDate() === day && selected?.getMonth() === month;
          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(isSelected ? null : new Date(year, month, day))}
              className={`relative min-h-[52px] rounded-xl p-1.5 text-left transition-colors ${
                isToday(day) ? "bg-primary-500 text-white" :
                isSelected ? "bg-primary-100 dark:bg-primary-900/40" :
                "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className={`text-xs font-semibold ${isToday(day) ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>{day}</span>
              <div className="mt-0.5 flex flex-wrap gap-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className={`h-1.5 flex-1 rounded-full ${
                    t.priority === "HIGH" ? "bg-red-400" : t.priority === "MEDIUM" ? "bg-amber-400" : "bg-slate-400"
                  }`} />
                ))}
                {dayTasks.length > 3 && <span className="text-[9px] text-slate-500">+{dayTasks.length - 3}</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
            Tasks for {selected.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks due this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((t) => (
                <div key={t.id} onClick={() => onEdit?.(t)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-primary-300 dark:border-slate-700 dark:hover:border-primary-600">
                  <span className="text-lg">{t.status === "COMPLETED" ? "✅" : t.status === "IN_PROGRESS" ? "⚡" : "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{t.title}</p>
                    <span className={`text-xs ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
