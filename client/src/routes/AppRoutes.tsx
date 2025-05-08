// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import PublicRoutes from "./PublicRoutes";
import PrivateLayout, { ChatContent } from "../pages/PrivateLayout";
import { useIsAuthenticated, useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

const RouteMessageCleaner = () => {
  const location = useLocation();
  const clearMessage = useAuthStore((state) => state.clearMessage);

  useEffect(() => {
    clearMessage();
  }, [clearMessage, location.pathname]);

  return null;
};

const AppRoutes: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <RouteMessageCleaner />
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
        <Route path={ROUTES.PRIVATE.HOME} element={<PrivateLayout />}>
          <Route path={ROUTES.PRIVATE.CHAT} element={<ChatContent />} />
          <Route index element={null} />
        </Route>

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
    </>
  );
};

export default AppRoutes;
