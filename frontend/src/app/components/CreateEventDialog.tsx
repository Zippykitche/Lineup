import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { EventStatus, OutputType } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const { currentUser, users, addEvent } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [status, setStatus] = useState<EventStatus>('Planned');
  const [outputType, setOutputType] = useState<OutputType>('TV');
  const [category, setCategory] = useState('General');

  // Set today's date as default when dialog opens
  useEffect(() => {
    if (open && !date) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [open, date]);

  const canCreateEvent =
    currentUser?.role === 'super_admin' || currentUser?.role === 'editor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateEvent) {
      toast.error('You do not have permission to create events');
      return;
    }

    if (!title || !date || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate end time is after start time
    if (startTime && endTime && endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      await addEvent({
        title,
        date,
        startTime,
        endTime,
        description,
        attendeeIds: selectedAttendees,
        createdBy: currentUser?.id || '',
        status,
        outputType,
        category
      });

      toast.success('Event created successfully');
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.message || 'Failed to create event. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setSelectedAttendees([]);
    setStatus('Planned');
    setOutputType('TV');
    setCategory('General');
  };

  const toggleAttendee = (userId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const assignableUsers = users.filter((user) => user.role !== 'super_admin');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create an editorial event and assign attendees
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Madaraka Day Coverage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
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
                required
                min={startTime || undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add event details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Assign Team Members</Label>
            <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
              {assignableUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`attendee-${user.id}`}
                    checked={selectedAttendees.includes(user.id)}
                    onCheckedChange={() => toggleAttendee(user.id)}
                  />
                  <label
                    htmlFor={`attendee-${user.id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-600">
                      {user.workEmail} • {user.role.replace('_', ' ')}
                    </p>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="outputType">Output Type</Label>
            <Select value={outputType} onValueChange={(v) => setOutputType(v as OutputType)}>
              <SelectTrigger id="outputType">
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

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}