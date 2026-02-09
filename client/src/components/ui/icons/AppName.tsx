// AppName.tsx

import { useAppName } from "@/common/hooks/app/useAppName";

interface AppNameProps {
  fallback?: string;
  className?: string;
}

export const AppName = ({ className }: AppNameProps) => {
  const appName = useAppName();

  return (
    <span
      className={className}
      style={{
        wordSpacing: "-0.12em",
        // letterSpacing: "-0.05em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontFamily: "'Jost','Segoe UI', -apple-system, sans-serif",
      }}
    >
      {appName}
    </span>
  );
};
