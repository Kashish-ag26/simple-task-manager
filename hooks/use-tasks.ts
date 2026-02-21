"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import type { TaskWithRelations, TaskFilters, ApiResponse } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.priority) params.set("priority", filters.priority);
      if (filters?.search) params.set("search", filters.search);
      if (filters?.dueDate) params.set("dueDate", filters.dueDate);
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.limit) params.set("limit", String(filters.limit));

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data: ApiResponse<TaskWithRelations[]> = await res.json();

      if (data.success && data.data) {
        setTasks(data.data);
        if (data.meta) setMeta(data.meta);
      }
    } catch {
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = async (taskData: Record<string, unknown>) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    toast.success("Task created!");
    return data.data;
  };

  const updateTask = async (id: string, taskData: Record<string, unknown>) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...taskData } : t)) as TaskWithRelations[]
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (!data.success) {
        setTasks(previousTasks);
        throw new Error(data.error);
      }
      toast.success("Task updated!");
      return data.data;
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        setTasks(previousTasks);
        throw new Error(data.error);
      }
      toast.success("Task deleted!");
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  };

  return { tasks, isLoading, meta, fetchTasks, createTask, updateTask, deleteTask };
}
