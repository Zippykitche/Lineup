import { User, Event, Task, Notification } from '../app/types';
import { mockUsers, mockEvents, mockTasks, mockNotifications } from '../app/data/mockData';

/**
 * Mock Database State
 * This simulates a database in memory for the mock adapter.
 */
class MockDatabase {
  users: User[] = [...mockUsers];
  events: Event[] = [...mockEvents];
  tasks: Task[] = [...mockTasks];
  notifications: Notification[] = [...mockNotifications];

  // Helper to simulate persistent storage in local storage if needed
  // For now, it's just in-memory.
}

export const mockDb = new MockDatabase();
