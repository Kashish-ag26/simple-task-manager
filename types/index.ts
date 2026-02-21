import { Role, TaskStatus, Priority, UserLevel, RecurrenceType, Mood } from "@prisma/client";

export type { Role, TaskStatus, Priority, UserLevel, RecurrenceType, Mood };

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
  level?: UserLevel;
  weeklyScore?: number;
  monthlyScore?: number;
  totalScore?: number;
  streak?: number;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  dueDate?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  tasksByPriority: { name: string; value: number; color: string }[];
  tasksByStatus: { name: string; value: number; color: string }[];
  recentTasks: TaskWithRelations[];
  totalUsers: number;
  weeklyCompletion?: { day: string; completed: number; created: number }[];
  userGrowth?: { month: string; users: number }[];
  topUsers?: { name: string; monthlyScore: number; level: UserLevel }[];
  userStats?: {
    name: string;
    email: string;
    level: string;
    totalScore: number;
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AchievementItem {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberItem {
  id: string;
  userId: string;
  teamId: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; level: UserLevel };
}

export interface TeamItem {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  members: TeamMemberItem[];
  _count?: { tasks: number; members: number };
}

export interface MoodEntryItem {
  id: string;
  userId: string;
  mood: Mood;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface DeadlineRisk {
  type: "overloaded_day" | "overdue_high" | "upcoming_high";
  message: string;
  taskIds: string[];
  date?: string;
}

export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  imageUrl: string | null;
  recurrenceType: RecurrenceType;
  teamId: string | null;
  assignedToId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  subtasks?: SubtaskItem[];
  team?: { id: string; name: string } | null;
  _count?: { subtasks: number };
}


export interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  monthlyScore: number;
  totalScore: number;
  level: UserLevel;
  streak: number;
  completedTasks: number;
}

