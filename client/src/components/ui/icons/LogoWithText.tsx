import clsx from "clsx";
import { Logo } from "./Logo";
import { APP_NAME } from "@/common/constants/name";

interface LogoComponentProps {
  isCompact?: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LogoWithText = ({
  isCompact = false,
  showText = true,
  size = "md",
  className,
}: LogoComponentProps) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-6 h-6",
      text: "text-lg",
    },
    md: {
      container: "w-8 h-8",
      text: "text-2xl",
    },
    lg: {
      container: "w-12 h-12",
      text: "text-3xl",
    },
  };

  const shouldShowText = showText && !isCompact;

  return (
    <div className={clsx("flex items-center  gap-1", className)}>
      {/* Logo Container */}
      <div
        className={clsx(
          "flex items-center justify-center",
          sizeConfig[size].container
        )}
      >
        <Logo />
      </div>

      {/* App Name Text */}
      {shouldShowText && (
        <span
          className={clsx(
            "font-semibold tracking-tight text-gray-900 dark:text-white",
            sizeConfig[size].text
          )}
          style={{
            fontFamily:
              "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
          }}
        >
          {APP_NAME}
        </span>
      )}
    </div>
  );
};
