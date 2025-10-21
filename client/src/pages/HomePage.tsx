// components/HomePage.tsx
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { useAppInitialization } from "@/common/hooks/useAppInitialization";
import { useIsAuthenticated } from "@/stores/authStore";
import BackgroundContent from "@/components/ui/layout/BackgroundContent";
import PrivateLayout from "@/layouts/PrivateLayout";
import Modal from "@/components/modal/Modal";

const HomePage: React.FC = () => {
  console.log('HomePage')
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
