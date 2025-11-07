import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import {
  getCallColor,
  getCallIcon,
  getCallText,
} from "@/common/utils/call/callHelpers";
import { callAnimations } from "@/common/animations/callAnimations";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const openModal = getOpenModal();
  const call = message.call;
  if (!call) return null;

  const motionProps =
    call.status === CallStatus.DIALING
      ? callAnimations.incomingActionButton() // shake + bounce
      : call.status === CallStatus.IN_PROGRESS
      ? callAnimations.titlePulse() // pulse
      : {
          animate: { x: 0, scale: 1, opacity: 1 },
          transition: { duration: 0 },
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
          {...motionProps}
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
          {getCallText(call.status, call.startedAt, call.endedAt, t)}
        </p>
      </div>
    </div>
  );
};

export default CallMessageBubble;
