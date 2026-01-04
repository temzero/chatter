import clsx from "clsx";
import { useSettingsStore } from "@/stores/settingsStore";
import { MessageTailOptions } from "@/shared/types/enums/message-setting.enum";

interface MessageTailProps {
  isMe?: boolean;
}

export function MessageTail({ isMe }: MessageTailProps) {
  const { messageTail } = useSettingsStore().messageSettings;
  if (messageTail === MessageTailOptions.NONE) return null;

  return (
    <div
      className={clsx(
        "message-tail w-3 h-3 shrink-0",
        isMe ? "bg-(--primary-green) self-message" : "bg-(--message-color)"
      )}
    />
  );
}
