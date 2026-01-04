// components/message-tail-selector.tsx
import React from "react";
import { MessageTailOptions } from "@/shared/types/enums/message-setting.enum";
import { useSettingsStore } from "@/stores/settingsStore";
import { RadioDot } from "../selectionDots/SelectionDots";

const MessageTailSelector: React.FC = () => {
  const { messageSettings, setMessageTail } = useSettingsStore();
  const messageTailSetting = messageSettings.messageTail;

  const messageTails = [
    {
      value: MessageTailOptions.NONE,
      label: "None",
      cssVar: "var(--message-tail-clip-path-none)",
    },
    {
      value: MessageTailOptions.POINTED,
      label: "Pointed",
      cssVar: "var(--message-tail-clip-path-pointed)",
    },
    {
      value: MessageTailOptions.STRAIGHT,
      label: "Straight",
      cssVar: "var(--message-tail-clip-path-straight)",
    },
    {
      value: MessageTailOptions.CURVED,
      label: "Curved",
      cssVar: "var(--message-tail-clip-path-curved)",
    },
    // {
    //   value: MessageTailOptions.CIRCLE,
    //   label: "Circle",
    //   cssVar: "var(--message-tail-clip-path-circle)",
    // },
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
          <RadioDot isSelected={messageTailSetting === style.value} />

          {/* Preview */}
          <div className="flex flex-col w-[60%] items-end">
            <div className="w-full h-8 message-bubble bg-(--primary-green-glow)!" />
            <div
              className="message-tail bg-(--primary-green-glow)!"
              style={{
                transform: "scaleX(-1)",
                clipPath: style.cssVar,
                display:
                  style.value === MessageTailOptions.NONE ? "none" : "block",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageTailSelector;
