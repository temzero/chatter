import React, { useMemo, useEffect } from "react";
import Message from "../Message";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatResponse } from "@/types/responses/chat.response";
import { useCurrentUser } from "@/stores/authStore";
import { useActiveMembers } from "@/stores/chatMemberStore";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/utils/messageHelpers";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";

interface ChatMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chat, messages }) => {
  const chatId = chat?.id;
  const currentUser = useCurrentUser();
  const rawMembers = useActiveMembers();
  const members = useMemo(() => rawMembers || [], [rawMembers]);
  // console.log("Messages: ", messages);
  const myMember = useMemo(
    () => members.find((m) => m.id === chat.myMemberId),
    [members, chat.myMemberId]
  );

  const otherMembers = useMemo(
    () => members.filter((m) => m.id !== chat.myMemberId),
    [members, chat.myMemberId]
  );

  const myLastReadMessageId = myMember?.lastReadMessageId ?? null;

  // Mark the last message as read if it's from another user and unread
  useEffect(() => {
    if (!chatId || !chat.myMemberId || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isUnread =
      myLastReadMessageId === null || lastMessage.id !== myLastReadMessageId;

    const isFromOther = lastMessage.sender.id !== currentUser?.id;

    if (isUnread && isFromOther) {
      const timer = setTimeout(() => {
        chatWebSocketService.messageRead(
          chatId,
          chat.myMemberId,
          lastMessage.id
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [chatId, chat.myMemberId, messages, myLastReadMessageId, currentUser?.id]);

  const messagesByDate = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
        No messages yet!
      </div>
    );
  }

  return (
    <>
      {messagesByDate.map((group) => (
        <React.Fragment key={`${group.date}-${chatId}`}>
          <div className="sticky top-0 z-20 flex justify-center">
            <div className="bg-[var(--background-color)] text-xs p-1 rounded z-30">
              {group.date || "Today"}
            </div>
          </div>

          {group.messages.map((msg, index) => {
            const prevMsg = group.messages[index - 1];
            const nextMsg = group.messages[index + 1];
            const showInfo = shouldShowInfo(msg, prevMsg, nextMsg);
            const isRecent = isRecentMessage(msg, prevMsg, nextMsg);
            const readUserAvatars: string[] = [];

            if (msg.id === myLastReadMessageId && currentUser?.avatarUrl) {
              readUserAvatars.push(currentUser.avatarUrl);
            }

            for (const member of otherMembers) {
              if (member.avatarUrl && member.lastReadMessageId === msg.id) {
                readUserAvatars.push(member.avatarUrl);
              }
            }

            return (
              <Message
                key={msg.id}
                message={msg}
                chatType={chat.type}
                showInfo={showInfo}
                isRecent={isRecent}
                readUserAvatars={readUserAvatars}
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(ChatMessages);
