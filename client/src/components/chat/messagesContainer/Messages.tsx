import React, { useMemo, useEffect } from "react";
import Message from "@/components/chat/components/message/Message";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useCurrentUser } from "@/stores/authStore";
import { useActiveMembers } from "@/stores/chatMemberStore";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/common/utils/message/messageHelpers";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { AnimatePresence } from "framer-motion";

interface ChatMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const Messages: React.FC<ChatMessagesProps> = ({ chat, messages }) => {
  console.log("Messages", messages.length);
  const chatId = chat?.id;
  const currentUser = useCurrentUser();
  const rawMembers = useActiveMembers();
  const members = useMemo(() => rawMembers || [], [rawMembers]);
  const myMember = useMemo(
    () => members.find((m) => m.id === chat.myMemberId),
    [members, chat.myMemberId]
  );
  const otherMembers = useMemo(
    () => members.filter((m) => m.id !== chat.myMemberId),
    [members, chat.myMemberId]
  );

  const myLastReadMessageId = myMember?.lastReadMessageId ?? null;

  // ✅ Auto mark message as read
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
      {messagesByDate.map((group) => {
        const groupKey = `${group.date}-${chatId}`;
        return (
          <React.Fragment key={groupKey}>
            {/* Sticky Date Header */}
            <div className="sticky top-0 flex justify-center z-[1]">
              <div className="bg-[var(--background-color)] text-xs p-1 rounded">
                {group.date || "Today"}
              </div>
            </div>

            {/* ✅ AnimatePresence wraps entire message list */}
            <AnimatePresence initial={false}>
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
                const isMe = msg.sender.id === currentUser?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <Message
                      message={msg}
                      chatType={chat.type}
                      showInfo={showInfo}
                      isRecent={isRecent}
                      readUserAvatars={readUserAvatars}
                      currentUserId={currentUser?.id || ""}
                      isMe={isMe}
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default React.memo(Messages);
