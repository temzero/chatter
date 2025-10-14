import React from "react";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { formatDurationByStartAndEnd } from "@/utils/formatDuration";
import { formatTime } from "@/utils/formatTime";
import { useTranslation } from "react-i18next";
import { CallLiteResponse } from "@/shared/responses/callLite.response";
interface BroadcastMessageProps {
  call: CallLiteResponse;
}

export const BroadcastMessage: React.FC<BroadcastMessageProps> = ({ call }) => {
  const { t } = useTranslation();
  const { status, startedAt, endedAt } = call;
  const isActive = status === CallStatus.IN_PROGRESS;
  const isError = status === CallStatus.FAILED;

  return (
    <div
      className={`w-full bg-[--message-color] flex items-center justify-between gap-3 p-2 rounded-lg shadow-sm truncate ${
        isError && "text-red-500"
      }`}
    >
      {/* Icon */}
      <div className="flex gap-2 items-center opacity-70">
        {isError && <span className="material-symbols-outlined">error</span>}
        <span className="material-symbols-outlined">connected_tv</span>
        {t("system.broadcast_message.broadcasted")}{" "}
        {isError && t("common.messages.failed")}
      </div>

      {/* Text */}
      <div className="flex items-center text-sm opacity-70 gap-2">
        {isActive ? (
          <span className="font-medium text-red-600">
            🔴 {t("system.broadcast_message.live_now")}
            <span className="ml-1">
              •{" "}
              {t("system.broadcast_message.started_at", {
                time: new Date(startedAt).toLocaleTimeString(),
              })}
            </span>
          </span>
        ) : (
          <>
            {startedAt && endedAt && (
              <span className="">
                ⏱️{formatDurationByStartAndEnd(startedAt, endedAt)}
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
