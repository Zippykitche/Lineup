import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  const { updateEvent } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [description, setDescription] = useState(event.description);
  const [category, setCategory] = useState(event.category || 'General');

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