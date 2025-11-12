import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { useIsAuthenticated } from "@/stores/authStore";
import PublicRoutes from "./PublicRoutes";
import PrivateRoute from "./PrivateRoute";
import HomePage from "@/pages/HomePage";
import InvitePage from "@/pages/InvitePage";
import logger from "@/common/utils/logger";

const AppRoutes: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  logger.log({ prefix: "AUTH" }, "AppRoutes-isAuthenticated ", isAuthenticated);

  return (
    <>
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
