// components/message-style-selector.tsx
import React from "react";
import { MessageStyle } from "@/shared/types/enums/message-setting.enum";
import { useSettingsStore } from "@/stores/settingsStore";

const MessageStyleSelector: React.FC = () => {
  const { messageSettings, setMessageStyle } = useSettingsStore();

  // Define all available message styles with their display names
  const messageStyles = [
    {
      value: MessageStyle.CURVED,
      label: "Curved",
      previewClass: "rounded-xl",
    },
    {
      value: MessageStyle.ROUNDED,
      label: "Curved",
      previewClass: "rounded-full",
    },
    // {
    //   value: MessageStyle.STRAIGHT,
    //   label: "Straight",
    //   previewClass: "rounded-tl-none rounded-tr-xl rounded-br-xl rounded-bl-xl",
    // },
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
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              messageSettings.messageStyle === style.value
                ? "border-(--primary-green)"
                : "border-(--border-color)"
            }`}
          >
            {messageSettings.messageStyle === style.value && (
              <div className="w-2.5 h-2.5 rounded-full bg-(--primary-green)" />
            )}
          </div>

          <div id="message-bubble" className={`w-[80%]! h-10 bg-(--primary-green-glow) custom-border ${style.previewClass}!`}></div>
        </div>
      ))}
    </div>
  );
};

export default MessageStyleSelector;
