export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'COLLABORATOR';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  assignedUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}
