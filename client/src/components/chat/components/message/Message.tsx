import React, { useRef, useMemo } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { motion } from "framer-motion";
import { getMessageAnimation } from "@/common/animations/messageAnimations";
import { MESSAGE_AVATAR_WIDTH } from "@/common/constants/messageAvatarDimension";
import { SystemMessageJSONContent } from "../../../ui/messages/content/SystemMessageContent";
import { CallMessageContent } from "../../../ui/messages/content/CallMessageContent";
import MessageBubbleWrapper from "./wrapper/MessageBubbleWrapper";
import { useIsMobile } from "@/stores/deviceStore";
import { useReadInfo } from "@/stores/settingsStore";
import MessageReplyPreview from "@/components/ui/messages/MessageReplyPreview";
import SystemMessage from "./SystemMessage";
import MessageContent from "../../../ui/messages/content/MessageContent";
import MessageInfo from "./MessageInfo";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { getMessageWidth } from "@/common/utils/message/getMessageWidth";
import { useMessageData } from "@/common/hooks/message/useMessageData";

interface MessageProps {
  messageId: string;
  currentUserId: string;
  chatType?: ChatType;
  showInfo?: boolean;
  isRecent?: boolean;
  isRead?: boolean;
  readUserAvatars?: string[];
  isMe: boolean;
  disableAnimation?: boolean;
}

const Message: React.FC<MessageProps> = ({
  messageId,
  currentUserId,
  chatType = ChatType.DIRECT,
  showInfo = true,
  isRecent = false,
  isMe = false,
  disableAnimation = false,
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const readInfoSetting = useReadInfo();

  // ✅ Use the hook to get all message data
  const messageData = useMessageData({
    messageId,
    currentUserId,
  });

  const messageAnimation = useMemo(() => {
    if (disableAnimation) return;
    const messageFromData = messageData?.message;
    return getMessageAnimation(
      isMe,
      messageFromData?.status === MessageStatus.SENDING,
      // false,
    );
  }, [isMe, messageData?.message, disableAnimation]);

  // Early return if messageData is null
  if (!messageData) {
    return null;
  }

  // Destructure all the data from the hook
  const {
    message,
    sender,
    senderDisplayName,
    attachments,
    attachmentLength,
    hasLinkPreview,
    isVisible,
    isFocus,
    isReplyToThisMessage,
  } = messageData;

  // System message check
  if (message?.systemEvent) {
    return (
      <div className="w-full flex items-center justify-center">
        <SystemMessage
          message={message}
          systemEvent={message.systemEvent}
          senderId={sender?.id ?? ""}
          senderDisplayName={senderDisplayName}
          content={message.content as SystemMessageJSONContent}
        />
      </div>
    );
  }

  // Early returns
  if (!message || !isVisible) {
    return null;
  }

  const isGroupChat = chatType === ChatType.GROUP;
  const replyToMessage = message.replyToMessage;
  const call = message.call;

  return (
    <motion.div
      id={`message-${messageId}`}
      ref={messageRef}
      className={clsx(
        "relative flex flex-1 my-0.5",
        isMe ? "justify-end" : "justify-start",
      )}
      style={{ zIndex: isFocus || isReplyToThisMessage ? 100 : "auto" }}
      layout="position"
      {...messageAnimation}
    >
      {isGroupChat && !isMe && (
        <div
          className="mt-auto pb-4"
          style={{
            width: MESSAGE_AVATAR_WIDTH,
            minWidth: MESSAGE_AVATAR_WIDTH,
            marginRight: 8,
          }}
        >
          {!isRecent && (
            <Avatar
              avatarUrl={sender?.avatarUrl}
              name={senderDisplayName}
              className="w-full h-full"
            />
          )}
        </div>
      )}

      <div
        className={clsx(
          "flex flex-col",
          getMessageWidth(isMobile, hasLinkPreview, attachmentLength),
        )}
      >
        <div
          className={clsx("relative flex flex-col transition-all", {
            "scale-(1.1)": isReplyToThisMessage,
            "origin-bottom-right items-end": isMe,
            "origin-bottom-left items-start": !isMe,
          })}
        >
          {replyToMessage && (
            <MessageReplyPreview
              replyMessage={replyToMessage}
              chatType={chatType}
              isMe={isMe}
              currentUserId={currentUserId}
              senderId={sender?.id ?? ""}
              isHidden={isFocus}
            />
          )}

          <MessageBubbleWrapper
            message={message}
            isMe={isMe}
            isReplyToThisMessage={isReplyToThisMessage}
            isFocus={isFocus}
            idDisplayTail={!isRecent}
          >
            {call ? (
              <CallMessageContent
                call={call}
                message={message}
                className="justify-between p-2 pl-3"
                iconClassName="text-3xl"
                textClassName="font-medium"
              />
            ) : (
              <MessageContent
                isMe={isMe}
                message={message}
                attachments={attachments}
              />
            )}
          </MessageBubbleWrapper>
        </div>

        <MessageInfo
          message={message}
          isMe={isMe}
          isRecent={isRecent}
          isGroupChat={isGroupChat}
          senderDisplayName={senderDisplayName}
          showInfo={showInfo}
          readInfoSetting={readInfoSetting}
          currentUserId={currentUserId}
        />
      </div>
    </motion.div>
  );
};

export default React.memo(Message);
