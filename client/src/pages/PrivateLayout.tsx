// components/PrivateLayout.tsx
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { useAppInitialization } from "@/common/hooks/useAppInitialization";
import BackgroundContent from "@/components/ui/BackgroundContent";
import Modal from "@/components/modal/Modal";
import { useIsAuthenticated } from "@/stores/authStore";
import AdaptiveView from "./AdaptiveView";

const PrivateLayout: React.FC = () => {
  useAppInitialization();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <BackgroundContent />
      <AdaptiveView />
      <Modal />
    </div>
  );
};

export default PrivateLayout;
