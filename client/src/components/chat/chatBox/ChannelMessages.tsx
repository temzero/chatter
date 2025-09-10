import React, { useMemo, useEffect } from "react";
import ChannelMessage from "../message/MessageChannel";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatResponse } from "@/types/responses/chat.response";
import { useCurrentUser } from "@/stores/authStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { useActiveMembers } from "@/stores/chatMemberStore";

interface ChannelMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const ChannelMessages: React.FC<ChannelMessagesProps> = ({
  chat,
  messages,
}) => {
  const chatId = chat?.id;
  const currentUser = useCurrentUser();
  const rawMembers = useActiveMembers();
  const members = useMemo(() => rawMembers || [], [rawMembers]);

  const myMember = useMemo(
    () => members.find((m) => m.id === chat.myMemberId),
    [members, chat.myMemberId]
  );

  const myLastReadMessageId = myMember?.lastReadMessageId ?? null;

  // Send read receipt if the last message is unread and not sent by you
  useEffect(() => {
    if (!chatId || !chat.myMemberId || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isFromOther = lastMessage.sender?.id !== currentUser?.id;
    const isUnread =
      myLastReadMessageId === null || lastMessage.id !== myLastReadMessageId;

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

  const messagesByDate = useMemo(() => {
    const groups: { date: string; messages: MessageResponse[] }[] = [];

    messages.forEach((msg) => {
      const messageDate = new Date(msg.createdAt).toLocaleDateString();
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.date !== messageDate) {
        groups.push({
          date: messageDate,
          messages: [msg],
        });
      } else {
        lastGroup.messages.push(msg);
      }
    });

    return groups;
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
          <div className="sticky top-0 z-10 flex justify-center my-2">
            <div className="bg-[var(--background-color)] text-xs p-1 rounded">
              {group.date || "Today"}
            </div>
          </div>

          {group.messages.map((msg, index) => {
            const nextMsg = group.messages[index + 1];
            const isLastRead =
              myLastReadMessageId === msg.id &&
              (!nextMsg || nextMsg.id !== myLastReadMessageId);

            return (
              <React.Fragment key={msg.id}>
                <ChannelMessage message={msg} />
                {isLastRead && (
                  <div className="relative flex items-center gap-1 justify-between text-xs italic w-full select-none text-white">
                    <div className="h-4 flex items-center bg-[--primary-green] rounded-full px-0.5 z-10">
                      <span className="material-symbols-outlined text-xl">
                        visibility
                      </span>
                    </div>
                    <div className="h-4 flex items-center bg-[--primary-green] rounded-full px-2 z-10">
                      Last Read
                    </div>
                    <div className="absolute left-0 right-0 h-[2px] bg-[--primary-green] top-1/2 -translate-y-1/2 z-0"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(ChannelMessages);
