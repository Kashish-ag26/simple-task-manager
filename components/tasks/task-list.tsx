"use client";

import { AnimatePresence } from "framer-motion";
import TaskCard from "./task-card";
import { TaskCardSkeleton } from "@/components/ui/skeleton";
import type { TaskWithRelations } from "@/types";

interface TaskListProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, isLoading, onEdit, onDelete }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
        <svg
          className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-slate-500 dark:text-slate-400">No tasks found</p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Create a new task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            index={i}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
