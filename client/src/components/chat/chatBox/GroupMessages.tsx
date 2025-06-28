import React, { useMemo, useEffect } from "react";
import Message from "../Message";
import { MessageResponse } from "@/types/messageResponse";
import { ChatResponse } from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/utils/messageHelpers";
import { useActiveMembers, useChatMemberStore } from "@/stores/chatMemberStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";

interface GroupMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const GroupMessages: React.FC<GroupMessagesProps> = ({ chat, messages }) => {
  const chatId = chat?.id;
  const members = useActiveMembers();
  const { updateMemberLastRead } = useChatMemberStore();
  const isMessagePinned = chat.pinnedMessage !== null;

  const myMember = useMemo(
    () => members?.find((m) => m.id === chat.myMemberId),
    [members, chat.myMemberId]
  );

  const myLastReadMessageId = myMember?.lastReadMessageId ?? null;

  // Update last read message ID for my member
  useEffect(() => {
    console.log("useEffect update last read");
    if (!chatId || !chat.myMemberId || messages.length === 0) return;

    const lastMessageId = messages[messages.length - 1].id;

    const isUnread =
      myLastReadMessageId === null ||
      messages[messages.length - 1].id !== myLastReadMessageId;

    console.log("isUnread", isUnread);

    if (isUnread) {
      const timer = setTimeout(() => {
        chatWebSocketService.messageRead(
          chatId,
          chat.myMemberId,
          lastMessageId
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    chatId,
    chat.myMemberId,
    messages,
    myLastReadMessageId,
    updateMemberLastRead,
  ]);

  useEffect(() => {
    if (members) {
      console.log("All members' last read message IDs:");
      members.forEach((member) => {
        console.log(
          `Member ${member.id} (${member.firstName} ${member.lastName}):`,
          member.lastReadMessageId
        );
      });
    }
  }, [members]);

  const messagesByDate = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

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
          <div
            className={`sticky z-99 flex justify-center mb-4 ${
              isMessagePinned ? "top-12" : "top-0"
            }`}
          >
            <div className="bg-[var(--background-color)] text-xs p-1 rounded">
              {group.date || "Today"}
            </div>
          </div>

          {group.messages.map((msg, index) => {
            const prevMsg = group.messages[index - 1];
            const nextMsg = group.messages[index + 1];
            const showInfo = shouldShowInfo(msg, prevMsg, nextMsg);
            const isRecent = isRecentMessage(msg, prevMsg, nextMsg);

            const readUserAvatars: string[] = [];

            for (const member of members ?? []) {
              if (member.avatarUrl && member.lastReadMessageId === msg.id) {
                readUserAvatars.push(member.avatarUrl);
              }
            }

            return (
              <Message
                key={msg.id}
                message={msg}
                chatType={ChatType.GROUP}
                shouldAnimate={isRecent}
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

export default React.memo(GroupMessages);
