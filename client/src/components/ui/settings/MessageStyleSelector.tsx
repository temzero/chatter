// components/message-style-selector.tsx
import React from "react";
import { MessageStyleOptions } from "@/shared/types/enums/message-setting.enum";
import { useSettingsStore } from "@/stores/settingsStore";
import { RadioDot } from "../selectionDots/SelectionDots";

const MessageStyleSelector: React.FC = () => {
  const { messageSettings, setMessageStyle } = useSettingsStore();
  const messageStyle = messageSettings.messageStyle;

  // Define all available message styles with their display names
  const messageStyles = [
    {
      value: MessageStyleOptions.STRAIGHT,
      label: "Straight",
      previewClass: "var(--message-border-radius-straight)",
    },
    {
      value: MessageStyleOptions.CURVED,
      label: "Curved",
      previewClass: "var(--message-border-radius-curved)",
    },
    {
      value: MessageStyleOptions.ROUNDED,
      label: "Curved",
      previewClass: "var(--message-border-radius-rounded)",
    },
  ];

  return (
    <div className="w-full rounded-xl custom-border overflow-hidden">
      {messageStyles.map((style) => (
        <div
          key={style.value}
          className={`flex w-full items-center justify-between p-3 cursor-pointer hover:bg-(--hover-color) transition-all duration-200`}
          onClick={() => setMessageStyle(style.value)}
        >
          {/* Radio Button */}
          <RadioDot isSelected={messageStyle === style.value} />

          <div
            id="message-bubble"
            className={`w-[70%]! h-8 bg-(--primary-green-glow) custom-border`}
            style={{
              borderRadius: style.previewClass,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default MessageStyleSelector;
