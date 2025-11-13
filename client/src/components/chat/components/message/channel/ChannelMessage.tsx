import React, { useState, useRef } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useMessageStore } from "@/stores/messageStore";
import { MessageReactionDisplay } from "@/components/ui/messages/MessageReactionsDisplay";
import { formatTime } from "@/common/utils/format/formatTime";
import { getCurrentUserId } from "@/stores/authStore";
import { handleQuickReaction } from "@/common/utils/message/quickReaction";
import { scrollToMessageById } from "@/common/utils/message/scrollToMessageById";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageHorizontalPreviewTypes } from "@/common/enums/MessageHorizontalPreviewTypes";
import { ChannelCallMessageContent } from "./ChannelCallMessageContent";
import { useIsMobile } from "@/stores/deviceStore";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  setOpenFocusMessageModal,
} from "@/stores/modalStore";
import { messageAnimations } from "@/common/animations/messageAnimations";
import SystemMessage from "../SystemMessage";
import ChannelMessageContent from "./ChannelMessageContent";
import ChannelMessageBubbleWrapper from "../wrapper/ChannelMessageBubbleWrapper";
import { SystemMessageJSONContent } from "../../../../ui/messages/content/SystemMessageContent";
import { MessageHorizontalPreview } from "../preview/MessageHorizontalPreview";
import { MessageReadInfo } from "@/components/chat/messagesContainer/MessageReadInfo";
import logger from "@/common/utils/logger";
import { MessageContextMenu } from "@/components/ui/contextMenu/Message-contextMenu";

interface ChannelMessageProps {
  messageId: string;
}

const ChannelMessage: React.FC<ChannelMessageProps> = ({ messageId }) => {
  const message = useMessageStore((state) => state.messagesById[messageId]);

  const isMobile = useIsMobile();
  const currentUserId = getCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const isReplyToThisMessage = useIsReplyToThisMessage(message.id);
  const isFocus = useIsMessageFocus(message.id);
  const repliedMessage = message.replyToMessage;

  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open your existing modal
    setOpenFocusMessageModal(message.id);
    // Set position for reaction picker
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };

  if (!currentUserId) {
    logger.error("Not authenticated");
    return;
  }

  // Check system message
  const isSystemMessage = !!message.systemEvent;
  if (isSystemMessage) {
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

      <ChannelMessageBubbleWrapper
        message={message}
        onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
        onContextMenu={handleContextMenu}
      >
        {message.call ? (
          <ChannelCallMessageContent call={message.call} />
        ) : (
          <ChannelMessageContent
            message={message}
            currentUserId={currentUserId}
            isMe={isMe}
          />
        )}
        <MessageReactionDisplay
          isChannel={true}
          currentUserId={currentUserId}
          messageId={message.id}
          chatId={message.chatId}
        />

        <div
          className="absolute bottom-1 right-1 text-xs italic opacity-0 group-hover:opacity-80 font-semibold bg-[--sidebar-color] p-0.5 px-1.5 rounded-full backdrop-blur-lg"
          style={{ zIndex: 1 }}
        >
          {formatTime(message.createdAt)}
        </div>
      </ChannelMessageBubbleWrapper>

      <AnimatePresence>
        {isFocus && !isReplyToThisMessage && (
          <MessageContextMenu
            message={message}
            isMe={isMe}
            isChannel={true}
            isSystemMessage={!!message.call}
            initialMousePosition={contextMenuPosition ?? undefined}
            onClose={closeContextMenu}
          />
        )}
      </AnimatePresence>

      {/* ✅ Added Read Info Section */}
      {message.status !== MessageStatus.SENDING &&
        message.status !== MessageStatus.FAILED && (
          <MessageReadInfo
            chatId={message.chatId}
            currentUserId={currentUserId}
            messageId={message.id}
            isMe={isMe}
            senderName={message.sender.displayName}
          />
        )}

      {message.status === MessageStatus.FAILED && (
        <h1 className="text-red-500 text-sm text-center">
          Failed to send message
        </h1>
      )}
    </motion.div>
  );
};

export default ChannelMessage;
