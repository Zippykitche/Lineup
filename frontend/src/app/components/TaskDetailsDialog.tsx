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
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar, User, Trash2 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface TaskDetailsDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const { currentUser, users, updateTask, deleteTask } = useApp();
  const [status, setStatus] = useState<TaskStatus>(task.status);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEditor = currentUser?.role === 'editor';
  const isAssignee = task.assigneeId === currentUser?.id;

  const canUpdateStatus = isSuperAdmin || isEditor || isAssignee;
  const canDeleteTask = isSuperAdmin || isEditor;

  const assignee = users.find((user) => user.id === task.assigneeId);
  const creator = users.find((user) => user.id === task.createdBy);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!canUpdateStatus) {
      toast.error('You do not have permission to update this task');
      return;
    }

    setStatus(newStatus);
    updateTask(task.id, { status: newStatus });
    toast.success('Task status updated');
  };

  const handleDelete = () => {
    if (!canDeleteTask) {
      toast.error('Only Super Admin or Editor can delete tasks');
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      toast.success('Task deleted successfully');
      onOpenChange(false);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription>Task details and status</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
          <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(status)}>{status}</Badge>
            <Badge className={getPriorityColor(task.priority)}>{task.priority} Priority</Badge>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5" />
            <span>Due: {format(parseISO(task.dueDate), 'EEEE, MMMM d, yyyy')}</span>
          </div>

          {task.description && (
            <div className="pt-2">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}

          {assignee && (
            <div className="pt-2">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Assigned To
              </h4>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{assignee.fullName}</p>
                  <p className="text-sm text-gray-600">{assignee.workEmail}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {assignee.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          )}

          {creator && (
            <div className="text-sm text-gray-600">Created by: {creator.fullName}</div>
          )}

          {canUpdateStatus && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Update Status</h4>
              <span className="text-xs text-gray-500 mb-2 block italic">
                {isAssignee && !isSuperAdmin && !isEditor 
                  ? "As an assignee, you can only update task status." 
                  : "Admins and Editors can update all task details."}
              </span>
              <Select value={status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            {canDeleteTask && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
       </div>
      </DialogContent>
    </Dialog>
  );
}