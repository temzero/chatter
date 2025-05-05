// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import PublicRoutes from "./PublicRoutes";
import PrivateLayout from "../pages/PrivateLayout";

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.PRIVATE.HOME} replace />
          ) : (
            <PublicRoutes />
          )
        }
      />

      {/* Private Routes */}
      <Route
        path={ROUTES.PRIVATE.HOME}
        element={<PrivateLayout isAuthenticated={isAuthenticated} />}
      />

      {/* Catch-all Route */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? ROUTES.PRIVATE.HOME : ROUTES.PUBLIC.LOGIN}
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
