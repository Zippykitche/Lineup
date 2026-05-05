import { Navigate, Outlet } from 'react-router';
import { useApp } from '../context/AppContext';
import { LoadingSpinner } from './ui/loading-spinner';

export function ProtectedRoute() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
