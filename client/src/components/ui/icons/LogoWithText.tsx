import clsx from "clsx";
import { Logo } from "./Logo";
import { APP_NAME } from "@/common/constants/name";

interface LogoComponentProps {
  isCompact?: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export const LogoWithText = ({
  isCompact = false,
  showText = true,
  size = "md",
  className,
  onClick,
}: LogoComponentProps) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-6 h-6",
      text: "text-2xl",
      gap: "gap-1",
    },
    md: {
      container: "w-8 h-8",
      text: "text-3xl",
      gap: "gap-1",
    },
    lg: {
      container: "w-12 h-12",
      text: "text-4xl",
      gap: "gap-2",
    },
    xl: {
      container: "w-[56px] h-[56px]",
      text: "text-5xl",
      gap: "gap-2",
    },
  };

  const shouldShowText = showText && !isCompact;

  return (
    <div
      onClick={onClick}
      className={clsx("flex items-center cursor-pointer hover:text-(--primary-color)", className, sizeConfig[size].gap)}
    >
      <Logo className={sizeConfig[size].container} />

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
