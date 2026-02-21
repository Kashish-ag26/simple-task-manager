import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "No date";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, "MMM dd, yyyy");
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "COMPLETED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "MEDIUM":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "LOW":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export function getStatusLabel(status: string): string {
  return status.replace("_", " ");
}
