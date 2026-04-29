import { User, Event, Task, Notification, Role } from '../app/types';

export type ApiMode = 'rest' | 'firebase';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}
