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
      const [usersRes, eventsRes, tasksRes, notifsRes] = await Promise.all([
        api.getUsers(),
        api.getEvents(),
        currentUser.role === 'assignee' ? api.getMyTasks() : api.getTasks(),
        api.getNotifications()
      ]);

      setUsers(usersRes.data);
      setEvents(eventsRes.data);
      setTasks(tasksRes.data);
      setNotifications(notifsRes.data);
    } catch (error) {
      console.error("Failed to refresh data:", error);
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