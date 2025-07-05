// components/ui/MessageReplyPreview.tsx
import React from "react";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatType } from "@/types/enums/ChatType";
import { Avatar } from "./avatar/Avatar";
import classNames from "classnames";
import { scrollToMessageById } from "@/utils/scrollToMessageById";

interface MessageReplyPreviewProps {
  replyMessage: MessageResponse;
  chatType: ChatType;
  isMe: boolean;
  currentUserId: string;
  senderId: string;
  isHidden:boolean;
}

const MessageReplyPreview: React.FC<MessageReplyPreviewProps> = ({
  replyMessage,
  chatType = ChatType.DIRECT,
  isMe = false,
  currentUserId,
  senderId,
  isHidden = false,
}) => {
  if (!replyMessage) return null;
  const isSelfReply = replyMessage.sender.id === senderId;
  const isReplyToMe = replyMessage.sender.id === currentUserId;
  const isNotDirectChat = chatType !== ChatType.DIRECT;

  return (
    <div
      className={classNames("relative flex items-start w-full -mb-2", {
        "items-start": isReplyToMe,
        "items-end": !isReplyToMe,
        "opacity-0": isHidden,
      })}
    >
      <div
        className={classNames(
          "opacity-60 hover:opacity-90 scale-[0.8] hover:scale-100 transition-all",
          {
            "ml-auto origin-bottom-right": isReplyToMe,
            "origin-bottom-left": !isReplyToMe,
            "translate-x-4": !isMe && isReplyToMe,
            "-translate-x-4": !isSelfReply,
          }
        )}
      >
        <div
          onClick={() =>
            scrollToMessageById(replyMessage.id, { smooth: false })
          }
          className={classNames("message-bubble", {
            "self-message ": isReplyToMe,
          })}
        >
          {replyMessage.forwardedFromMessage ? (
            <div className="truncate opacity-80 flex gap-2 items-center">
              {isSelfReply ? (
                <>
                  <p className="flex items-center gap-2">
                    {replyMessage.forwardedFromMessage?.content}
                    <span className="material-symbols-outlined -rotate-90">
                      arrow_warm_up
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined rotate-90">
                      arrow_warm_up
                    </span>
                    {replyMessage.forwardedFromMessage?.content}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="truncate opacity-80">
              {replyMessage.attachments &&
                replyMessage.attachments.length > 0 && <p>{"[Attachment]"}</p>}
              {replyMessage.content && (
                <p className={`truncate`}>{replyMessage.content}</p>
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
            className={classNames(
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
            className={classNames(
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
