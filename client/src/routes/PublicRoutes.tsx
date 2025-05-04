import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";

interface PublicRoutesProps {
  isAuthenticated: boolean;
}

const PublicRoutes: React.FC<PublicRoutesProps> = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:first_name/:email/:token" element={<VerifyEmail />} />
    </Routes>
  );
};

export default PublicRoutes;
