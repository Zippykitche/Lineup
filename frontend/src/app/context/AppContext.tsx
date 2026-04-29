import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Event, Task, Notification } from "../types";
import { api } from "../../api";

interface AppContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  tasks: Task[];
  notifications: Notification[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (user: Partial<User> & { password?: string }) => Promise<boolean>;
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Use Promise.allSettled to ensure one failure doesn't block other data
      const results = await Promise.allSettled([
        api.getUsers(),
        api.getEvents(),
        currentUser.role === 'assignee' ? api.getMyTasks() : api.getTasks(),
        api.getNotifications()
      ]);

      if (results[0].status === 'fulfilled') setUsers(results[0].value.data);
      if (results[1].status === 'fulfilled') setEvents(results[1].value.data);
      if (results[2].status === 'fulfilled') setTasks(results[2].value.data);
      if (results[3].status === 'fulfilled') setNotifications(results[3].value.data);
      
      // Log failures for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const endpoints = ['users', 'events', 'tasks', 'notifications'];
          console.warn(`Failed to fetch ${endpoints[index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error("Critical failure during data refresh:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await api.getCurrentUser();
          if (user) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  const login = async (email: string, password = "password"): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.login(email, password);
      setCurrentUser(response.user);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    setEvents([]);
    setTasks([]);
    setNotifications([]);
  };

  const register = async (user: Partial<User> & { password?: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      await api.register(user);
      await refreshData();
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = async (event: Omit<Event, "id">) => {
    await api.createEvent(event);
    await refreshData();
  };

  const updateEvent = async (id: string, eventUpdate: Partial<Event>) => {
    await api.updateEvent(id, eventUpdate);
    await refreshData();
  };

  const deleteEvent = async (id: string) => {
    await api.deleteEvent(id);
    await refreshData();
  };

  const addTask = async (task: Omit<Task, "id">) => {
    await api.createTask(task);
    await refreshData();
  };

  const updateTask = async (id: string, taskUpdate: Partial<Task>) => {
    await api.updateTask(id, taskUpdate);
    await refreshData();
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    await refreshData();
  };

  const markNotificationAsRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = async () => {
    await api.markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        events,
        tasks,
        notifications,
        isLoading,
        login,
        logout,
        register,
        addEvent,
        updateEvent,
        deleteEvent,
        addTask,
        updateTask,
        deleteTask,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}