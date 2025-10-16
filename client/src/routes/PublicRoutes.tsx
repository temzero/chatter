// src/routes/PublicRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";

const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Redirect to login as default public route */}
      <Route path="*" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />

      <Route path={ROUTES.PUBLIC.LOGIN} element={<Login />} />
      <Route path={ROUTES.PUBLIC.REGISTER} element={<Register />} />
      <Route path={ROUTES.PUBLIC.FORGOT_PASSWORD} element={<ForgotPassword />}/>
      <Route path={ROUTES.PUBLIC.RESET_PASSWORD} element={<ResetPassword />} />
      <Route path={ROUTES.PUBLIC.VERIFY_EMAIL} element={<VerifyEmail />} />
    </Routes>
  );
};

export default PublicRoutes;
