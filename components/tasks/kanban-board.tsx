"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import type { TaskWithRelations } from "@/types";
import { getPriorityColor } from "@/utils/format";

interface KanbanBoardProps {
  tasks: TaskWithRelations[];
  onStatusChange: (taskId: string, newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") => Promise<void>;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: { id: "PENDING" | "IN_PROGRESS" | "COMPLETED"; label: string; color: string; emoji: string }[] = [
  { id: "PENDING", label: "Pending", color: "border-slate-300 dark:border-slate-600", emoji: "📋" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-blue-400 dark:border-blue-500", emoji: "⚡" },
  { id: "COMPLETED", label: "Completed", color: "border-green-400 dark:border-green-500", emoji: "✅" },
];

function TaskKanbanCard({ task, onEdit, onDelete }: { task: TaskWithRelations; onEdit: (t: TaskWithRelations) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800"
    >
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">{task.title}</p>
      {task.description && <p className="mb-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>}
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-slate-700" title="Edit">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" title="Delete">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  col,
  tasks,
  isOver,
  onEdit,
  onDelete,
}: {
  col: (typeof COLUMNS)[number];
  tasks: TaskWithRelations[];
  isOver: boolean;
  onEdit: (t: TaskWithRelations) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col.id });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 ${col.color} ${
        isOver ? "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900" : ""
      } bg-slate-50/80 dark:bg-slate-900/50 p-3 transition-all`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{col.emoji}</span>
          <h3 className="font-semibold text-slate-800 dark:text-white">{col.label}</h3>
        </div>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="min-h-[120px] space-y-2">
          {tasks.length === 0 ? (
            <div
              className={`flex h-24 items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                isOver
                  ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/10"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            >
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isOver ? "Release to drop" : "Drop tasks here"}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskKanbanCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </div>
      </SortableContext>
    </motion.div>
  );
}

export default function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getColumnTasks = (status: string) => tasks.filter((t) => t.status === status);

  /** Resolve which column a droppable id belongs to.
   *  It could be a column id itself OR a task id (task inside a column). */
  const resolveColumn = (id: string | null): (typeof COLUMNS)[number] | undefined => {
    if (!id) return undefined;
    const directColumn = COLUMNS.find((c) => c.id === id);
    if (directColumn) return directColumn;
    // It's a task id — find which column contains that task
    const task = tasks.find((t) => t.id === id);
    if (task) return COLUMNS.find((c) => c.id === task.status);
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: { active: { id: string }; over: { id: string } | null }) => {
    const col = resolveColumn(event.over?.id ?? null);
    setOverColumnId(col?.id ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setOverColumnId(null);
    const { active, over } = event;
    if (!over) return;

    const targetColumn = resolveColumn(String(over.id));
    if (!targetColumn) return;

    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== targetColumn.id) {
      await onStatusChange(task.id, targetColumn.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver as any}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            tasks={getColumnTasks(col.id)}
            isOver={overColumnId === col.id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeTask && (
          <div className="rotate-2 rounded-xl border border-blue-400 bg-white p-3 shadow-2xl dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{activeTask.title}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(activeTask.priority)}`}>
              {activeTask.priority}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
