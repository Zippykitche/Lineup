import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, CheckSquare, Bell, Users } from 'lucide-react';
import { CreateEventDialog } from '../components/CreateEventDialog';
import { CreateTaskDialog } from '../components/CreateTaskDialog';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export function DashboardPage() {
  const { currentUser, events, tasks, notifications, users } = useApp();
  const navigate = useNavigate();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEditor = currentUser?.role === 'editor';
  const isAssignee = currentUser?.role === 'assignee';

  const canCreateEvent = isSuperAdmin || isEditor;
  const canCreateTask = isSuperAdmin || isEditor;

  const todaysMeetings = events.filter((event) => {
    if (isAssignee && !event.attendeeIds.includes(currentUser?.id || '')) {
      return false;
    }
    return isToday(parseISO(event.date));
  });

  const upcomingDeadlines = tasks
    .filter((task) => {
      if (isAssignee && task.assigneeId !== currentUser?.id) {
        return false;
      }

      const dueDate = parseISO(task.dueDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      return dueDate >= today && dueDate <= nextWeek && task.status !== 'Completed';
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const unreadNotifications = notifications
    .filter((n) => n.userId === currentUser?.id && !n.read)
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || 'Unknown';
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isEditor) return 'Editor';
    return 'Assignee';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Welcome back, {currentUser?.fullName?.split(' ')[0]}!
        </h2>
        <p className="text-gray-600 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} • {getRoleLabel()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {canCreateEvent && (
          <Button
            onClick={() => setShowCreateEvent(true)}
            className="h-auto py-4 justify-start"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Create Event</p>
                <p className="text-xs text-gray-600">Plan editorial coverage</p>
              </div>
            </div>
          </Button>
        )}

        {canCreateTask && (
          <Button
            onClick={() => setShowCreateTask(true)}
            className="h-auto py-4 justify-start"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Assign Task</p>
                <p className="text-xs text-gray-600">Create a deliverable</p>
              </div>
            </div>
          </Button>
        )}

        <Button
          onClick={() => navigate('/calendar')}
          className="h-auto py-4 justify-start"
          variant="outline"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">View Calendar</p>
              <p className="text-xs text-gray-600">See team schedule</p>
            </div>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/team')}
          className="h-auto py-4 justify-start"
          variant="outline"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">{isSuperAdmin ? 'Manage Users' : 'View Team'}</p>
              <p className="text-xs text-gray-600">
                {isSuperAdmin ? 'See all user accounts' : 'Browse members'}
              </p>
            </div>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today&apos;s Editorial Events
            </CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysMeetings.length === 0 ? (
              <p className="text-sm text-gray-600">No events scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todaysMeetings.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/calendar')}
                  >
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.startTime} - {event.endTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Upcoming Deliverables
            </CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-gray-600">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{task.title}</p>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <span>
                        Due:{' '}
                        {isTomorrow(parseISO(task.dueDate))
                          ? 'Tomorrow'
                          : format(parseISO(task.dueDate), 'MMM d')}
                      </span>
                      <span>•</span>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isAssignee
                        ? `Assigned by: ${getUserName(task.createdBy)}`
                        : `Assigned to: ${getUserName(task.assigneeId)}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Latest updates and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {unreadNotifications.length === 0 ? (
              <p className="text-sm text-gray-600">No unread notifications</p>
            ) : (
              <div className="space-y-2">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={() => navigate('/notifications')}
                  >
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {format(parseISO(notification.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(isSuperAdmin || isEditor) && (
        <>
          <CreateEventDialog open={showCreateEvent} onOpenChange={setShowCreateEvent} />
          <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
        </>
      )}
    </div>
  );
}