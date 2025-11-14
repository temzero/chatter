// components/HomePage.tsx
import { useAppInitialization } from "@/common/hooks/app/useAppInitialization";
import BackgroundContent from "@/components/ui/layout/BackgroundContent";
import PrivateLayout from "@/layouts/PrivateLayout";
import Modal from "@/components/modal/Modal";

const HomePage: React.FC = () => {
  console.log("[MOUNTED]", "HomePage");
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
