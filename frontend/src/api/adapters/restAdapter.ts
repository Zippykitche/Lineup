import { IApiAdapter } from './apiAdapter';
import { User, Event, Task, Notification } from '../../app/types';
import { ApiResponse, PaginatedResponse, QueryParams, AuthResponse, AppError } from '../types';

/**
 * REST API Adapter
 * Implementation for a standard RESTful backend.
 * Uses fetch or axios to communicate with the server.
 */
export class RestAdapter implements IApiAdapter {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AppError(
        errorData.message || 'API Request failed',
        errorData.code || 'API_ERROR',
        response.status
      );
    }

    return response.json();
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User | null> {
    return this.request<User>('/auth/me');
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // --- Users ---
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<User>>(`/users?${query}`);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${id}`);
  }

  // --- Events ---
  async getEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Event>>(`/events?${query}`);
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    return this.request<ApiResponse<Event>>(`/events/${id}`);
  }

  async createEvent(event: Partial<Event>): Promise<ApiResponse<Event>> {
    return this.request<ApiResponse<Event>>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    return this.request<ApiResponse<Event>>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/events/${id}`, { method: 'DELETE' });
  }

  // --- Tasks ---
  async getTasks(params?: QueryParams): Promise<PaginatedResponse<Task>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Task>>(`/tasks?${query}`);
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>(`/tasks/${id}`);
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<ApiResponse<Task>>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/tasks/${id}`, { method: 'DELETE' });
  }

  // --- Notifications ---
  async getNotifications(params?: QueryParams): Promise<PaginatedResponse<Notification>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Notification>>(`/notifications?${query}`);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request<ApiResponse<Notification>>(`/notifications/${id}/read`, { method: 'POST' });
  }
}
