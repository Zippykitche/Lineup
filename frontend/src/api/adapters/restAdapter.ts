import { IApiAdapter } from './apiAdapter';
import { User, Event, Task, Notification } from '../../app/types';
import { ApiResponse, PaginatedResponse, QueryParams, AuthResponse, AppError } from '../types';

/**
 * REST API Adapter
 * Implementation for a standard RESTful backend.
 * Uses fetch to communicate with the server and performs field mapping.
 */
export class RestAdapter implements IApiAdapter {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
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

    const json = await response.json();
    
    // Normalize response: ensure it always has a 'data' property
    if (json && typeof json === 'object' && 'data' in json) {
      return json as ApiResponse<T>;
    } else {
      return { data: json as T, status: response.status };
    }
  }

  private mapUser(user: any): User {
    if (!user) return {} as User;
    return {
      id: user.uid || user.id,
      fullName: user.full_name || user.fullName || user.displayName,
      workEmail: user.email || user.workEmail,
      role: user.role,
      department: user.department || 'General',
      phone: user.phone || '',
      photoUrl: user.photo_url || user.photoUrl,
    };
  }

  private mapEvent(event: any): Event {
    if (!event) return {} as Event;
    return {
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.start_time || event.startTime || '09:00',
      endTime: event.end_time || event.endTime || '10:00',
      description: event.description,
      attendeeIds: event.assignees || event.attendeeIds || [],
      createdBy: event.created_by || event.createdBy,
      status: event.status,
      outputType: (event.output_type || event.outputType || 'TV').split(' ')[0] as any,
    };
  }

  private mapTask(task: any): Task {
    if (!task) return {} as Task;
    return {
      id: task.id,
      title: task.title,
      dueDate: task.due_date || task.dueDate,
      assigneeId: task.assignee_id || task.assigneeId,
      status: task.status,
      priority: task.priority,
      createdBy: task.created_by || task.createdBy,
      description: task.description,
    };
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<AuthResponse> {
    throw new AppError('Login should be handled by Firebase Auth adapter', 'NOT_SUPPORTED', 501);
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  async register(user: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
    const response = await this.request<any>('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify({
        email: user.workEmail,
        password: user.password || 'password123',
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        phone: user.phone,
      }),
    });
    return {
      ...response,
      data: this.mapUser(response.data)
    };
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await this.request<any>('/auth/me');
      return this.mapUser(response.data);
    } catch (error) {
      return null;
    }
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    throw new Error('Not implemented');
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // --- Users ---
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.request<any>('/auth/users?' + query);
    
    const data = response.data.data || response.data;
    const users = Array.isArray(data) ? data.map(u => this.mapUser(u)) : [];

    return {
      data: users,
      total: response.data.total || users.length,
      page: response.data.page || 1,
      limit: response.data.limit || users.length,
      totalPages: response.data.totalPages || 1,
      status: response.status
    };
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await this.request<any>(`/users/${id}`);
    return {
      ...response,
      data: this.mapUser(response.data)
    };
  }

  // --- Events ---
  async getEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.request<any>('/events?' + query);
    
    const data = response.data.data || response.data;
    const events = Array.isArray(data) ? data.map(e => this.mapEvent(e)) : [];

    return {
      data: events,
      total: response.data.total || events.length,
      page: response.data.page || 1,
      limit: response.data.limit || events.length,
      totalPages: response.data.totalPages || 1,
      status: response.status
    };
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    const response = await this.request<any>(`/events/${id}`);
    return {
      ...response,
      data: this.mapEvent(response.data)
    };
  }

  async createEvent(event: Partial<Event>): Promise<ApiResponse<Event>> {
    const backendEvent = {
      title: event.title,
      date: event.date,
      description: event.description,
      output_type: event.outputType === 'TV' ? 'TV Package' : 
                   event.outputType === 'Radio' ? 'Radio Script' :
                   event.outputType === 'Social' ? 'Social Graphic' : 'Web Article',
      assignees: event.attendeeIds,
      start_time: event.startTime,
      end_time: event.endTime,
    };

    const response = await this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(backendEvent),
    });
    return {
      ...response,
      data: this.mapEvent(response.data)
    };
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    const response = await this.request<any>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(event),
    });
    return {
      ...response,
      data: this.mapEvent(response.data)
    };
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/events/${id}`, { method: 'DELETE' });
  }

  // --- Tasks ---
  async getTasks(params?: QueryParams): Promise<PaginatedResponse<Task>> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.request<any>('/tasks?' + query);
    
    const data = response.data.data || response.data;
    const tasks = Array.isArray(data) ? data.map(t => this.mapTask(t)) : [];

    return {
      data: tasks,
      total: response.data.total || tasks.length,
      page: response.data.page || 1,
      limit: response.data.limit || tasks.length,
      totalPages: response.data.totalPages || 1,
      status: response.status
    };
  }

  async getMyTasks(params?: QueryParams): Promise<PaginatedResponse<Task>> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.request<any>('/tasks/my-tasks?' + query);
    
    const data = response.data.data || response.data;
    const tasks = Array.isArray(data) ? data.map(t => this.mapTask(t)) : [];

    return {
      data: tasks,
      total: response.data.total || tasks.length,
      page: response.data.page || 1,
      limit: response.data.limit || tasks.length,
      totalPages: response.data.totalPages || 1,
      status: response.status
    };
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    const response = await this.request<any>(`/tasks/${id}`);
    return {
      ...response,
      data: this.mapTask(response.data)
    };
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    const response = await this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return {
      ...response,
      data: this.mapTask(response.data)
    };
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    const response = await this.request<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    });
    return {
      ...response,
      data: this.mapTask(response.data)
    };
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${id}`, { method: 'DELETE' });
  }

  // --- Notifications ---
  async getNotifications(params?: QueryParams): Promise<PaginatedResponse<Notification>> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.request<any>('/notifications?' + query);
    
    const data = response.data.data || response.data;
    const notifications = Array.isArray(data) ? data : [];

    return {
      data: notifications,
      total: response.data.total || notifications.length,
      page: response.data.page || 1,
      limit: response.data.limit || notifications.length,
      totalPages: response.data.totalPages || 1,
      status: response.status
    };
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.request<void>('/notifications/read-all', { method: 'PATCH' });
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${id}`, { method: 'DELETE' });
  }
}
