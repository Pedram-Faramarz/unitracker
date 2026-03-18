export interface User {
  id: number;
  email: string;
  full_name: string;
  university: string;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface Task {
  id: number;
  principle: number;
  text: string;
  notes: string;
  is_done: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  done_at: string | null;
  created_at: string;
}

export interface Principle {
  id: number;
  name: string;
  description: string;
  semester: string;
  color: string;
  is_archived: boolean;
  tasks: Task[];
  task_count: number;
  completed_task_count: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface PrincipleStats {
  total_principles: number;
  active_principles: number;
  archived_principles: number;
  completed_principles: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overall_progress: number;
  by_semester: SemesterStat[];
}

export interface SemesterStat {
  semester: string;
  principles: number;
  tasks: number;
  completed: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
