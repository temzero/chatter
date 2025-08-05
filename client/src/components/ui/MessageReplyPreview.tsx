// components/ui/MessageReplyPreview.tsx
import React from "react";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatType } from "@/types/enums/ChatType";
import { Avatar } from "./avatar/Avatar";
import clsx from "clsx";
import { scrollToMessageById } from "@/utils/scrollToMessageById";
import RenderMultipleAttachments from "./RenderMultipleAttachments";
import { useModalStore } from "@/stores/modalStore";
import {
  SystemMessageContent,
  SystemMessageJSONContent,
} from "./SystemMessageContent";

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
  const closeModal = useModalStore((state) => state.closeModal);
  if (!replyMessage) return null;

  const isSelfReply = replyMessage.sender.id === senderId;
  const isReplyToMe = replyMessage.sender.id === currentUserId;
  const isNotDirectChat = chatType !== ChatType.DIRECT;
  const isSystemMessage = !!replyMessage.systemEvent;

  return (
    <div
      onClick={closeModal}
      className={clsx("relative flex items-start -mb-2", {
        "items-start": isReplyToMe,
        "items-end": !isReplyToMe,
        "opacity-60": isHidden,
      })}
    >
      <div
        className={clsx("opacity-60 scale-[0.8] transition-all", {
          "ml-auto origin-bottom-right": isReplyToMe,
          "origin-bottom-left": !isReplyToMe,
          "translate-x-4": !isMe && isReplyToMe,
          "-translate-x-4": !isSelfReply,
          "[&>*]:pointer-events-none": isHidden,
          "hover:opacity-90 hover:scale-100 ": !isHidden,
        })}
      >
        <div
          onClick={() =>
            scrollToMessageById(replyMessage.id, { smooth: false })
          }
          className={clsx("message-bubble", {
            "self-message": isReplyToMe,
          })}
        >
          {replyMessage.forwardedFromMessage ? (
            <div className="truncate opacity-80 flex gap-2 items-center">
              {isSelfReply ? (
                <p className="flex items-center gap-2">
                  {replyMessage.forwardedFromMessage?.content}
                  <span className="material-symbols-outlined -rotate-90">
                    arrow_warm_up
                  </span>
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined rotate-90">
                    arrow_warm_up
                  </span>
                  {replyMessage.forwardedFromMessage?.content}
                </p>
              )}
            </div>
          ) : (
            <div className="opacity-80 pointer-events-none max-w-[300px] max-h-[500px]">
              {replyMessage.attachments && (
                <RenderMultipleAttachments
                  attachments={replyMessage.attachments}
                />
              )}

              {isSystemMessage ? (
                <SystemMessageContent
                  systemEvent={replyMessage.systemEvent}
                  currentUserId={currentUserId}
                  senderId={replyMessage.sender.id}
                  senderDisplayName={replyMessage.sender.displayName}
                  JSONcontent={replyMessage.content as SystemMessageJSONContent}
                  ClassName="gap-1"
                />
              ) : (
                replyMessage.content && (
                  <p className="">{replyMessage.content}</p>
                )
              )}
            </div>
          )}

          {isNotDirectChat && !isSelfReply && !isReplyToMe && (
            <div className="flex items-center p-1 gap-1 custom-border-t">
              <Avatar
                avatarUrl={replyMessage.sender.avatarUrl}
                name={replyMessage.sender.displayName}
                size="8"
              />
              <h1 className="font-semibold">
                {replyMessage.sender.displayName}
              </h1>
            </div>
          )}
        </div>

        {/* Display Reply Icon */}
        {isSelfReply ? (
          <span
            className={clsx(
              "material-symbols-outlined text-2xl rotate-180 absolute",
              {
                "-bottom-[16px] -right-[20px] scale-x-[-1]": isMe,
                "-bottom-[16px] -left-[20px]": !isMe,
              }
            )}
          >
            undo
          </span>
        ) : (
          <span
            className={clsx(
              "material-symbols-outlined text-2xl absolute z-50 rotate-180",
              {
                "-bottom-[16px] -left-[5px]": isMe,
                "-bottom-[16px] -right-[5px] scale-x-[-1]": !isMe,
              }
            )}
          >
            reply
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(MessageReplyPreview);
