import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { TaskStatus, TaskPriority } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { currentUser, users, events, addTask } = useApp();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [description, setDescription] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const canAssignTasks =
    currentUser?.role === 'super_admin' || currentUser?.role === 'editor';

  const handleAssigneeToggle = (userId: string) => {
    setAssigneeIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAssignTasks) {
      toast.error('You do not have permission to assign tasks');
      return;
    }

    if (!title || !dueDate || assigneeIds.length === 0) {
      toast.error('Please fill in all required fields and select at least one assignee');
      return;
    }

    try {
      await addTask({
        title,
        dueDate,
        assigneeIds,
        status,
        priority,
        description,
        createdBy: currentUser?.id || '',
        eventId: selectedEventId || null,
      });

      toast.success('Task created and assigned successfully');
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setAssigneeIds([]);
    setStatus('Pending');
    setPriority('Medium');
    setDescription('');
    setSelectedEventId('');
  };

  const assignableUsers = users.filter((u) => u.role === 'assignee' && !u.suspended);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Assign a deliverable to one or more assignees</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              id="task-title"
              placeholder="e.g., Prepare Social Graphic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign To * (Select one or more assignees)</Label>
            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              {assignableUsers.length > 0 ? (
                assignableUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`assignee-${user.id}`}
                      checked={assigneeIds.includes(user.id)}
                      onCheckedChange={() => handleAssigneeToggle(user.id)}
                    />
                    <Label htmlFor={`assignee-${user.id}`} className="cursor-pointer flex-1">
                      {user.fullName}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No available assignees</p>
              )}
            </div>
            {assigneeIds.length > 0 && (
              <p className="text-sm text-gray-600">{assigneeIds.length} assignee(s) selected</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Add task details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Link to Event (Optional)</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger id="event">
                <SelectValue placeholder="Select an event..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No event (Independent task)</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} ({event.date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}