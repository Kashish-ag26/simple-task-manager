"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { formatRelative, getStatusColor, getPriorityColor, getStatusLabel } from "@/utils/format";
import type { TaskWithRelations } from "@/types";

interface RecentActivityProps {
  tasks: TaskWithRelations[];
}

export default function RecentActivity({ tasks }: RecentActivityProps) {
  return (
    <Card glass>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Recent Activity
      </h3>
      {tasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  {task.assignedTo?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {task.title}
                </p>
                <p className="text-xs text-slate-400">
                  Assigned to {task.assignedTo?.name} &middot; {formatRelative(task.createdAt)}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
