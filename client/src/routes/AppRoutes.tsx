// src/routes/AppRoutes.tsx
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated, useAuthStore } from "@/stores/authStore";
import PublicRoutes from "./PublicRoutes";
import PrivateLayout from "../pages/PrivateLayout";
import InvitePage from "@/components/ui/InvitePage";
// import Chat from "@/components/chat/Chat";

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

        {/* Invite route is a special case — still protected */}
        <Route
          path={ROUTES.PRIVATE.INVITE}
          element={
            isAuthenticated ? (
              <InvitePage />
            ) : (
              <Navigate to={ROUTES.PUBLIC.LOGIN} />
            )
          }
        />

        {/* Private Routes */}
        <Route path={ROUTES.PRIVATE.HOME} element={<PrivateLayout />} />
        <Route path={ROUTES.PRIVATE.CHAT} element={<PrivateLayout />} />

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
