import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EditEventForm } from './EditEventForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar, Clock, Users, User, Trash2 } from 'lucide-react';
import { Event, EventStatus } from '../types';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface EventDetailsDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({
  event,
  open,
  onOpenChange,
}: EventDetailsDialogProps) {
  const { currentUser, users, deleteEvent, updateEvent } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<EventStatus>(event.status);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEditor = currentUser?.role === 'editor';
  const canUpdateEventStatus = isSuperAdmin || isEditor;

  const attendees = users.filter((user) => event.attendeeIds.includes(user.id));
  const creator = users.find((user) => user.id === event.createdBy);

  const getEventStatusColor = (value: EventStatus) => {
    switch (value) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = () => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admin can delete events');
      return;
    }

    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id);
      toast.success('Event deleted successfully');
      onOpenChange(false);
    }
  };

  const handleStatusChange = (newStatus: EventStatus) => {
    setStatus(newStatus);
    updateEvent(event.id, { status: newStatus });
    toast.success('Event status updated');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription>
            Event details and assigned team members
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
          {isEditing ? (
            <EditEventForm
              event={event}
              onClose={() => setIsEditing(false)}
              onSave={() => {
                setIsEditing(false);
                onOpenChange(false);
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{event.outputType}</Badge>
                <Badge className={getEventStatusColor(status)}>{status}</Badge>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <span>{format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5" />
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>

              {event.description && (
                <div className="pt-2">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}

              {canUpdateEventStatus && (
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Update Event Status</h4>
                  <Select
                    value={status}
                    onValueChange={(v) => handleStatusChange(v as EventStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-2">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Attendees ({attendees.length})
                </h4>

                <div className="space-y-2">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center gap-3 p-2 border rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium">{attendee.fullName}</p>
                        <p className="text-sm text-gray-600">{attendee.workEmail}</p>
                      </div>

                      <Badge variant="outline" className="capitalize">
                        {attendee.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {creator && (
                <div className="pt-2 text-sm text-gray-600">
                  Created by: {creator.fullName}
                </div>
              )}

              <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end gap-2">
                {isSuperAdmin && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Event
                  </Button>
                )}

                {isSuperAdmin && (
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                )}

                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}