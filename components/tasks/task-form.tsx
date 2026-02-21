"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, type CreateTaskInput } from "@/server/validations";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import { formatDateForInput } from "@/utils/format";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import AIBreakdownPanel from "@/components/tasks/ai-breakdown-panel";

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput & { recurrenceType?: string; teamId?: string; aiSubtasks?: string[] }) => Promise<void>;
  defaultValues?: Partial<CreateTaskInput & { recurrenceType?: string; teamId?: string }>;
  isEdit?: boolean;
}

interface UserOption { id: string; name: string; email: string; }
interface TeamOption { id: string; name: string; }

export default function TaskForm({ onSubmit, defaultValues, isEdit }: TaskFormProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [aiSubtasks, setAiSubtasks] = useState<string[]>([]);
  const [showAI, setShowAI] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState(defaultValues?.recurrenceType || "NONE");
  const [teamId, setTeamId] = useState(defaultValues?.teamId || "");
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      status: defaultValues?.status || "PENDING",
      priority: defaultValues?.priority || "MEDIUM",
      dueDate: defaultValues?.dueDate ? formatDateForInput(defaultValues.dueDate) : "",
      assignedToId: defaultValues?.assignedToId || user?.id || "",
    },
  });

  const titleValue = watch("title");

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users").then((r) => r.json()).then((d) => { if (d.success) setUsers(d.data); }).catch(() => {});
    }
    fetch("/api/teams").then((r) => r.json()).then((d) => { if (d.success) setTeams(d.data); }).catch(() => {});
  }, [isAdmin]);

  const handleFormSubmit = async (data: CreateTaskInput) => {
    await onSubmit({ ...data, recurrenceType, teamId: teamId || undefined, aiSubtasks });
    if (!isEdit) { reset(); setAiSubtasks([]); setRecurrenceType("NONE"); setTeamId(""); }
  };

  const handleAIAccept = (breakdown: { subtasks: string[]; priority: string; deadline: string }) => {
    setAiSubtasks(breakdown.subtasks);
    setValue("priority", breakdown.priority as "LOW" | "MEDIUM" | "HIGH");
    setValue("dueDate", breakdown.deadline);
    setShowAI(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Input id="title" label="Task Title" placeholder="Enter task title" error={errors.title?.message} {...register("title")} />
        {!isEdit && (
          <button type="button" onClick={() => setShowAI(!showAI)}
            className="mt-1 flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
             {showAI ? "Hide" : "Use"} AI breakdown
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAI && !isEdit && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <AIBreakdownPanel title={titleValue} onAccept={handleAIAccept}
              onAcceptSelected={(subtasks, priority, deadline) => { setAiSubtasks(subtasks); setValue("priority", priority as "LOW" | "MEDIUM" | "HIGH"); setValue("dueDate", deadline); setShowAI(false); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {aiSubtasks.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-800/40 dark:bg-violet-900/20">
          <p className="mb-1 text-xs font-medium text-violet-700 dark:text-violet-300"> {aiSubtasks.length} subtasks will be created:</p>
          {aiSubtasks.map((s, i) => <p key={i} className="text-xs text-violet-600 dark:text-violet-400"> {s}</p>)}
          <button type="button" onClick={() => setAiSubtasks([])} className="mt-1 text-xs text-red-400 hover:text-red-500">Clear subtasks</button>
        </motion.div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <textarea className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          rows={3} placeholder="Describe the task..." {...register("description")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select id="status" label="Status" options={[{ value: "PENDING", label: "Pending" }, { value: "IN_PROGRESS", label: "In Progress" }, { value: "COMPLETED", label: "Completed" }]} error={errors.status?.message} {...register("status")} />
        <Select id="priority" label="Priority" options={[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }]} error={errors.priority?.message} {...register("priority")} />
      </div>

      <Input id="dueDate" label="Due Date" type="date" error={errors.dueDate?.message} {...register("dueDate")} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Recurrence </label>
        <div className="flex gap-2 flex-wrap">
          {["NONE", "DAILY", "WEEKLY", "MONTHLY"].map((r) => (
            <button key={r} type="button" onClick={() => setRecurrenceType(r)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${recurrenceType === r ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
              {r === "NONE" ? "No Repeat" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {teams.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to Team (optional)</label>
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="">No team</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      {isAdmin ? (
        <Select id="assignedToId" label="Assign To" options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))} error={errors.assignedToId?.message} {...register("assignedToId")} />
      ) : (
        <input type="hidden" value={user?.id || ""} {...register("assignedToId")} />
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {isEdit ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
}