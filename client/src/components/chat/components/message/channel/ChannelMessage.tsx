import React, { useRef, useMemo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useMessageStore } from "@/stores/messageStore";
import { formatTime } from "@/common/utils/format/formatTime";
import { getCurrentUserId } from "@/stores/authStore";
import { scrollToMessageById } from "@/common/utils/message/scrollToMessageById";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageHorizontalPreviewTypes } from "@/common/enums/MessageHorizontalPreviewTypes";
import { ChannelCallMessageContent } from "./ChannelCallMessageContent";
import { useIsMobile } from "@/stores/deviceStore";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
} from "@/stores/modalStore";
import { getSystemMessageAnimation } from "@/common/animations/messageAnimations";
import SystemMessage from "../SystemMessage";
import ChannelMessageContent from "./ChannelMessageContent";
import { SystemMessageJSONContent } from "../../../../ui/messages/content/SystemMessageContent";
import { MessageHorizontalPreview } from "../preview/MessageHorizontalPreview";
import { MessageReadInfo } from "@/components/chat/messagesContainer/MessageReadInfo";
import MessageBubbleWrapper from "../wrapper/MessageBubbleWrapper";

interface ChannelMessageProps {
  messageId: string;
}

const ChannelMessage: React.FC<ChannelMessageProps> = ({ messageId }) => {
  const message = useMessageStore((state) => state.messagesById[messageId]);
  console.log("ChannelMessage:", message);

  const isMobile = useIsMobile();
  const currentUserId = getCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const isReplyToThisMessage = useIsReplyToThisMessage(message.id);
  const isFocus = useIsMessageFocus(message.id);
  const repliedMessage = message.replyToMessage;

  const messageRef = useRef<HTMLDivElement>(null);

  const systemMessageAnimation = useMemo(() => {
    if (!message) return;
    return getSystemMessageAnimation(message.status === MessageStatus.SENDING);
  }, [message]);

  if (!currentUserId) {
    console.error("Not authenticated");
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
        "w-[64%]": !isMobile,
        "w-[90%]": isMobile,
      })}
      style={{
        zIndex: isFocus ? 100 : "auto",
      }}
      layout="position"
      {...systemMessageAnimation}
    >
      {repliedMessage && (
        <div
          onClick={() => scrollToMessageById(repliedMessage.id)}
          className="w-[90%] mx-auto bg-(--panel-color) text-xs rounded-t-xl cursor-pointer p-2 pb-0 opacity-80 hover:opacity-100 custom-border"
        >
          <MessageHorizontalPreview
            message={repliedMessage}
            chatType={ChatType.CHANNEL}
            type={MessageHorizontalPreviewTypes.REPLY_CHANNEL_MESSAGE}
          />
        </div>
      )}

      <MessageBubbleWrapper
        message={message}
        isChannel={true}
        isReplyToThisMessage={isReplyToThisMessage}
        isFocus={isFocus}
        className="border-3!"
      >
        {message.call ? (
          <ChannelCallMessageContent message={message} call={message.call} />
        ) : (
          <ChannelMessageContent
            message={message}
            currentUserId={currentUserId}
            isMe={isMe}
          />
        )}
        <div
          className="absolute bottom-1 right-1 text-xs italic opacity-0 group-hover:opacity-80 font-semibold bg-(--panel-color) p-0.5 px-1.5 rounded-full! backdrop-blur"
          style={{ zIndex: 1 }}
        >
          {formatTime(message.createdAt)}
        </div>
      </MessageBubbleWrapper>

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
