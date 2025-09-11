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
  onCallAgain,
}) => {
  const call = message.call;
  if (!call) return null;

  // 🔹 Format duration from ms → "mm:ss" or "hh:mm:ss"
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
          return `Call ended • Duration: ${formatDuration(duration)}`;
        }
        return "Call ended";
      }
      case CallStatus.DECLINED:
        return "Call was declined";
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
      case CallStatus.FAILED:
        return "text-red-400"; // 🔴 red for ended/failed
      default:
        return "text-blue-500 dark:text-blue-200";
    }
  };

  return (
    <div
      className={clsx("message-bubble flex flex-col items-center", {
        "border-4 border-red-500/80": message.isImportant,
        "self-message ml-auto": isMe,
        "message-bubble-reply": isRelyToThisMessage,
        "opacity-60": message.status === MessageStatus.SENDING,
        "opacity-60 border-2 border-red-500":
          message.status === MessageStatus.FAILED,
      })}
      style={{ minWidth: "180px" }}
    >
      {/* Call status text */}
      <p className={clsx("text-sm font-medium text-center", getCallClass())}>
        {getCallText()}
      </p>

      {/* Join button (for other users while call is ongoing) */}
      {!isMe && call.status === CallStatus.IN_PROGRESS && (
        <div
          onClick={() => onJoinCall?.(call.id)}
          className="text-center p-1 text-green-500 hover:text-green-600 w-full custom-border-t"
        >
          Join Call
        </div>
      )}

      {/* Call again button (for me after call ends) */}
      {isMe && call.status === CallStatus.COMPLETED && (
        <div
          onClick={() => onCallAgain?.(message.chatId)}
          className="text-center p-1 text-blue-500 w-full custom-border-t"
        >
          Call Again
        </div>
      )}
    </div>
  );
};

export default CallMessageBubble;
