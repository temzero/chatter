import React from "react";
import clsx from "clsx";
import { MessageStatus } from "@/types/enums/message";
import { MessageResponse } from "@/types/responses/message.response";
import { CallStatus } from "@/types/enums/CallStatus";
import { Button } from "@/components/ui/Button";

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

  const getCallText = () => {
    switch (call.status) {
      case CallStatus.DIALING:
        return "Calling...";
      case CallStatus.IN_PROGRESS:
        return "Call in progress";
      case CallStatus.COMPLETED:
        return "Call ended";
      case CallStatus.DECLINED:
        return "Call was declined";
      case CallStatus.FAILED:
        return "Call failed";
      default:
        return "Call";
    }
  };

  return (
    <div
      className={clsx("message-bubble flex flex-col items-center gap-2", {
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
      <p className="text-sm font-medium text-center text-blue-700 dark:text-blue-200">
        {getCallText()}
      </p>

      {/* Join button (for other users while call is ongoing) */}
      {!isMe && call.status === CallStatus.IN_PROGRESS && (
        <Button
          size="sm"
          onClick={() => onJoinCall?.(call.id)}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          Join Call
        </Button>
      )}

      {/* Call again button (for me after call ends) */}
      {isMe && call.status === CallStatus.COMPLETED && (
        <Button
          size="sm"
          onClick={() => onCallAgain?.(message.chatId)}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Call Again
        </Button>
      )}
    </div>
  );
};

export default CallMessageBubble;
