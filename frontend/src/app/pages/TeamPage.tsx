import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search, Mail, Phone, Users, Plus, Shield, UserCog } from 'lucide-react';
import { Role, User } from '../types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'assignee', label: 'Assignee' },
];

const DEPARTMENT_OPTIONS = [
  'Digital',
  'Editors',
  'Producers',
  'Heads of Desk',
  'Reporters',
  'Designers',
  'Video Producers',
];

export function TeamPage() {
  const { users, tasks, events, currentUser, register } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>(users);

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [roleToAssign, setRoleToAssign] = useState<Role | ''>('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const allUsers = useMemo(() => {
    return demoUsers.length ? demoUsers : users;
  }, [demoUsers, users]);

  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.workEmail.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatRole = (value: Role) => {
    if (value === 'super_admin') return 'Super Admin';
    if (value === 'editor') return 'Editor';
    return 'Assignee';
  };

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter((t) => t.assigneeId === userId);
    const activeTasks = userTasks.filter((t) => t.status !== 'Completed').length;
    const userEvents = events.filter((e) => e.attendeeIds.includes(userId));
    const upcomingEvents = userEvents.filter((e) => new Date(e.date) >= new Date()).length;

    return { activeTasks, upcomingEvents };
  };

  const resetCreateForm = () => {
    setFullName('');
    setWorkEmail('');
    setPhone('');
    setDepartment('');
    setRole('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !workEmail || !department || !role) return;

    const newUser: User = {
      id: Date.now().toString(),
      fullName,
      workEmail: workEmail.trim().toLowerCase(),
      phone,
      department,
      role,
    };

    register(newUser);
    setDemoUsers((prev) => [...prev, newUser]);
    resetCreateForm();
    setShowCreateUser(false);
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setRoleToAssign(user.role);
    setShowRoleDialog(true);
  };

  const handleAssignRole = () => {
    if (!selectedUser || !roleToAssign) return;

    setDemoUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? { ...user, role: roleToAssign } : user
      )
    );

    setShowRoleDialog(false);
    setSelectedUser(null);
    setRoleToAssign('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isSuperAdmin ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                {isSuperAdmin ? 'User Management' : 'Team Directory'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isSuperAdmin
                  ? 'Create and manage staff accounts, and assign roles'
                  : `${filteredUsers.length} team members`}
              </p>
            </div>

            {isSuperAdmin && (
              <Button onClick={() => setShowCreateUser(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user) => {
              const stats = getUserStats(user.id);

              return (
                <div
                  key={user.id}
                  className="p-5 border rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback
                        className={`text-lg ${
                          user.role === 'super_admin' ? 'bg-red-700' : 'bg-blue-600'
                        } text-white`}
                      >
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">{user.department}</p>
                        </div>
                        <Badge
                          variant={user.role === 'super_admin' ? 'default' : 'secondary'}
                        >
                          {formatRole(user.role)}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{user.workEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone || '—'}</span>
                        </div>
                      </div>

                      {user.role === 'assignee' && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-gray-600 mb-2">Work Summary</p>
                          <div className="flex gap-4 text-xs">
                            <div>
                              <span className="text-gray-600">Active Tasks: </span>
                              <span className="font-semibold">{stats.activeTasks}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Upcoming Events: </span>
                              <span className="font-semibold">{stats.upcomingEvents}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isSuperAdmin && user.id !== currentUser?.id && (
                        <div className="mt-4 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                          >
                            <UserCog className="w-4 h-4 mr-2" />
                            Assign Role
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create User Account</DialogTitle>
            <DialogDescription>
              Add a staff account and assign a role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEmail">Work Email</Label>
              <Input
                id="workEmail"
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="jane.doe@kbc.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleToAssign} onValueChange={(v) => setRoleToAssign(v as Role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignRole}>Save Role</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}