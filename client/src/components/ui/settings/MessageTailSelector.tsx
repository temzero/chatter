// components/message-tail-selector.tsx
import React from "react";
import { MessageTail } from "@/shared/types/enums/message-setting.enum";
import { useSettingsStore } from "@/stores/settingsStore";

const MessageTailSelector: React.FC = () => {
  const { messageSettings, setMessageTail } = useSettingsStore();

  const messageTails = [
    {
      value: MessageTail.NONE,
      label: "None",
      cssVar: "var(--message-tail-none)",
    },
    {
      value: MessageTail.STRAIGHT,
      label: "Straight",
      cssVar: "var(--message-tail-straight)",
    },
    {
      value: MessageTail.POINTED,
      label: "Pointed",
      cssVar: "var(--message-tail-pointed)",
    },
    {
      value: MessageTail.CURVED,
      label: "Curved",
      cssVar: "var(--message-tail-curved)",
    },
  ];

  return (
    <div className="w-full rounded-xl overflow-hidden custom-border">
      {messageTails.map((style) => (
        <div
          key={style.value}
          className="flex w-full items-center justify-between p-3 cursor-pointer hover:bg-(--hover-color) transition-all"
          onClick={() => setMessageTail(style.value)}
        >
          {/* Radio */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              messageSettings.messageTail === style.value
                ? "border-(--primary-green)"
                : "border-(--border-color)"
            }`}
          >
            {messageSettings.messageTail === style.value && (
              <div className="w-2.5 h-2.5 rounded-full bg-(--primary-green)" />
            )}
          </div>

          {/* Preview */}
          <div className="flex flex-col w-[80%] items-end">
            <div className="w-full h-8 message-bubble bg-(--primary-green-glow)!" />
            <div
              className="message-tail bg-(--primary-green-glow)!"
              style={{
                transform: "scaleX(-1)",
                clipPath: style.cssVar,
                display: style.value === MessageTail.NONE ? "none" : "block",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageTailSelector