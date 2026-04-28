import { User, Event, Task, Notification } from '../../app/types';
import { ApiResponse, PaginatedResponse, QueryParams, AuthResponse } from '../types';

export interface IApiAdapter {
  // Auth
  login(email: string, password: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(token: string): Promise<AuthResponse>;

  // Users
  getUsers(params?: QueryParams): Promise<PaginatedResponse<User>>;
  getUserById(id: string): Promise<ApiResponse<User>>;

  // Events
  getEvents(params?: QueryParams): Promise<PaginatedResponse<Event>>;
  getEventById(id: string): Promise<ApiResponse<Event>>;
  createEvent(event: Partial<Event>): Promise<ApiResponse<Event>>;
  updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>>;
  deleteEvent(id: string): Promise<ApiResponse<void>>;

  // Tasks
  getTasks(params?: QueryParams): Promise<PaginatedResponse<Task>>;
  getTaskById(id: string): Promise<ApiResponse<Task>>;
  createTask(task: Partial<Task>): Promise<ApiResponse<Task>>;
  updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>>;
  deleteTask(id: string): Promise<ApiResponse<void>>;

  // Notifications
  getNotifications(params?: QueryParams): Promise<PaginatedResponse<Notification>>;
  markNotificationAsRead(id: string): Promise<ApiResponse<Notification>>;
}
