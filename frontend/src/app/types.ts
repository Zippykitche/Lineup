// Types for the KBC Team Calendar application

export type Role = 'super_admin' | 'editor' | 'assignee';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EventStatus = 'Planned' | 'In Progress' | 'Done';

export type OutputType = 'TV' | 'Radio' | 'Social' | 'Web';

export type EventType = 'general' | 'holiday';

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  attendeeIds: string[];
  createdBy: string;
  status: EventStatus;
  outputType: OutputType;
  type?: EventType;
  category?: string;
  priority?: TaskPriority;
  isPublic?: boolean;
}

export interface User {
  id: string;
  fullName: string;
  workEmail: string;
  role: Role;
  department: string;
  phone: string;
  photoUrl?: string;
  suspended?: boolean;
}


export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO date string
  assigneeIds: string[];
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  description?: string;
  eventId?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: string; // ISO date string
  read: boolean;
  type: 'meeting' | 'task' | 'reminder';
}