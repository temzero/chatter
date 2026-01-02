import { useSettingsStore } from "@/stores/settingsStore";
import { useEffect } from "react";

export function SettingsEffects() {
  const { textSize, fontStyle, reduceMotion, reduceTransparency, highContrast } =
    useSettingsStore((s) => s.displaySettings);

  useEffect(() => {
    const html = document.documentElement;

    html.dataset.textSize = textSize;
    html.dataset.fontStyle = fontStyle;
    html.dataset.reduceMotion = String(reduceMotion);
    html.dataset.reduceTransparency = String(reduceTransparency);
    html.dataset.highContrast = String(highContrast);
  }, [textSize, fontStyle, reduceMotion, reduceTransparency, highContrast]);

  return null;
}
