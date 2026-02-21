"use client";

import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

interface TaskFiltersProps {
  search: string;
  status: string;
  priority: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

export default function TaskFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: "", label: "All Status" },
            { value: "PENDING", label: "Pending" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "COMPLETED", label: "Completed" },
          ]}
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          options={[
            { value: "", label: "All Priority" },
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
        />
      </div>
    </div>
  );
}
