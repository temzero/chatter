import { useSettingsStore } from "@/stores/settingsStore";
import { useEffect } from "react";

export function SettingsEffects() {
  const { displaySettings, messageSettings } = useSettingsStore((s) => s);
  const {
    textSize,
    fontStyle,
    reduceMotion,
    reduceTransparency,
    highContrast,
  } = displaySettings;

  const { messageStyle, messageTail } = messageSettings;

  useEffect(() => {
    const html = document.documentElement;

    html.dataset.textSize = textSize;
    html.dataset.fontStyle = fontStyle;
    html.dataset.reduceMotion = String(reduceMotion);
    html.dataset.reduceTransparency = String(reduceTransparency);
    html.dataset.highContrast = String(highContrast);
    html.dataset.messageStyle = String(messageStyle);
    html.dataset.messageTail = String(messageTail);
  }, [textSize, fontStyle, reduceMotion, reduceTransparency, highContrast, messageStyle, messageTail]);

  return null;
}
