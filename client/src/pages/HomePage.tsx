// components/HomePage.tsx
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { useAppInitialization } from "@/common/hooks/useAppInitialization";
import { useIsAuthenticated } from "@/stores/authStore";
import BackgroundContent from "@/components/ui/layout/BackgroundContent";
import Modal from "@/components/modal/Modal";
import PrivateLayout from "@/layouts/PrivateLayout";

const HomePage: React.FC = () => {
  useAppInitialization();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <BackgroundContent />
      <PrivateLayout />
      <Modal />
    </div>
  );
};

export default HomePage;
