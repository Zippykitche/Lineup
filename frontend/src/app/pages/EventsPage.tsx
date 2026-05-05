import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Search, Calendar as CalendarIcon } from 'lucide-react';
import { CreateEventDialog } from '../components/CreateEventDialog';
import { EventDetailsDialog } from '../components/EventDetailsDialog';
import { Event, EventStatus, TaskPriority } from '../types';
import { format, parseISO } from 'date-fns';

export function EventsPage() {
  const { currentUser, events, users } = useApp();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEditor = currentUser?.role === 'editor';
  const isAssignee = currentUser?.role === 'assignee';
  const canCreateEvent = isSuperAdmin || isEditor;

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getEventStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'News':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sports':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Entertainment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Politics':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Business':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'General':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCreatorName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || 'Unknown';
  };

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              All Events
            </CardTitle>
            {canCreateEvent && (
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No events found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search term</p>
              </div>
            ) : (
              sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white gap-4"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {event.outputType}
                      </Badge>
                      <Badge className={getEventStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(event.category || 'General')}>
                        {event.category || 'General'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {format(parseISO(event.date), 'MMMM d, yyyy')}
                      </span>
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-gray-500 shrink-0">
                    <span>Created by</span>
                    <span className="font-medium text-gray-700">{getCreatorName(event.createdBy)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {canCreateEvent && (
        <CreateEventDialog open={showCreateEvent} onOpenChange={setShowCreateEvent} />
      )}

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
