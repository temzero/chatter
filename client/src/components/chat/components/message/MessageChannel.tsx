import React, { useState, useRef } from "react";
import clsx from "clsx"; 
import RenderMultipleAttachments from "@/components/ui/RenderMultipleAttachments";
import SystemMessage from "./SystemMessage";
import ForwardedMessagePreview from "@/components/ui/ForwardMessagePreview";
import { motion } from "framer-motion";
import { formatTime } from "@/common/utils/formatTime";
import { SystemMessageJSONContent } from "@/components/ui/SystemMessageContent";
import { useCurrentUserId } from "@/stores/authStore";
import { MessageReactionDisplay } from "@/components/ui/MessageReactionsDisplay";
import { handleQuickReaction } from "@/common/utils/quickReaction";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageHorizontalPreview } from "./MessageHorizontalPreview";
import { scrollToMessageById } from "@/common/utils/scrollToMessageById";
import { MessageHorizontalPreviewTypes } from "@/common/enums/MessageHorizontalPreviewTypes";
import { BroadcastMessage } from "./BroadcastMessage";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { useDeviceStore } from "@/stores/deviceStore";
import type { MessageResponse } from "@/shared/types/responses/message.response";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";

interface ChannelMessageProps {
  message: MessageResponse;
}

const ChannelMessage: React.FC<ChannelMessageProps> = ({ message }) => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const isReplyToThisMessage = useIsReplyToThisMessage(message.id);
  const isFocus = useIsMessageFocus(message.id);
  const repliedMessage = message.replyToMessage;

  const openMessageModal = useModalStore((state) => state.openMessageModal);
  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open your existing modal
    openMessageModal(message.id);
    // Set position for reaction picker
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };
  const attachments = message.attachments ?? [];

  // Check system message
  const isSystemMessage = !!message.systemEvent;
  if (isSystemMessage && message.systemEvent != SystemEventType.CALL) {
    return (
      <SystemMessage
        message={message}
        systemEvent={message.systemEvent}
        senderId={message.sender.id}
        senderDisplayName={message.sender.displayName}
        content={message.content as SystemMessageJSONContent}
      />
    );
  }

  return (
    <motion.div
      key={message.id}
      ref={messageRef}
      id={`message-${message.id}`}
      className={clsx("relative group mb-4", {
        "scale-[1.1]": isReplyToThisMessage,
        "w-[60%]": !isMobile,
        "w-[80%]": isMobile,
      })}
      style={{
        zIndex: isFocus ? 100 : "auto",
      }}
      layout="position"
      {...messageAnimations.SystemMessage}
    >
      {repliedMessage && (
        <div
          onClick={() => scrollToMessageById(repliedMessage.id)}
          className="w-[90%] mx-auto bg-[--sidebar-color] text-xs rounded-t-xl cursor-pointer p-2 pb-0 opacity-80 hover:opacity-100 custom-border"
        >
          <MessageHorizontalPreview
            message={repliedMessage}
            chatType={ChatType.CHANNEL}
            type={MessageHorizontalPreviewTypes.REPLY_CHANNEL_MESSAGE}
          />
        </div>
      )}
      <div
        onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
        onContextMenu={handleContextMenu}
        className={`rounded-xl overflow-hidden ${
          message.isImportant ? "border-4 border-red-500/80" : "custom-border"
        }`}
      >
        {message.call && <BroadcastMessage call={message.call} />}
        {attachments.length > 0 && (
          <div className="rounded overflow-hidden shadow-lg">
            <RenderMultipleAttachments attachments={attachments} />
          </div>
        )}
        {message.content && (
          <p className={clsx("backdrop-blur p-4")}>{message.content}</p>
        )}

        {message.forwardedFromMessage && (
          <ForwardedMessagePreview
            message={message}
            originalSender={message.forwardedFromMessage?.sender}
            currentUserId={currentUserId ?? undefined}
            isMe={isMe}
          />
        )}

        <MessageReactionDisplay
          isChannel={true}
          currentUserId={currentUserId}
          messageId={message.id}
          chatId={message.chatId}
        />

        {isFocus && !isReplyToThisMessage && (
          <MessageContextMenu
            message={message}
            isMe={isMe}
            isChannel={true}
            position={contextMenuPosition || undefined}
            onClose={closeContextMenu}
          />
        )}

        <div
          className="absolute bottom-1 right-1 text-xs italic opacity-0 group-hover:opacity-80 font-semibold bg-[--sidebar-color] p-0.5 px-1.5 rounded-full backdrop-blur-lg"
          style={{ zIndex: 1 }}
        >
          {formatTime(message.createdAt)}
        </div>

        {message.status === MessageStatus.FAILED && (
          <h1 className="text-red-500 text-sm text-center">
            Failed to send message
          </h1>
        )}
      </div>
    </motion.div>
  );
};

export default ChannelMessage;
