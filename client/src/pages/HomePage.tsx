// components/HomePage.tsx
import { useAppInitialization } from "@/common/hooks/app/useAppInitialization";
import BackgroundContent from "@/components/ui/layout/BackgroundContent";
import PrivateLayout from "@/layouts/PrivateLayout";
import Modal from "@/components/modal/Modal";
import logger from "@/common/utils/logger";

const HomePage: React.FC = () => {
  logger.log({ prefix: "MOUNTED" }, "HomePage");
  useAppInitialization();

  return (
    <div className="flex h-screen overflow-hidden">
      <BackgroundContent />
      <PrivateLayout />
      <Modal />
    </div>
  );
};

export default HomePage;
