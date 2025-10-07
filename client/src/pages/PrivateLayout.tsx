// components/PrivateLayout.tsx
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import BackgroundContent from "@/components/ui/BackgroundContent";
import Modal from "@/components/modal/Modal";
import MobileView from "./MobileView";
import DesktopView from "./DestopView";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { PuffLoader } from "react-spinners";

const PrivateLayout: React.FC = () => {
  const { isAuthenticated, isMobile, status } = useAppInitialization();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <PuffLoader color="#6a6a6a" />
      </div>
    );
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
