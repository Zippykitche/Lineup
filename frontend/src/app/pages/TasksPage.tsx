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
import { Plus, Search } from 'lucide-react';
import { CreateTaskDialog } from '../components/CreateTaskDialog';
import { TaskDetailsDialog } from '../components/TaskDetailsDialog';
import { Task, TaskStatus, TaskPriority } from '../types';
import { format, parseISO } from 'date-fns';

export function TasksPage() {
  const { currentUser, tasks, users } = useApp();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEditor = currentUser?.role === 'editor';
  const isAssignee = currentUser?.role === 'assignee';
  const canCreateTask = isSuperAdmin || isEditor;

  const userTasks = isAssignee
    ? tasks.filter((task) => task.assigneeIds?.includes(currentUser?.id || ''))
    : tasks;

  const filteredTasks = userTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || 'Unknown';
  };

  const getAssigneeNames = (assigneeIds: string[]) => {
    return assigneeIds.map(id => getUserName(id)).join(', ');
  };

  const groupedTasks = {
    pending: filteredTasks.filter((t) => t.status === 'Pending'),
    inProgress: filteredTasks.filter((t) => t.status === 'In Progress'),
    completed: filteredTasks.filter((t) => t.status === 'Completed'),
  };

  const renderColumn = (title: string, items: Task[], status: TaskStatus) => (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {title}
        <Badge variant="outline">{items.length}</Badge>
      </h3>

      <div className="space-y-3">
        {items.map((task) => (
          <div
            key={task.id}
            className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white ${
              status === 'Completed' ? 'opacity-75' : ''
            }`}
            onClick={() => setSelectedTask(task)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={`font-medium ${status === 'Completed' ? 'line-through' : ''}`}>
                {task.title}
              </h4>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Due:</span>{' '}
                {format(parseISO(task.dueDate), 'MMM d, yyyy')}
              </div>
              <div>
                <span className="font-medium">
                  {isAssignee ? 'Assigned by:' : 'Assignees:'}
                </span>{' '}
                {isAssignee ? getUserName(task.createdBy) : getAssigneeNames(task.assigneeIds || [])}
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No {title.toLowerCase()} tasks</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>{isAssignee ? 'My Tasks' : 'Tasks & Deliverables'}</CardTitle>
            {canCreateTask && (
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderColumn('Pending', groupedTasks.pending, 'Pending')}
            {renderColumn('In Progress', groupedTasks.inProgress, 'In Progress')}
            {renderColumn('Completed', groupedTasks.completed, 'Completed')}
          </div>
        </CardContent>
      </Card>

      {canCreateTask && (
        <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
      )}

      {selectedTask && (
        <TaskDetailsDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
    </div>
  );
}