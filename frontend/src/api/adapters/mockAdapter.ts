import { IApiAdapter } from './apiAdapter';
import { User, Event, Task, Notification } from '../../app/types';
import { ApiResponse, PaginatedResponse, QueryParams, AuthResponse, AppError } from '../types';
import { mockDb } from '../data/mockDb';

const DELAY = 800; // Simulated network delay in ms

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAdapter implements IApiAdapter {
  // --- Auth ---
  async login(email: string, password: string): Promise<AuthResponse> {
    await sleep(DELAY);
    const user = mockDb.users.find(u => u.workEmail === email);
    if (!user) {
      throw new AppError('Invalid credentials', 'AUTH_ERROR', 401);
    }
    return {
      user,
      token: 'fake-jwt-token-' + Math.random().toString(36).substring(7),
      refreshToken: 'fake-refresh-token-' + Math.random().toString(36).substring(7),
    };
  }

  async logout(): Promise<void> {
    await sleep(DELAY / 2);
  }

  async getCurrentUser(): Promise<User | null> {
    await sleep(DELAY / 2);
    return mockDb.users[0]; // Simulate being logged in as the first user
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    await sleep(DELAY);
    return {
      user: mockDb.users[0],
      token: 'new-fake-jwt-token',
      refreshToken: 'new-fake-refresh-token',
    };
  }

  // --- Users ---
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    await sleep(DELAY);
    let data = [...mockDb.users];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      data = data.filter(u => u.fullName.toLowerCase().includes(s) || u.workEmail.toLowerCase().includes(s));
    }

    return this.paginate(data, params);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    await sleep(DELAY);
    const user = mockDb.users.find(u => u.id === id);
    if (!user) throw new AppError('User not found', 'NOT_FOUND', 404);
    return { data: user, status: 200 };
  }

  // --- Events ---
  async getEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    await sleep(DELAY);
    let data = [...mockDb.events];

    if (params?.search) {
      const s = params.search.toLowerCase();
      data = data.filter(e => e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s));
    }

    if (params?.status) {
      data = data.filter(e => e.status === params.status);
    }

    return this.paginate(data, params);
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    await sleep(DELAY);
    const event = mockDb.events.find(e => e.id === id);
    if (!event) throw new AppError('Event not found', 'NOT_FOUND', 404);
    return { data: event, status: 200 };
  }

  async createEvent(event: Partial<Event>): Promise<ApiResponse<Event>> {
    await sleep(DELAY);
    const newEvent: Event = {
      id: Math.random().toString(36).substring(7),
      title: event.title || 'Untitled Event',
      date: event.date || new Date().toISOString().split('T')[0],
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      description: event.description || '',
      attendeeIds: event.attendeeIds || [],
      createdBy: event.createdBy || '1',
      status: event.status || 'Planned',
      outputType: event.outputType || 'Web',
    };
    mockDb.events.unshift(newEvent);
    return { data: newEvent, status: 201 };
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    await sleep(DELAY);
    const index = mockDb.events.findIndex(e => e.id === id);
    if (index === -1) throw new AppError('Event not found', 'NOT_FOUND', 404);
    
    mockDb.events[index] = { ...mockDb.events[index], ...event };
    return { data: mockDb.events[index], status: 200 };
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    await sleep(DELAY);
    mockDb.events = mockDb.events.filter(e => e.id !== id);
    return { data: undefined, status: 204 };
  }

  // --- Tasks ---
  async getTasks(params?: QueryParams): Promise<PaginatedResponse<Task>> {
    await sleep(DELAY);
    let data = [...mockDb.tasks];
    
    if (params?.assigneeId) {
      data = data.filter(t => t.assigneeId === params.assigneeId);
    }

    return this.paginate(data, params);
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    await sleep(DELAY);
    const task = mockDb.tasks.find(t => t.id === id);
    if (!task) throw new AppError('Task not found', 'NOT_FOUND', 404);
    return { data: task, status: 200 };
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    await sleep(DELAY);
    const newTask: Task = {
      id: Math.random().toString(36).substring(7),
      title: task.title || 'New Task',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      assigneeId: task.assigneeId || '1',
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      createdBy: task.createdBy || '1',
      description: task.description || '',
    };
    mockDb.tasks.unshift(newTask);
    return { data: newTask, status: 201 };
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    await sleep(DELAY);
    const index = mockDb.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new AppError('Task not found', 'NOT_FOUND', 404);
    
    mockDb.tasks[index] = { ...mockDb.tasks[index], ...task };
    return { data: mockDb.tasks[index], status: 200 };
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    await sleep(DELAY);
    mockDb.tasks = mockDb.tasks.filter(t => t.id !== id);
    return { data: undefined, status: 204 };
  }

  // --- Notifications ---
  async getNotifications(params?: QueryParams): Promise<PaginatedResponse<Notification>> {
    await sleep(DELAY / 2);
    let data = [...mockDb.notifications];
    return this.paginate(data, params);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    await sleep(DELAY / 4);
    const index = mockDb.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new AppError('Notification not found', 'NOT_FOUND', 404);
    mockDb.notifications[index].read = true;
    return { data: mockDb.notifications[index], status: 200 };
  }

  async getMyTasks(params?: QueryParams): Promise<PaginatedResponse<Task>> {
  await sleep(DELAY);

  // Mock current logged-in user
  const currentUser = mockDb.users[0];

  let data = mockDb.tasks.filter(
    (task) => task.assigneeId === currentUser.id
  );

  if (params?.status) {
    data = data.filter((task) => task.status === params.status);
  }

  return this.paginate(data, params);
}

async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
  await sleep(DELAY / 4);

  mockDb.notifications = mockDb.notifications.map((notification) => ({
    ...notification,
    read: true,
  }));

  return { data: undefined, status: 200 };
}

async deleteNotification(id: string): Promise<ApiResponse<void>> {
  await sleep(DELAY / 4);

  mockDb.notifications = mockDb.notifications.filter(
    (notification) => notification.id !== id
  );

  return { data: undefined, status: 204 };
}

  // --- Helper ---
  private paginate<T>(data: T[], params?: QueryParams): PaginatedResponse<T> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    const totalPages = Math.ceil(data.length / limit);

    return {
      data: paginatedData,
      total: data.length,
      page,
      limit,
      totalPages,
      status: 200,
    };
  }
}
