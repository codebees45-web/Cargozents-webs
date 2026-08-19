import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TruckLoader from './TruckLoader';

/**
 * Wrap any route that requires login. Optionally restrict to specific
 * roles: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <TruckLoader label="Getting things ready…" />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles) {
    // 1. 🟢 Safe role extraction and normalization (removes hidden '\n' and handles mixed case casing)
    const normalizedUserRole = user.role ? String(user.role).toLowerCase().trim() : '';
    
    // 2. 🟢 Normalize the allowed roles array for flawless matching evaluation
    const normalizedAllowedRoles = allowedRoles.map(role => String(role).toLowerCase().trim());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      console.warn(`Access Denied: Role "${user.role}" is unauthorized for this dashboard route layout.`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;