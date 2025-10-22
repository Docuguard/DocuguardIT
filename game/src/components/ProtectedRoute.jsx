import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userProfile } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (requireAdmin && !userProfile?.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
