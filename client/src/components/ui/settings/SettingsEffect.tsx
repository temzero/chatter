import { useSettingsStore } from "@/stores/settingsStore";
import { useEffect } from "react";

export function SettingsEffects() {
  const { textSize, reduceMotion, reduceTransparency, highContrast } =
    useSettingsStore((s) => s.displaySettings);

  useEffect(() => {
    const html = document.documentElement;

    html.dataset.textSize = textSize;
    html.dataset.reduceMotion = String(reduceMotion);
    html.dataset.reduceTransparency = String(reduceTransparency);
    html.dataset.highContrast = String(highContrast);
  }, [textSize, reduceMotion, reduceTransparency, highContrast]);

  return null;
}
