import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Mail, Phone, Briefcase, UserCircle, Calendar, CheckSquare } from 'lucide-react';

export function ProfilePage() {
  const { currentUser, tasks, events, users } = useApp();

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatRole = (role: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'editor') return 'Editor';
    return 'Assignee';
  };

  const myTasks =
    currentUser.role === 'assignee'
      ? tasks.filter((t) => t.assigneeId === currentUser.id)
      : tasks.filter((t) => t.createdBy === currentUser.id);

  const myEvents =
    currentUser.role === 'assignee'
      ? events.filter((e) => e.attendeeIds.includes(currentUser.id))
      : events.filter((e) => e.createdBy === currentUser.id);

  const activeTasks = myTasks.filter((t) => t.status !== 'Completed').length;
  const completedTasks = myTasks.filter((t) => t.status === 'Completed').length;
  const upcomingEvents = myEvents.filter((e) => new Date(e.date) >= new Date()).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-6 h-6" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback
                className={`text-2xl ${
                  currentUser.role === 'super_admin' ? 'bg-red-700' : 'bg-blue-600'
                } text-white`}
              >
                {getInitials(currentUser.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold">{currentUser.fullName}</h2>
                  <Badge
                    variant={currentUser.role === 'super_admin' ? 'default' : 'secondary'}
                  >
                    {formatRole(currentUser.role)}
                  </Badge>
                </div>
                <p className="text-gray-600">{currentUser.department}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Work Email</p>
                    <p className="text-sm">{currentUser.workEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">{currentUser.phone || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm">{currentUser.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <UserCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm">{formatRole(currentUser.role)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentUser.role === 'assignee' && (
        <Card>
          <CardHeader>
            <CardTitle>My Work Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Active Tasks</p>
                </div>
                <p className="text-2xl font-semibold text-blue-600">{activeTasks}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">Completed Tasks</p>
                </div>
                <p className="text-2xl font-semibold text-green-600">{completedTasks}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-900">Upcoming Events</p>
                </div>
                <p className="text-2xl font-semibold text-purple-600">{upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(currentUser.role === 'editor' || currentUser.role === 'super_admin') && (
        <Card>
          <CardHeader>
            <CardTitle>{currentUser.role === 'super_admin' ? 'System Overview' : 'Editor Overview'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Total Events</p>
                </div>
                <p className="text-2xl font-semibold text-blue-600">
                  {currentUser.role === 'super_admin' ? events.length : myEvents.length}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">Total Tasks</p>
                </div>
                <p className="text-2xl font-semibold text-green-600">
                  {currentUser.role === 'super_admin' ? tasks.length : myTasks.length}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-900">Upcoming Events</p>
                </div>
                <p className="text-2xl font-semibold text-purple-600">
                  {currentUser.role === 'super_admin'
                    ? events.filter((e) => new Date(e.date) >= new Date()).length
                    : upcomingEvents}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <UserCircle className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-medium text-orange-900">Users</p>
                </div>
                <p className="text-2xl font-semibold text-orange-600">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}