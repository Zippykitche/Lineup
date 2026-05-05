import { useApp } from '../context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { Notification } from '../types';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router';

interface NotificationDetailsDialogProps {
  notification: Notification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDetailsDialog({
  notification,
  open,
  onOpenChange,
}: NotificationDetailsDialogProps) {
  const navigate = useNavigate();
  const { markNotificationAsRead } = useApp();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="w-10 h-10 text-blue-600" />;
      case 'task':
        return <CheckSquare className="w-10 h-10 text-green-600" />;
      case 'reminder':
        return <Clock className="w-10 h-10 text-orange-600" />;
      default:
        return <Calendar className="w-10 h-10 text-gray-600" />;
    }
  };

  const handleAction = () => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    onOpenChange(false);

    if (notification.targetType === 'event') {
      navigate('/calendar'); // Ideally we'd open the specific event, but this is a good start
    } else if (notification.targetType === 'task') {
      navigate('/tasks');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-50 rounded-full">
              {getNotificationIcon(notification.type)}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Notification Details</DialogTitle>
          <DialogDescription className="text-center">
            {format(parseISO(notification.createdAt), 'MMMM d, yyyy h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-800 leading-relaxed">
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              Type: {notification.type}
            </Badge>
            {notification.read ? (
              <Badge variant="secondary">Read</Badge>
            ) : (
              <Badge className="bg-blue-600">Unread</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {notification.targetId && (
            <Button onClick={handleAction} className="w-full">
              View Linked {notification.targetType === 'event' ? 'Event' : 'Task'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
