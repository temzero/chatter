// components/PrivateLayout.tsx
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import BackgroundContent from "@/components/ui/BackgroundContent";
import Modal from "@/components/modal/Modal";
import MobileView from "./MobileView";
import DesktopView from "./DestopView";
import { useIsAuthenticated } from "@/stores/authStore";
import { useDeviceStore } from "@/stores/deviceStore";

const PrivateLayout: React.FC = () => {
  useAppInitialization();
  const isAuthenticated = useIsAuthenticated();
  const isMobile = useDeviceStore((state) => state.isMobile);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <BackgroundContent />
      {isMobile ? <MobileView /> : <DesktopView />}
      <Modal />
    </div>
  );
};

export default PrivateLayout;
