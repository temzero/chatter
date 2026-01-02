// components/MotionConfigProvider.tsx
import { MotionConfig } from "framer-motion";
import { useSettingsStore } from "@/stores/settingsStore";

export function MotionConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { displaySettings } = useSettingsStore();

  return (
    <MotionConfig
      reducedMotion={displaySettings.reduceMotion ? "always" : "never"}
    >
      {children}
    </MotionConfig>
  );
}
