// routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { ROUTES } from "@/common/constants/routes";
import { useIsAuthenticated } from '@/stores/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated= useIsAuthenticated()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;