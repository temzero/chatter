import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { useAuthStore, useIsAuthenticated } from "@/stores/authStore";
import PublicRoutes from "./PublicRoutes";
import PrivateRoute from "./PrivateRoute";
import HomePage from "@/pages/HomePage";
import InvitePage from "@/pages/InvitePage";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";

const RouteMessageCleaner = () => {
  const location = useLocation();
  const clearMessage = useAuthStore.getState().clearMessage;

  useEffect(() => {
    clearMessage();
  }, [clearMessage, location.pathname]);

  return null;
};

const AppRoutes: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthStore((state) => state.loading);
  console.log("AppRoutes-isAuthenticated ", isAuthenticated);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <BarLoader />
      </div>
    );
  }

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

        {/* Invite route is still protected */}
        <Route
          path={ROUTES.PRIVATE.INVITE}
          element={
            <PrivateRoute>
              <InvitePage />
            </PrivateRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path={ROUTES.PRIVATE.HOME}
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.PRIVATE.CHAT}
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
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
    </>
  );
};

export default AppRoutes;
