import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Event, Task, Notification } from "../types";
import {
  mockUsers,
  mockEvents,
  mockTasks,
  mockNotifications,
} from "../data/mockData";

interface AppContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  tasks: Task[];
  notifications: Notification[];
  register: (newUser: User) => void;
  login: (email: string, role?: string) => boolean;
  logout: () => void;
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "read">
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(() => {
  const storedEvents = localStorage.getItem('kbc-events');
  return storedEvents ? JSON.parse(storedEvents) : mockEvents;
});

const [tasks, setTasks] = useState<Task[]>(() => {
  const storedTasks = localStorage.getItem('kbc-tasks');
  return storedTasks ? JSON.parse(storedTasks) : mockTasks;
});

const [notifications, setNotifications] = useState<Notification[]>(() => {
  const storedNotifications = localStorage.getItem('kbc-notifications');
  return storedNotifications ? JSON.parse(storedNotifications) : mockNotifications;
});
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem("kbc-users");
    return storedUsers ? JSON.parse(storedUsers) : mockUsers;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("kbc-current-user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kbc-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
  localStorage.setItem('kbc-events', JSON.stringify(events));
}, [events]);

useEffect(() => {
  localStorage.setItem('kbc-tasks', JSON.stringify(tasks));
}, [tasks]);

useEffect(() => {
  localStorage.setItem('kbc-notifications', JSON.stringify(notifications));
}, [notifications]);

  const register = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const login = (email: string, role?: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
      (u) => u.workEmail.trim().toLowerCase() === normalizedEmail
    );

    if (!user) return false;

    if (role && user.role !== role) {
      return false;
    }

    setCurrentUser(user);
    localStorage.setItem("kbc-current-user", JSON.stringify(user));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kbc-current-user");
  };

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: `e${Date.now()}`,
    };

    setEvents((prev) => [...prev, newEvent]);

    event.attendeeIds.forEach((userId) => {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });

      addNotification({
        userId,
        message: `You were added to an event on ${formattedDate} at ${event.startTime}: ${event.title}`,
        type: "meeting",
      });
    });
  };

  const updateEvent = (id: string, eventUpdate: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...eventUpdate } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: `t${Date.now()}`,
    };

    setTasks((prev) => [...prev, newTask]);

    addNotification({
      userId: task.assigneeId,
      message: `You were assigned a new task: ${task.title}`,
      type: "task",
    });
  };

  const updateTask = (id: string, taskUpdate: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...taskUpdate } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "createdAt" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        events,
        tasks,
        notifications,
        register,
        login,
        logout,
        addEvent,
        updateEvent,
        deleteEvent,
        addTask,
        updateTask,
        deleteTask,
        markNotificationAsRead,
        addNotification,
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