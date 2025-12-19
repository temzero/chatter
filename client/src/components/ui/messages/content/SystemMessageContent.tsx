import { JSX } from "react";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { getSystemMessageText } from "@/common/utils/message/systemMessageHelpers";
import { getSystemMessageColor } from "@/common/utils/message/systemMessageHelpers";
import { SystemMessageIcon } from "@/components/ui/icons/SystemMessageIcon";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/stores/deviceStore";

export type SystemMessageJSONContent = {
  oldValue?: string;
  newValue?: string;
  targetId?: string;
  targetName?: string;
};

type SystemMessageContentProps = {
  systemEvent?: SystemEventType | null;
  currentUserId: string;
  senderId: string;
  senderDisplayName: string;
  JSONcontent?: SystemMessageJSONContent | null;
  className?: string;
};

export const SystemMessageContent = ({
  systemEvent,
  currentUserId,
  senderId,
  senderDisplayName,
  JSONcontent,
  className = "",
}: SystemMessageContentProps): JSX.Element | null => {
  const { t } = useTranslation();

  const isMobile = useIsMobile();
  if (!systemEvent) return null;

  const text = getSystemMessageText({
    t,
    systemEvent,
    currentUserId,
    senderId,
    senderDisplayName,
    JSONcontent,
    isMobile,
  });

  const messageColor = getSystemMessageColor(systemEvent);

  return (
    <div
      className={`flex gap-1 items-center text-sm truncate ${messageColor} ${className}`}
    >
      <SystemMessageIcon systemEvent={systemEvent} />
      <span className="truncate">{text}</span>
    </div>
  );
};
