import React from "react";
import { CallResponseDto } from "@/types/responses/call.response";
import { CallStatus } from "@/types/enums/CallStatus";
import { formatDurationByStartAndEnd } from "@/utils/formatDuration";
import { formatTime } from "@/utils/formatTime";
interface BroadcastMessageProps {
  call: CallResponseDto;
}

export const BroadcastMessage: React.FC<BroadcastMessageProps> = ({ call }) => {
  const { status, startedAt, endedAt } = call;
  const isActive = status === CallStatus.IN_PROGRESS;
  const isError = status === CallStatus.FAILED;

  return (
    <div
      className={`w-full bg-[--message-color] flex items-center justify-between gap-3 p-2 rounded-lg shadow-sm ${
        isError && "text-red-500"
      }`}
    >
      {/* Icon */}
      <div className="flex gap-2 items-center opacity-70">
        {isError && <span className="material-symbols-outlined">error</span>}
        <span className="material-symbols-outlined">connected_tv</span>
        Broadcasted {isError && "Failed"}
      </div>

      {/* Text */}
      <div className="flex items-center text-sm opacity-70 gap-2">
        {isActive ? (
          <span className="font-medium text-red-600">
            🔴 Live now
            <span className="ml-1">
              • Started {new Date(startedAt).toLocaleTimeString()}
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
