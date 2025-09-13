import React from "react";
import clsx from "clsx";
import { MessageStatus } from "@/types/enums/message";
import { MessageResponse } from "@/types/responses/message.response";
import { CallStatus } from "@/types/enums/CallStatus";

interface CallMessageBubbleProps {
  message: MessageResponse;
  isMe: boolean;
  isRelyToThisMessage?: boolean;
  currentUserId?: string;
  onJoinCall?: (callId: string) => void;
  onCallAgain?: (chatId: string) => void;
}

const CallMessageBubble: React.FC<CallMessageBubbleProps> = ({
  message,
  isMe,
  isRelyToThisMessage,
  onJoinCall,
}) => {
  const call = message.call;
  if (!call) return null;
  // call.status = CallStatus.MISSED; // Default to FAILED if status is missing

  // 🔹 Format duration from ms → "Xs", "1m12s", "1h20m"
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h${minutes}m`; // e.g., "1h20m"
    }
    if (minutes > 0) {
      return `${minutes}m${seconds}s`; // e.g., "1m12s"
    }
    return `${seconds}s`; // e.g., "8s"
  };

  const getCallText = () => {
    switch (call.status) {
      case CallStatus.DIALING:
        return "Calling...";
      case CallStatus.IN_PROGRESS:
        return "Call in progress";
      case CallStatus.COMPLETED: {
        if (call.startedAt && call.endedAt) {
          const duration =
            new Date(call.endedAt).getTime() -
            new Date(call.startedAt).getTime();
          return `Call ended • ${formatDuration(duration)}`;
        }
        return "Call ended";
      }
      case CallStatus.DECLINED:
        return "Call was declined";
      case CallStatus.MISSED:
        return "Call was missed";
      case CallStatus.FAILED:
        return "Call failed";
      default:
        return "Call";
    }
  };

  const getCallClass = () => {
    switch (call.status) {
      case CallStatus.DECLINED:
      case CallStatus.COMPLETED:
        return "text-yellow-600";
      case CallStatus.MISSED:
      case CallStatus.FAILED:
        return "text-red-700";
      default:
        return "";
    }
  };

  // 🔹 Map status → icons
  const getCallIcon = () => {
    switch (call.status) {
      case CallStatus.DIALING:
        return "ring_volume"; // ringing icon
      case CallStatus.IN_PROGRESS:
        return "phone_in_talk"; // active call icon
      case CallStatus.COMPLETED:
        return "call_end"; // ended
      case CallStatus.DECLINED:
        return "phone_disabled"; // missed call
      case CallStatus.MISSED:
        return "phone_missed"; // missed call
      case CallStatus.FAILED:
        return "e911_avatar"; // error icon
      default:
        return "call";
    }
  };

  return (
    <div
      className={clsx("message-bubble flex flex-col", {
        "border-4 border-red-500/80": message.isImportant,
        "self-message ml-auto": isMe,
        "message-bubble-reply": isRelyToThisMessage,
        "opacity-60": message.status === MessageStatus.SENDING,
        "opacity-60 border-2 border-red-500":
          message.status === MessageStatus.FAILED,
      })}
      style={{ minWidth: "180px" }}
    >
      <div className="flex gap-1 items-center p-2 pl-3">
        {/* Icon */}
        <span
          className={clsx("material-symbols-outlined text-3xl", getCallClass())}
        >
          {getCallIcon()}
        </span>
        {/* Call status text */}
        <p className={clsx("text-sm font-medium text-center", getCallClass())}>
          {getCallText()}
        </p>
      </div>

      {/* Join button (for other users while call is ongoing) */}
      {call.status === CallStatus.IN_PROGRESS && (
        <div
          onClick={() => onJoinCall?.(call.id)}
          className="text-center p-1 text-blue-700 w-full custom-border-t cursor-pointer hover:text-white hover:bg-blue-600 transition-colors"
        >
          Join Call
        </div>
      )}
    </div>
  );
};

export default CallMessageBubble;
