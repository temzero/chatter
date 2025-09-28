import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { MessageStatus } from "@/types/enums/message";
import { MessageResponse } from "@/types/responses/message.response";
import { CallStatus } from "@/types/enums/CallStatus";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { getCallColor, getCallIcon, getCallText } from "@/utils/callHelpers";

interface CallMessageBubbleProps {
  message: MessageResponse;
  isMe: boolean;
  isRelyToThisMessage?: boolean;
  currentUserId?: string;
}

const CallMessageBubble: React.FC<CallMessageBubbleProps> = ({
  message,
  isMe,
  isRelyToThisMessage,
}) => {
  const openModal = useModalStore((state) => state.openModal);
  const call = message.call;
  if (!call) return null;

  function onJoinCall(callId: string) {
    console.log("Joining call:", callId);
  }

  // call.status = CallStatus.DIALING; // Default to IN_PROGRESS if status is missing

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
      onClick={() =>
        call.status === CallStatus.DIALING
          ? openModal(ModalType.CALL, {
              id: call.id,
              chatId: message.chatId,
            })
          : undefined
      }
    >
      {/* 🔹 Static row */}
      <div className="flex gap-1 items-center p-2 pl-3">
        {/* 🔹 Icon animates */}
        <motion.span
          className={clsx(
            "material-symbols-outlined text-3xl",
            getCallColor(call.status)
          )}
          animate={
            call.status === CallStatus.DIALING
              ? { x: [-2, 2, -2, 2, 0], scale: [1, 1.05, 1] } // shake + bounce
              : call.status === CallStatus.IN_PROGRESS
              ? { opacity: [1, 0.4, 1] } // pulse
              : { x: 0, scale: 1, opacity: 1 }
          }
          transition={
            call.status === CallStatus.DIALING
              ? {
                  x: { duration: 0.4, repeat: Infinity, repeatDelay: 0.4 },
                  scale: { duration: 0.2, repeat: Infinity, repeatDelay: 0.4 },
                }
              : call.status === CallStatus.IN_PROGRESS
              ? { duration: 1.2, repeat: Infinity }
              : { duration: 0 }
          }
        >
          {getCallIcon(call.status)}
        </motion.span>

        {/* 🔹 Text (static) */}
        <p
          className={clsx(
            "text-sm font-medium text-center",
            getCallColor(call.status)
          )}
        >
          {getCallText(call.status, call.startedAt, call.endedAt)}
        </p>
      </div>

      {/* 🔹 Join button */}
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
