import { ReactNode } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  Calendar,
  LayoutDashboard,
  CheckSquare,
  Users,
  Bell,
  UserCircle,
  LogOut,
} from 'lucide-react';
import logo from '../../assets/KBC-PODCASTS-LOGO-1.png';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentUser, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.read
  ).length;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Users, label: isSuperAdmin ? 'Users' : 'Team', path: '/team' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const formatRole = (role?: string) => {
    if (!role) return '';
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'editor') return 'Editor';
    if (role === 'assignee') return 'Assignee';
    return role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="KBC Logo" className="h-8 w-auto object-contain" />
              <div>
                <h1 className="font-semibold text-lg">Lineup</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{currentUser?.fullName}</p>
                <p className="text-xs text-gray-600">{formatRole(currentUser?.role)}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  {currentUser?.fullName ? getInitials(currentUser.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="default" className="bg-red-500">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children || <Outlet />}</main>
        </div>
      </div>
    </div>
  );
}