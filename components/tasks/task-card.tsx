"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel } from "@/utils/format";
import type { TaskWithRelations } from "@/types";
import dynamic from "next/dynamic";

const FocusMode = dynamic(() => import("@/components/tasks/focus-mode"), { ssr: false });

interface TaskCardProps {
  task: TaskWithRelations;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export default function TaskCard({ task, onEdit, onDelete, index = 0 }: TaskCardProps) {
  const [focusOpen, setFocusOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        layout
      >
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 p-0">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              {task.recurrenceType && task.recurrenceType !== "NONE" && (
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  🔄 {task.recurrenceType.charAt(0) + task.recurrenceType.slice(1).toLowerCase()}
                </Badge>
              )}
              {task.team && (
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  👥 {task.team.name}
                </Badge>
              )}
            </div>

            {/* Subtask progress */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks</span>
                  <span>{Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-[10px] font-bold text-primary-600 dark:text-primary-400">
                  {task.assignedTo?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {task.assignedTo?.name}
                </span>
                <span className="text-xs text-slate-300 dark:text-slate-600">&middot;</span>
                <span className="flex-shrink-0 text-xs text-slate-400">{formatDate(task.dueDate)}</span>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setFocusOpen(true)}
                  title="Start focus session"
                  className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  🎧
                </button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(task.id)} className="text-red-500 hover:text-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {focusOpen && <FocusMode task={task} onClose={() => setFocusOpen(false)} />}
    </>
  );
}

