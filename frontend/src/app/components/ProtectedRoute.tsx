import { Navigate, Outlet } from 'react-router';
import { useApp } from '../context/AppContext';

export function ProtectedRoute() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
