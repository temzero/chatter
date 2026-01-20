import clsx from "clsx";
import { Logo } from "./Logo";
import { APP_NAME } from "@/common/constants/name";
import { useIsCompactSidebar } from "@/stores/sidebarStore";

interface LogoComponentProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export const LogoWithName = ({
  showText = true,
  size = "md",
  className,
  onClick,
}: LogoComponentProps) => {
  const isCompact = useIsCompactSidebar();
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
      gap: "gap-0.5",
    },
    lg: {
      container: "w-12 h-12",
      text: "text-4xl",
      gap: "gap-1",
    },
    xl: {
      container: "w-[50px] h-[50px]",
      text: "text-5xl",
      gap: "gap-2",
    },
  };

  const shouldShowText = showText && !isCompact;

  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex items-center cursor-pointer hover:text-(--primary-color)",
        isCompact && "-ml-1",
        className,
        sizeConfig[size].gap,
      )}
    >
      <Logo className={sizeConfig[size].container} />

      {/* App Name Text */}
      {shouldShowText && (
        <span
          className={clsx("font-medium tracking-tight", sizeConfig[size].text)}
          style={{
            fontFamily: "'Jost','Segoe UI', -apple-system, sans-serif",
          }}
        >
          {APP_NAME}
        </span>
      )}
    </div>
  );
};
