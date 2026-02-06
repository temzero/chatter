import React, { useRef, useMemo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
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
import { useMessageData } from "@/common/hooks/message/useMessageData";
import { formatTime } from "@/common/utils/format/formatTime";
import { getChannelMessageWidth } from "@/common/utils/message/getMessageWidth";

interface ChannelMessageProps {
  messageId: string;
}

const ChannelMessage: React.FC<ChannelMessageProps> = ({ messageId }) => {
  const currentUserId = getCurrentUserId();

  // ✅ Use the hook to get all message data
  const messageData = useMessageData({
    messageId,
    currentUserId: currentUserId || "",
  });

  const isMobile = useIsMobile();

  const isReplyToThisMessage = useIsReplyToThisMessage(messageId);
  const isFocus = useIsMessageFocus(messageId);

  const messageRef = useRef<HTMLDivElement>(null);

  const systemMessageAnimation = useMemo(() => {
    const messageFromData = messageData?.message;
    if (!messageFromData) return;
    return getSystemMessageAnimation(
      messageFromData.status === MessageStatus.SENDING,
    );
  }, [messageData?.message]);

  // Early return if no message data
  if (!messageData || !currentUserId) {
    console.error("Not authenticated or message not found");
    return null;
  }

  // Destructure the data from the hook
  const { message, senderDisplayName, attachments, isVisible, isMe } =
    messageData;

  // console.log("ChannelMessage:", message);

  // Check system message
  const isSystemMessage = !!message.systemEvent;
  if (isSystemMessage) {
    return (
      <SystemMessage
        message={message}
        systemEvent={message.systemEvent}
        senderId={message.sender.id}
        senderDisplayName={senderDisplayName}
        content={message.content as SystemMessageJSONContent}
      />
    );
  }

  // Early return for invisible messages
  if (!message || !isVisible) {
    return null;
  }

  const replyToMessage = message.replyToMessage;
  const call = message.call;

  return (
    <motion.div
      key={message.id}
      ref={messageRef}
      id={`message-${message.id}`}
      className={clsx(
        "relative group mb-4 min-",
        getChannelMessageWidth(isReplyToThisMessage, isMobile),
      )}
      style={{
        zIndex: isFocus ? 100 : "auto",
      }}
      layout="position"
      {...systemMessageAnimation}
    >
      {replyToMessage && (
        <div
          onClick={() =>
            replyToMessage?.id && scrollToMessageById(replyToMessage.id)
          }
          className="w-[90%] mx-auto bg-(--panel-color) text-xs rounded-t-xl cursor-pointer p-2 pb-0 opacity-80 hover:opacity-100 custom-border"
        >
          <MessageHorizontalPreview
            message={replyToMessage}
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
        {call ? (
          <ChannelCallMessageContent message={message} call={call} />
        ) : (
          <ChannelMessageContent
            message={message}
            attachments={attachments}
            isMe={isMe}
          />
        )}
        <div
          className="absolute -bottom-2 -right-1 text-xs italic opacity-0 group-hover:opacity-80 font-semibold bg-(--background-color) p-0.5 px-1.5 rounded-full! backdrop-blur"
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
            senderName={senderDisplayName}
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
