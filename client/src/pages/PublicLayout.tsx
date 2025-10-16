import { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import BackgroundContent from "@/components/ui/BackgroundContent";

interface AuthenticationLayoutProps {
  children: ReactNode;
  loading?: boolean;
}

export const AuthenticationLayout = ({
  children,
}: AuthenticationLayoutProps) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <BackgroundContent />

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="flex gap-1 items-center absolute top-20 z-10 select-none cursor-pointer"
          onClick={handleLogoClick}
        >
          <Logo className="w-[50px] text-white" />
          <h1 className="text-5xl text-white">Chatter</h1>
        </div>

        {children}
      </div>
    </div>
  );
};
