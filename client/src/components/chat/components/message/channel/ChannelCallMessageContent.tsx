import * as React from "react";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { formatDurationByStartAndEnd } from "@/common/utils/format/formatDuration";
import { formatTime } from "@/common/utils/format/formatTime";
import { useTranslation } from "react-i18next";
import { CallLiteResponse } from "@/shared/types/responses/call-lite.response";
import CallIcon from "@/components/ui/icons/CallIcon";
import { handleQuickReaction } from "@/common/utils/message/quickReaction";
import { MessageResponse } from "@/shared/types/responses/message.response";

interface BroadcastMessageProps {
  call: CallLiteResponse;
  message: MessageResponse;
}

export const ChannelCallMessageContent: React.FC<BroadcastMessageProps> = ({
  call,
  message,
}) => {
  const { t } = useTranslation();
  const { status, startedAt, endedAt } = call;
  const isActive = status === CallStatus.IN_PROGRESS;
  const isError = status === CallStatus.FAILED;

  return (
    <div
      onDoubleClick={() =>
        message && handleQuickReaction(message.id, message.chatId)
      }
      className={`w-full rounded-xl bg-(--message-color) flex items-center justify-between gap-3 p-2 shadow-sm truncate ${
        isError && "text-red-500"
      }`}
    >
      {/* Icon */}
      <div className="flex gap-2 items-center opacity-70">
        <CallIcon
          status={call.status}
          isBroadcast={true}
          className="text-2xl shrink-0"
        />

        {isError
          ? t("common.messages.failed")
          : t("system_message.broadcast_message.broadcasted")}
      </div>

      {/* Text */}
      <div className="flex items-center text-sm opacity-70 gap-2">
        {isActive ? (
          <span className="font-medium text-red-600">
            🔴 {t("system_message.broadcast_message.live_now")}
            <span className="ml-1">
              •{" "}
              {t("system_message.broadcast_message.started_at", {
                time: new Date(startedAt).toLocaleTimeString(),
              })}
            </span>
          </span>
        ) : (
          <>
            {startedAt && endedAt && (
              <span className="">
                ⏱️{formatDurationByStartAndEnd(t, startedAt, endedAt)}
                <span className="ml-2">|</span>
              </span>
            )}
            <p className="flex gap-1">
              {endedAt ? formatTime(endedAt) : "???"}
              <span>-</span>
              {startedAt ? formatTime(startedAt) : "???"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
