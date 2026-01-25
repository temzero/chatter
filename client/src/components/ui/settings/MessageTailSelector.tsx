// components/message-tail-selector.tsx
import React from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { RadioDot } from "../selectionDots/SelectionDots";
import {
  messageTailClasses,
  MessageTailOptions,
} from "@/shared/types/enums/message-setting.enum";

const MessageTailSelector: React.FC = () => {
  const { messageSettings, setMessageTail } = useSettingsStore();
  const messageTailSetting = messageSettings.messageTail;

  console.log("Current message tail setting:", messageTailSetting);

  // Get all message tail options from the enum
  const tailOptions = Object.values(MessageTailOptions);

  return (
    <div className="w-full rounded-xl overflow-hidden custom-border">
      {tailOptions.map((option) => (
        <div
          key={option}
          className="flex w-full items-center justify-between p-3 pr-6 cursor-pointer hover:bg-(--hover-color) transition-all"
          onClick={() => setMessageTail(option)}
        >
          {/* Radio */}
          <RadioDot isSelected={messageTailSetting === option} />

          {/* Preview */}
          <div className="flex flex-col w-[60%] items-end">
            <div
              style={{
                zIndex: 1,
              }}
              className="w-full h-10 message-bubble bg-(--primary-green-glow)!"
            />
            <div
              className={`message-tail self-message ${messageTailClasses[option]}`}
              style={{
                zIndex: 0,
                display: option === MessageTailOptions.NONE ? "none" : "block",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageTailSelector;
