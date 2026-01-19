import { ReactNode } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { useIsMobile } from "@/stores/deviceStore";
import { motion } from "framer-motion";
import { publicLayoutAnimations } from "@/common/animations/publicLayoutAnimations";
import { LogoWithText } from "@/components/ui/icons/LogoWithText";
import { useCurrentWallpaper } from "@/stores/wallpaperStore";

interface AuthenticationLayoutProps {
  children: ReactNode;
  childrenClassName?: string;
}

export const AuthenticationLayout = ({
  children,
}: AuthenticationLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentWallpaper = useCurrentWallpaper();
  console.log("currentWallpaper", currentWallpaper);

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
            "pt-12 gap-8",
          )}
        >
          <LogoWithText
            onClick={handleLogoClick}
            size="lg" // You can adjust the size if needed
          />

          <motion.div
            {...publicLayoutAnimations.mobileContainer}
            className={clsx(
              containerClass,
              "w-full max-w-[460px]! min-h-screen",
              "p-2 flex justify-center items-start",
              "rounded-t-4xl",
            )}
          >
            <div className={clsx("w-full")}>{children}</div>
          </motion.div>
        </div>
      ) : (
        <div
          className={clsx(
            "relative w-full h-full",
            "flex flex-col items-center justify-center",
          )}
        >
          <LogoWithText
            onClick={handleLogoClick}
            size="xl" // You can adjust the size if needed
            className="absolute top-16 z-10"
          />

          <motion.div
            {...publicLayoutAnimations.container}
            className={clsx(
              containerClass,
              "w-[400px]",
              "rounded-lg flex items-center",
            )}
          >
            {children}
          </motion.div>
        </div>
      )}

      {!currentWallpaper.id && (
        <div
          className="fixed inset-0"
          style={{
            zIndex: -9,
            background: "var(--primary-green-50)",
          }}
        />
      )}
    </div>
  );
};
