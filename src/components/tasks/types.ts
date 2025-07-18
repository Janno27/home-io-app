export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'ongoing' | 'completed';
  priority: 'low' | 'medium' | 'high';
  type: 'project' | 'single' | 'subtask';
  parent_task_id?: string; // Pour les sous-tâches
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  organization_id?: string;
  assignee_id?: string;
  tags?: string[];
  estimated_duration?: number; // en minutes
  progress?: number; // Pourcentage de completion pour les projets (0-100)
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: 'todo' | 'ongoing' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  type?: 'project' | 'single' | 'subtask';
  parent_task_id?: string;
  due_date?: string;
  assignee_id?: string;
  tags?: string[];
  estimated_duration?: number;
  progress?: number;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
} 