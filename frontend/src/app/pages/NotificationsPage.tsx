import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bell, Calendar, CheckSquare, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function NotificationsPage() {
  const { currentUser, notifications, markNotificationAsRead } = useApp();

  const userNotifications = notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadNotifications = userNotifications.filter((n) => !n.read);
  const readNotifications = userNotifications.filter((n) => n.read);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach((n) => markNotificationAsRead(n.id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-green-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderNotification = (notification: any, isUnread: boolean) => (
    <div
      key={notification.id}
      className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
        isUnread ? 'bg-blue-50 border-blue-200' : 'bg-white'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${isUnread ? 'font-medium' : 'text-gray-700'}`}>
              {notification.message}
            </p>
            {isUnread && <Badge className="bg-blue-600 shrink-0">New</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-gray-600">
              {format(parseISO(notification.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
            {isUnread && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notifications
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {unreadNotifications.length} unread notification
                {unreadNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
            {unreadNotifications.length > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Unread</h3>
              <div className="space-y-2">
                {unreadNotifications.map((notification) =>
                  renderNotification(notification, true)
                )}
              </div>
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                {unreadNotifications.length > 0 ? 'Read' : 'All Notifications'}
              </h3>
              <div className="space-y-2">
                {readNotifications.map((notification) => renderNotification(notification, false))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {userNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-1">
                You'll see updates about meetings and tasks here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
