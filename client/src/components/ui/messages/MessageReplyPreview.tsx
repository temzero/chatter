// components/ui/MessageReplyPreview.tsx
import * as React from "react";
import clsx from "clsx";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { scrollToMessageById } from "@/common/utils/message/scrollToMessageById";
import { getCloseModal } from "@/stores/modalStore";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import {
  SystemMessageContent,
  SystemMessageJSONContent,
} from "@/components/ui/messages/content/SystemMessageContent";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";

interface MessageReplyPreviewProps {
  replyMessage: MessageResponse;
  chatType: ChatType;
  isMe: boolean;
  currentUserId: string;
  senderId: string;
  isHidden: boolean;
}

const MessageReplyPreview: React.FC<MessageReplyPreviewProps> = ({
  replyMessage,
  chatType = ChatType.DIRECT,
  isMe = false,
  currentUserId,
  senderId,
  isHidden = false,
}) => {
  const closeModal = getCloseModal();
  if (!replyMessage) return null;

  const isSelfReply = replyMessage.sender.id === senderId;
  const isReplyToMe = replyMessage.sender.id === currentUserId;
  const isNotDirectChat = chatType !== ChatType.DIRECT;
  const isSystemMessage = !!replyMessage.systemEvent;
  const isChannel = (chatType = ChatType.CHANNEL);

  let attachments = replyMessage.attachments;
  if (!attachments) {
    attachments = getMessageAttachments(replyMessage.chatId ,replyMessage.id);
  }
  const attachmentLength = attachments?.length || 0;

  return (
    <div
      onClick={closeModal}
      className={clsx(
        "relative flex -mb-2 mx-5 text-xs opacity-60 hover:opacity-90",
        {
          "opacity-30": isHidden,
          "max-w-[50%]": attachmentLength === 1,
        }
      )}
    >
      <div
        onClick={() => scrollToMessageById(replyMessage.id, { smooth: false })}
        className={clsx("message-bubble", {
          "self-message": !isChannel && isReplyToMe,
          "p-1.5 custom-border": isSystemMessage,
        })}
      >
        {replyMessage.forwardedFromMessage ? (
          <div className="flex gap-2 items-center">
            {isSelfReply ? (
              <p className="reply-text flex items-center gap-2">
                {replyMessage.forwardedFromMessage?.content}
                <span className="material-symbols-outlined -rotate-90">
                  arrow_warm_up
                </span>
              </p>
            ) : (
              <p className="reply-text flex items-center gap-2">
                <span className="material-symbols-outlined rotate-90">
                  arrow_warm_up
                </span>
                {replyMessage.forwardedFromMessage?.content}
              </p>
            )}
          </div>
        ) : (
          <div className="pointer-events-none">
            {attachments && (
              <RenderMultipleAttachments
                attachments={attachments}
                chatId={replyMessage.chatId}
                messageId={replyMessage.id}
              />
            )}

            {isSystemMessage ? (
              <SystemMessageContent
                systemEvent={replyMessage.systemEvent}
                currentUserId={currentUserId}
                senderId={replyMessage.sender.id}
                senderDisplayName={replyMessage.sender.displayName}
                JSONcontent={replyMessage.content as SystemMessageJSONContent}
                className="gap-1"
              />
            ) : (
              replyMessage.content && (
                <p className="truncate reply-text">{replyMessage.content}</p>
              )
            )}
          </div>
        )}

        {isNotDirectChat && !isSelfReply && !isReplyToMe && (
          <div className="flex items-center p-1 gap-1 custom-border-t">
            <Avatar
              avatarUrl={replyMessage.sender.avatarUrl}
              name={replyMessage.sender.displayName}
              size={8}
            />
            <h1 className="font-semibold">{replyMessage.sender.displayName}</h1>
          </div>
        )}
      </div>

      {/* Reply Icon */}
      {!isChannel && (
        <>
          {isSelfReply ? (
            <span
              className={clsx(
                "material-symbols-outlined text-2xl! rotate-180 absolute",
                {
                  "-bottom-4 -right-5 scale-x-[-1]": isMe,
                  "-bottom-4 -left-5": !isMe,
                }
              )}
            >
              undo
            </span>
          ) : (
            <span
              className={clsx(
                "material-symbols-outlined text-2xl! absolute rotate-180",
                {
                  "-bottom-4 -left-[5px]": isMe,
                  "-bottom-4 -right-[5px] scale-x-[-1]": !isMe,
                }
              )}
              style={{ zIndex: 10 }}
            >
              reply
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(MessageReplyPreview);
