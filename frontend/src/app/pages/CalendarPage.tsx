import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CreateEventDialog } from '../components/CreateEventDialog';
import { EventDetailsDialog } from '../components/EventDetailsDialog';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
} from 'date-fns';
import { Badge } from '../components/ui/badge';
import { Event, EventStatus } from '../types';

export function CalendarPage() {
  const { currentUser, events, users } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [todayView, setTodayView] = useState<'all' | 'am'>('all');

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEditor = currentUser?.role === 'editor';
  const isAssignee = currentUser?.role === 'assignee';
  const canCreateEvent = isSuperAdmin || isEditor;

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

  const userEvents = events;

  const getEventsForDate = (date: Date) => {
    return userEvents.filter((event) => isSameDay(parseISO(event.date), date));
  };

  const getCreatorName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || 'Unknown';
  };

  const todayEvents = userEvents.filter((event) =>
    isSameDay(parseISO(event.date), new Date())
  );

  const amTodayEvents = todayEvents.filter((event) => {
    const [hour, minute] = event.startTime.split(':').map(Number);
    return hour < 12 || (hour === 12 && minute === 0);
  });

  const sidebarTodayEvents = todayView === 'am' ? amTodayEvents : todayEvents;

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayEvents = getEventsForDate(currentDay);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isToday = isSameDay(currentDay, new Date());

        days.push(
          <div
            key={currentDay.toString()}
            className={`min-h-40 border p-2 cursor-pointer ${
              isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
            } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => {
              setSelectedDay(currentDay);
              setView('day');
            }}
          >
            <div
              className={`text-sm mb-2 ${isToday ? 'font-bold text-blue-600' : 'text-gray-600'}`}
            >
              {format(currentDay, 'd')}
            </div>

            <div className="space-y-1 max-h-24 overflow-y-auto">
              {dayEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded cursor-pointer hover:bg-gray-100 border ${
                    dayEvents.length > 4 ? 'py-0.5 px-1' : 'p-1.5'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                  style={{
                    backgroundColor: event.priority === 'urgent' ? '#fee2e2' :
                                   event.priority === 'high' ? '#fef3c7' :
                                   event.priority === 'medium' ? '#dbeafe' : '#f3f4f6',
                    borderColor: event.priority === 'urgent' ? '#fca5a5' :
                                event.priority === 'high' ? '#fcd34d' :
                                event.priority === 'medium' ? '#93c5fd' : '#d1d5db'
                  }}
                >
                  <div className={`font-medium truncate ${dayEvents.length > 4 ? 'text-[10px]' : 'text-xs'}`}>
                    {event.title}
                  </div>
                  <div className={`text-gray-600 ${dayEvents.length > 4 ? 'text-[9px]' : 'text-[10px]'}`}>
                    {event.startTime}
                  </div>
                  {dayEvents.length <= 4 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-[9px]">
                        {event.outputType}
                      </Badge>
                      <Badge className={`text-[9px] ${getEventStatusColor(event.status)}`}>
                        {event.status}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div>
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div key={dayName} className="p-2 text-center font-medium text-sm text-gray-600">
              {dayName}
            </div>
          ))}
        </div>
        <div className="border">{rows}</div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);

    const days = [];
    let day = weekStart;

    while (day <= weekEnd) {
      const currentDay = day;
      const dayEvents = getEventsForDate(currentDay);
      const isToday = isSameDay(currentDay, new Date());

      days.push(
        <div
          key={currentDay.toString()}
          className={`min-h-48 border p-3 ${isToday ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div
            className={`text-sm mb-3 font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}
          >
            {format(currentDay, 'EEE d')}
          </div>

          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="text-xs p-2 rounded cursor-pointer hover:bg-gray-100 border bg-white"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-[10px] text-gray-600">{event.startTime} - {event.endTime}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-[9px]">
                    {event.outputType}
                  </Badge>
                  <Badge className={`text-[9px] ${getEventStatusColor(event.status)}`}>
                    {event.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    return (
      <div>
        <div className="grid grid-cols-7">{days}</div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = selectedDay ? getEventsForDate(selectedDay) : [];

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a day'}
          </h3>
        </div>

        {dayEvents.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-gray-600">
            No events scheduled for this day.
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {event.outputType}
                      </Badge>
                      <Badge className={getEventStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {event.startTime} - {event.endTime}
                    </p>

                    {event.description && (
                      <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      Created by {getCreatorName(event.createdBy)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    const sortedEvents = [...userEvents].sort(
      (a, b) =>
        new Date(`${a.date}T${a.startTime}`).getTime() -
        new Date(`${b.date}T${b.startTime}`).getTime()
    );

    return (
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-gray-600">
            No scheduled events found.
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 bg-white hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{event.title}</h4>

                    <Badge variant="outline" className="text-[10px]">
                      {event.outputType}
                    </Badge>

                    <Badge className={getEventStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')} • {event.startTime} -{' '}
                    {event.endTime}
                  </p>

                  {event.description && (
                    <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Created by {getCreatorName(event.createdBy)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, -1));
      if (selectedDay) setSelectedDay(addDays(selectedDay, -1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
      if (selectedDay) setSelectedDay(addDays(selectedDay, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex gap-6">
      {/* Main Calendar */}
      <div className="flex-1 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>{isAssignee ? 'My Calendar' : 'Editorial Calendar'}</CardTitle>

              {canCreateEvent && (
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {(view === 'month' || view === 'week' || view === 'day') && (
                  <>
                    <Button variant="outline" size="sm" onClick={handlePrevious}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNext}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                <h3 className="text-lg font-semibold ml-2">
                  {view === 'month'
                    ? format(currentDate, 'MMMM yyyy')
                    : view === 'week'
                    ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
                    : view === 'day'
                    ? (selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : format(currentDate, 'EEEE, MMMM d, yyyy'))
                    : 'All Scheduled Events'}
                </h3>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={view === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('month')}
                >
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('week')}
                >
                  Week
                </Button>
                <Button
                  variant={view === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('day')}
                >
                  Day
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                >
                  List
                </Button>
              </div>
            </div>

            <div>
              {view === 'month'
                ? renderMonthView()
                : view === 'week'
                ? renderWeekView()
                : view === 'day'
                ? renderDayView()
                : renderListView()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        {/* Today's Events */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Today&apos;s Events</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Show today&apos;s schedule or only AM events.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={todayView === 'all' ? 'default' : 'outline'}
                onClick={() => setTodayView('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={todayView === 'am' ? 'default' : 'outline'}
                onClick={() => setTodayView('am')}
              >
                AM Events
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sidebarTodayEvents
                .sort((a, b) => {
                  const timeA = a.startTime.split(':').map(Number);
                  const timeB = b.startTime.split(':').map(Number);
                  return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
                })
                .map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="outline" className="text-[9px]">
                        {event.outputType}
                      </Badge>
                      <Badge className={`text-[9px] ${getEventStatusColor(event.status)}`}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              {sidebarTodayEvents.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  {todayView === 'am' ? 'No AM events today' : 'No events today'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userEvents
                .filter(event => startOfDay(parseISO(event.date)) > startOfDay(new Date()))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 10)
                .map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {format(parseISO(event.date), 'MMM d')} • {event.startTime}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="outline" className="text-[9px]">
                        {event.outputType}
                      </Badge>
                      <Badge className={`text-[9px] ${getEventStatusColor(event.status)}`}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              {userEvents.filter(event => startOfDay(parseISO(event.date)) > startOfDay(new Date())).length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  No upcoming events
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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