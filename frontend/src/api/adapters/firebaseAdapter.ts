import { IApiAdapter } from './apiAdapter';
import { User, Event, Task, Notification, Role } from '../../app/types';
import { ApiResponse, PaginatedResponse, QueryParams, AuthResponse, AppError } from '../types';
import { auth } from '../config/firebaseClient';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

/**
 * Firebase Adapter
 * Implements Firebase Authentication and Firestore integration.
 */
export class FirebaseAdapter implements IApiAdapter {
  constructor(config: any) {
    // Firebase is already initialized in firebaseClient.ts
    console.log('Firebase Adapter initialized');
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      return {
        user: {
          id: userCredential.user.uid,
          fullName: userCredential.user.displayName || '',
          workEmail: userCredential.user.email || '',
          role: 'assignee' as const, // Default role, will be updated by backend
          department: '',
          phone: '',
        },
        token,
        refreshToken: '', // Firebase handles refresh internally
      };
    } catch (error: any) {
      throw new AppError(error.message || 'Login failed', 'AUTH_ERROR', 401);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new AppError(error.message || 'Logout failed', 'AUTH_ERROR', 500);
    }
  }

  async register(user: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
    if (!user.password) {
      throw new AppError('Password is required for registration', 'VALIDATION_ERROR', 400);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.workEmail!, user.password);
      const token = await userCredential.user.getIdToken();

      const newUser: User = {
        id: userCredential.user.uid,
        fullName: user.fullName || userCredential.user.displayName || '',
        workEmail: userCredential.user.email || '',
        role: 'assignee' as const,
        department: user.department || '',
        phone: user.phone || '',
      };

      return {
        data: newUser,
        message: 'User registered successfully',
        status: 201,
      };
    } catch (error: any) {
      throw new AppError(error.message || 'Registration failed', 'AUTH_ERROR', 400);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      // Get Firebase ID token
      const token = await currentUser.getIdToken();

      // Call backend /auth/me to get full user profile with role
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch user profile from backend');
        // Fallback to basic Firebase user info
        return {
          id: currentUser.uid,
          fullName: currentUser.displayName || '',
          workEmail: currentUser.email || '',
          role: 'assignee' as const,
          department: '',
          phone: '',
        };
      }

      const data = await response.json();
      return {
        id: data.data.id || currentUser.uid,
        fullName: data.data.fullName || currentUser.displayName || '',
        workEmail: data.data.workEmail || currentUser.email || '',
        role: (data.data.role as Role) || 'assignee',
        department: data.data.department || '',
        phone: data.data.phone || '',
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    // Firebase handles token refresh automatically
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new AppError('No user logged in', 'AUTH_ERROR', 401);
    }

    const newToken = await currentUser.getIdToken(true); // Force refresh

    return {
      user: {
        id: currentUser.uid,
        fullName: currentUser.displayName || '',
        workEmail: currentUser.email || '',
        role: 'assignee' as const,
        department: '',
        phone: '',
      },
      token: newToken,
      refreshToken: '',
    };
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        data: undefined,
        message: 'Password reset email sent',
        status: 200,
      };
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to send password reset email', 'AUTH_ERROR', 400);
    }
  }

  // Users - These would need Firestore implementation
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    throw new AppError('Firebase getUsers not implemented - use REST adapter for user management', 'NOT_IMPLEMENTED', 501);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    throw new AppError('Firebase getUserById not implemented - use REST adapter for user management', 'NOT_IMPLEMENTED', 501);
  }

  // Events
  async getEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    throw new AppError('Firebase getEvents not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    throw new AppError('Firebase getEventById not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async createEvent(event: Partial<Event>): Promise<ApiResponse<Event>> {
    throw new AppError('Firebase createEvent not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    throw new AppError('Firebase updateEvent not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    throw new AppError('Firebase deleteEvent not implemented', 'NOT_IMPLEMENTED', 501);
  }

  // Tasks
  async getTasks(params?: QueryParams): Promise<PaginatedResponse<Task>> {
    throw new AppError('Firebase getTasks not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    throw new AppError('Firebase getTaskById not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async getMyTasks(params?: QueryParams): Promise<PaginatedResponse<Task>> {
    throw new AppError('Firebase getMyTasks not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    throw new AppError('Firebase createTask not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    throw new AppError('Firebase updateTask not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    throw new AppError('Firebase deleteTask not implemented', 'NOT_IMPLEMENTED', 501);
  }

  // Notifications
  async getNotifications(params?: QueryParams): Promise<PaginatedResponse<Notification>> {
    throw new AppError('Firebase getNotifications not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    throw new AppError('Firebase markNotificationAsRead not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    throw new AppError('Firebase markAllNotificationsAsRead not implemented', 'NOT_IMPLEMENTED', 501);
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    throw new AppError('Firebase deleteNotification not implemented', 'NOT_IMPLEMENTED', 501);
  }
}
