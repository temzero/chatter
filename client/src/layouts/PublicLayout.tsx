import { ReactNode } from "react";
import clsx from "clsx";
import { Logo } from "@/components/ui/icons/Logo";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { APP_NAME } from "@/common/constants/name";
import { useIsMobile } from "@/stores/deviceStore";
import { motion } from "framer-motion";
import { publicLayoutAnimations } from "@/common/animations/publicLayoutAnimations";

interface AuthenticationLayoutProps {
  children: ReactNode;
  childrenClassName?: string;
}

export const AuthenticationLayout = ({
  children,
}: AuthenticationLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogoClick = () => {
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const containerClass = "glass-panel border-3";

  return (
    <div className={clsx("w-full h-screen overflow-hidden select-none")}>
      {isMobile ? (
        <div
          className={clsx(
            "w-full h-full flex flex-col items-center",
            "pt-12 gap-8"
          )}
        >
          <div
            onClick={handleLogoClick}
            className={clsx(
              "flex gap-1 items-center",
              "select-none cursor-pointer"
            )}
          >
            <Logo />
            <h1 className={clsx("text-4xl")}>{APP_NAME}</h1>
          </div>

          <motion.div
            {...publicLayoutAnimations.mobileContainer}
            className={clsx(
              containerClass,
              "w-full max-w-[460px]! min-h-screen",
              "px-2 flex justify-center items-start",
              "rounded-t-4xl"
            )}
          >
            <div className={clsx("w-full")}>{children}</div>
          </motion.div>
        </div>
      ) : (
        <div
          className={clsx(
            "relative w-full h-full",
            "flex flex-col items-center justify-center"
          )}
        >
          <div
            onClick={handleLogoClick}
            className={clsx(
              "flex gap-1 items-center",
              "absolute top-16 z-10",
              "select-none cursor-pointer"
            )}
          >
            <Logo className={clsx("w-[50px]")} />
            <h1 className={clsx("text-5xl")}>{APP_NAME}</h1>
          </div>

          <motion.div
            {...publicLayoutAnimations.container}
            className={clsx(
              containerClass,
              "w-[400px]",
              "rounded-lg flex items-center"
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </div>
  );
};
