import clsx from "clsx";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  messageTailClasses,
  MessageTailOptions,
} from "@/shared/types/enums/message-setting.enum";

interface MessageTailProps {
  isMe?: boolean;
}

export function MessageTail({ isMe }: MessageTailProps) {
  const { messageTail } = useSettingsStore().messageSettings;
  if (!messageTail || messageTail === MessageTailOptions.NONE) return null;

  const tailClass = messageTailClasses[messageTail];

  return (
    <div
      className={clsx(
        tailClass,
        "message-tail shrink-0",
        isMe && "self-message"
      )}
    />
  );
}
