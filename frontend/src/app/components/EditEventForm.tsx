import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Event } from '../types';
import { toast } from 'sonner';
import { LoadingSpinner } from './ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Props {
  event: Event;
  onClose: () => void;
  onSave: () => void;
}

export function EditEventForm({ event, onClose, onSave }: Props) {
  const { updateEvent, users } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [description, setDescription] = useState(event.description);
  const [category, setCategory] = useState(event.category || 'General');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(event.attendeeIds || []);
  const [status, setStatus] = useState<EventStatus>(event.status || 'Planned');
  const [priority, setPriority] = useState(event.priority || 'medium');
  const [outputType, setOutputType] = useState(event.outputType || 'TV');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate end time is after start time
    if (startTime && endTime && endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateEvent(event.id, {
        title,
        date,
        startTime,
        endTime,
        description,
        category,
        attendeeIds: selectedAttendees,
        status,
        priority,
        outputType,
      });
      toast.success('Event updated successfully');
      onSave();
    } catch (error: any) {
      console.error('Failed to update event:', error);
      toast.error(error.message || 'Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAttendee = (userId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const assignableUsers = users.filter((user) => !user.suspended);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label>Date</Label>
        <Input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label>Start Time</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex-1">
          <Label>End Time</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => {
              const newEndTime = e.target.value;
              if (startTime && newEndTime && newEndTime <= startTime) {
                toast.error('End time must be after start time');
                return;
              }
              setEndTime(newEndTime);
            }}
            min={startTime || undefined}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label>Assign Team Members</Label>
        <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50">
          {assignableUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <Checkbox
                id={`edit-attendee-${user.id}`}
                checked={selectedAttendees.includes(user.id)}
                onCheckedChange={() => toggleAttendee(user.id)}
                disabled={isSubmitting}
              />
              <label
                htmlFor={`edit-attendee-${user.id}`}
                className="flex-1 cursor-pointer text-sm"
              >
                <p className="font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user.workEmail} • {user.role.replace('_', ' ')}
                </p>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Category</Label>
        <Select 
          value={category} 
          onValueChange={setCategory}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="News">News</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Politics">Politics</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)} disabled={isSubmitting}>
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

        <div>
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Output Type</Label>
        <Select value={outputType} onValueChange={setOutputType} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TV">TV</SelectItem>
            <SelectItem value="Radio">Radio</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
            <SelectItem value="Web">Web</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
