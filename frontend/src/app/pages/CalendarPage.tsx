import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from 'lucide-react';
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
  parse,
  isValid,
} from 'date-fns';
import { Badge } from '../components/ui/badge';
import { Event, EventStatus } from '../types';
import { cn } from '../components/ui/utils';

export function CalendarPage() {
  const { currentUser, events, users } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [manualDateInput, setManualDateInput] = useState('');

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
      case 'Public Holiday':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'News':
        return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' };
      case 'Sports':
        return { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' };
      case 'Entertainment':
        return { bg: '#fef9c3', border: '#fef08a', text: '#854d0e' };
      case 'Politics':
        return { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' };
      case 'Business':
        return { bg: '#f3e8ff', border: '#e9d5ff', text: '#6b21a8' };
      case 'General':
        return { bg: '#e0f2fe', border: '#bae6fd', text: '#075985' };
      case 'Public Holiday':
        return { bg: '#ffedd5', border: '#fed7aa', text: '#9a3412' };
      default:
        return { bg: '#f3f4f6', border: '#e5e7eb', text: '#1f2937' };
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.date), date));
  };

  const getCreatorName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || 'Unknown';
  };

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
              {dayEvents.map((event) => {
                const colors = getCategoryStyles(event.category || 'General');
                return (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 border ${
                      dayEvents.length > 4 ? 'py-0.5 px-1' : 'p-1.5'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  >
                    <div className={`font-medium truncate ${dayEvents.length > 4 ? 'text-[10px]' : 'text-xs'}`}>
                      {event.title}
                    </div>
                  </div>
                );
              })}
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
            {dayEvents.map((event) => {
              const colors = getCategoryStyles(event.category || 'General');
              return (
                <div
                  key={event.id}
                  className="text-xs p-2 rounded cursor-pointer hover:opacity-80 border"
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-[9px] border-current opacity-70">
                      {event.outputType}
                    </Badge>
                    <Badge className={`text-[9px] ${getEventStatusColor(event.status)}`}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
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
    const currentDay = selectedDay ?? currentDate;
    const dayEvents = getEventsForDate(currentDay);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(currentDay, 'EEEE, MMMM d, yyyy')}
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
                      <Badge variant="outline" className={`text-[10px] ${getCategoryColor(event.category || 'General')}`}>
                        {event.category || 'General'}
                      </Badge>
                    </div>

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
    const today = new Date();
    setCurrentDate(today);
    if (view === 'day') {
      setSelectedDay(today);
    }
  };

  const handleJumpToDate = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      if (view === 'day') {
        setSelectedDay(date);
      }
      setDatePickerOpen(false);
    }
  };

  const handleManualDateJump = () => {
    if (manualDateInput.trim()) {
      // Try different date formats
      const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MMM dd, yyyy', 'MMMM dd, yyyy'];
      let parsedDate: Date | null = null;

      for (const fmt of formats) {
        parsedDate = parse(manualDateInput, fmt, new Date());
        if (isValid(parsedDate)) {
          break;
        }
      }

      if (parsedDate && isValid(parsedDate)) {
        handleJumpToDate(parsedDate);
        setManualDateInput('');
      } else {
        // Try to parse as just month and year
        const monthYearMatch = manualDateInput.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})$/i);
        if (monthYearMatch) {
          const monthName = monthYearMatch[1].toLowerCase();
          const year = parseInt(monthYearMatch[2]);
          const monthIndex = [
            'jan', 'feb', 'mar', 'apr', 'may', 'jun',
            'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
          ].indexOf(monthName.substring(0, 3));

          if (monthIndex !== -1) {
            const targetDate = new Date(year, monthIndex, 1);
            handleJumpToDate(targetDate);
            setManualDateInput('');
            return;
          }
        }

        // Try to parse as just year
        const yearMatch = manualDateInput.match(/^(\d{4})$/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          const targetDate = new Date(year, 0, 1); // January 1st of the year
          handleJumpToDate(targetDate);
          setManualDateInput('');
          return;
        }

        alert('Invalid date format. Please use formats like: YYYY-MM-DD, MM/DD/YYYY, or "January 2024"');
      }
    }
  };

  const handleManualDateKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualDateJump();
    }
  };

  return (
    <div className="space-y-6">
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
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Jump to Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={handleJumpToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="MM/DD/YYYY or Jan 2024"
                  value={manualDateInput}
                  onChange={(e) => setManualDateInput(e.target.value)}
                  onKeyPress={handleManualDateKeyPress}
                  className="w-40 h-8 text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleManualDateJump}>
                  Go
                </Button>
              </div>

              <h3 className="text-lg font-semibold ml-2">
                {view === 'month'
                  ? format(currentDate, 'MMMM yyyy')
                  : view === 'week'
                  ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
                  : (selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : format(currentDate, 'EEEE, MMMM d, yyyy'))}
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
            </div>
          </div>

          <div>
            {view === 'month'
              ? renderMonthView()
              : view === 'week'
              ? renderWeekView()
              : renderDayView()}
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
