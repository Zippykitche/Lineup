import { useState } from 'react';
import { useApp } from '../context/AppContext';
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
import { Task, TaskStatus, TaskPriority } from '../types';
import { toast } from 'sonner';

interface EditTaskFormProps {
  task: Task;
  onClose: () => void;
  onSave: () => void;
}

export function EditTaskForm({ task, onClose, onSave }: EditTaskFormProps) {
  const { users, events, updateTask } = useApp();
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(task.assigneeIds || []);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [description, setDescription] = useState(task.description || '');
  const [selectedEventId, setSelectedEventId] = useState<string>(task.eventId || '');
  const INDEPENDENT_TASK_EVENT_ID = 'none';
  const [isLoading, setIsLoading] = useState(false);

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTask(task.id, {
        title,
        dueDate,
        assigneeIds: selectedAssignees,
        status,
        priority,
        description,
        eventId:
          selectedEventId === INDEPENDENT_TASK_EVENT_ID
            ? null
            : selectedEventId || null,
      });

      toast.success('Task updated successfully');
      onSave();
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast.error(error.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const assignableUsers = users.filter((u) => !u.suspended);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="edit-task-title">Task Title *</Label>
        <Input
          id="edit-task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-dueDate">Due Date *</Label>
        <Input
          id="edit-dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Assign Team Members *</Label>
        <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50">
          {assignableUsers.length > 0 ? (
            assignableUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`edit-task-assignee-${user.id}`}
                  checked={selectedAssignees.includes(user.id)}
                  onCheckedChange={() => toggleAssignee(user.id)}
                  disabled={isLoading}
                />
                <label
                  htmlFor={`edit-task-assignee-${user.id}`}
                  className="flex-1 cursor-pointer text-sm font-normal"
                >
                  {user.fullName} ({user.role})
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No available assignees</p>
          )}
        </div>
        {selectedAssignees.length > 0 && (
          <p className="text-xs text-gray-500">{selectedAssignees.length} assignee(s) selected</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger id="edit-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
            <SelectTrigger id="edit-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-task-description">Description</Label>
        <Textarea
          id="edit-task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-event">Link to Event (Optional)</Label>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger id="edit-event">
            <SelectValue placeholder="Select an event..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={INDEPENDENT_TASK_EVENT_ID}>No event (Independent task)</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title} ({event.date})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white dark:bg-background">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
