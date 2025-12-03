import { JSX } from "react";
import { CallLiteResponse } from "@/shared/types/responses/call-lite.response";
import { getCallStatusText } from "@/common/utils/call/callTextHelpers";
import { getCallStatusColor } from "@/common/utils/call/callHelpers";
import CallIcon from "@/components/ui/icons/CallIcon";
import { useTranslation } from "react-i18next";
import { handleQuickReaction } from "@/common/utils/message/quickReaction";
import { MessageResponse } from "@/shared/types/responses/message.response";

type CallMessageContentProps = {
  call: CallLiteResponse;
  message: MessageResponse;
  isBroadcast?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

export const CallMessageContent = ({
  call,
  message,
  isBroadcast = false,
  className = "",
  iconClassName = "",
  textClassName = "",
}: CallMessageContentProps): JSX.Element => {
  const { t } = useTranslation();

  const text = getCallStatusText(t, call.status, call.startedAt, call.endedAt);
  const messageColor = getCallStatusColor(call.status);

  return (
    <div
      className={`flex gap-2 items-center text-sm truncate ${messageColor} ${className}`}
      onDoubleClick={() =>
        message && handleQuickReaction(message.id, message.chatId)
      }
    >
      <CallIcon
        status={call.status}
        isBroadcast={isBroadcast}
        className={iconClassName}
      />
      <p className={textClassName}>{text}</p>
    </div>
  );
};
