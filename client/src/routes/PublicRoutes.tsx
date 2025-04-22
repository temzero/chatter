// routes/PublicRoutes.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

interface PublicRoutesProps {
  isAuthenticated: boolean;
}

const PublicRoutes: React.FC<PublicRoutesProps> = ({ isAuthenticated }) => {
  // If user is authenticated, redirect them away from public routes
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Auth-related routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Redirect root to home if not authenticated */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default PublicRoutes;