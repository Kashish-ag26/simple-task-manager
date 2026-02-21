"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import TaskList from "@/components/tasks/task-list";
import TaskFilters from "@/components/tasks/task-filters";
import TaskForm from "@/components/tasks/task-form";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import KanbanBoard from "@/components/tasks/kanban-board";
import CalendarView from "@/components/tasks/calendar-view";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import SubtaskPanel from "@/components/tasks/subtask-panel";
import type { TaskWithRelations, TaskFilters as TFilters } from "@/types";
import type { CreateTaskInput } from "@/server/validations";
import toast from "react-hot-toast";

type ViewMode = "list" | "kanban" | "calendar";

const viewTabs: { id: ViewMode; label: string; icon: string }[] = [
  { id: "list",     label: "List",     icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { id: "kanban",   label: "Kanban",   icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" },
  { id: "calendar", label: "Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

export default function TasksPage() {
  const { tasks, isLoading, meta, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<TFilters>({
    search: "",
    status: undefined,
    priority: undefined,
    page: 1,
    limit: 50,
  });

  const loadTasks = useCallback(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as TFilters["status"],
      page: 1,
    }));
  };

  const handlePriorityFilter = (priority: string) => {
    setFilters((prev) => ({
      ...prev,
      priority: priority as TFilters["priority"],
      page: 1,
    }));
  };

  const handleCreate = async (data: CreateTaskInput & { recurrenceType?: string; teamId?: string; aiSubtasks?: string[] }) => {
    try {
      await createTask(data);
      setShowCreateModal(false);
      loadTasks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleEdit = async (data: CreateTaskInput & { recurrenceType?: string; teamId?: string }) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") => {
    try {
      await updateTask(taskId, { status: newStatus } as unknown as CreateTaskInput);
      loadTasks();
    } catch {
      toast.error("Failed to update task status");
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user?.role === "ADMIN" ? "All Tasks" : "My Tasks"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {meta.total} task{meta.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </Button>
      </motion.div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50 w-fit">
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              viewMode === tab.id
                ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filters (only in list mode) */}
      {viewMode === "list" && (
        <TaskFilters
          search={filters.search || ""}
          status={filters.status || ""}
          priority={filters.priority || ""}
          onSearchChange={handleSearch}
          onStatusChange={handleStatusFilter}
          onPriorityChange={handlePriorityFilter}
        />
      )}

      {/* Views */}
      {viewMode === "list" && (
        <>
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onEdit={(task) => setEditingTask(task)}
            onDelete={handleDelete}
          />
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {viewMode === "kanban" && (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEdit={(task) => setEditingTask(task)}
          onDelete={handleDelete}
        />
      )}

      {viewMode === "calendar" && (
        <CalendarView tasks={tasks} />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm onSubmit={handleCreate} />
      </Modal>

      {/* Mobile Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 shadow-lg shadow-primary-500/30 text-white lg:hidden"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setShowCreateModal(true)}
        aria-label="Create new task"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <div className="space-y-6">
            <TaskForm
              onSubmit={handleEdit}
              defaultValues={{
                title: editingTask.title,
                description: editingTask.description || "",
                status: editingTask.status,
                priority: editingTask.priority,
                dueDate: editingTask.dueDate,
                assignedToId: editingTask.assignedToId,
                recurrenceType: editingTask.recurrenceType,
                teamId: editingTask.teamId || "",
              }}
              isEdit
            />
            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Subtasks</p>
              <SubtaskPanel taskId={editingTask.id} taskStatus={editingTask.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


