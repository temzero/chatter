import React, { useMemo } from "react";
import Message from "../Message";
import { MessageResponse } from "@/types/messageResponse";
import { DirectChatResponse } from "@/types/chat";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useCurrentUser } from "@/stores/authStore";

interface DirectMessagesProps {
  chat: DirectChatResponse;
  messages: MessageResponse[];
}

const DirectMessages: React.FC<DirectMessagesProps> = ({ chat, messages }) => {
  const chatId = chat?.id;
  const currentUser = useCurrentUser();

  // Update my last read at
  if (chat?.myMemberId) {
    chatMemberService.updateLastRead(chat.myMemberId);
  }

  const myLastReadAt = chat.myLastReadAt;
  const partnerLastReadAt = chat.chatPartner.lastReadAt;

  // Compute my last read message ID
  const myLastReadMessageId = useMemo(() => {
    if (!myLastReadAt) return null;
    const flatMessages = messages.slice().reverse();
    const lastReadMsg = flatMessages.find(
      (msg) => new Date(msg.createdAt) <= new Date(myLastReadAt)
    );
    return lastReadMsg?.id || null;
  }, [messages, myLastReadAt]);

  // Compute partner's last read message ID
  const partnerLastReadMessageId = useMemo(() => {
    if (!partnerLastReadAt) return null;
    const flatMessages = messages.slice().reverse();
    const lastReadMsg = flatMessages.find(
      (msg) => new Date(msg.createdAt) <= new Date(partnerLastReadAt)
    );
    return lastReadMsg?.id || null;
  }, [messages, partnerLastReadAt]);

  // Group messages by date
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

  const shouldShowInfo = (
    currentMsg: MessageResponse,
    _prevMsg: MessageResponse | undefined,
    nextMsg: MessageResponse | undefined
  ) => {
    return !nextMsg || nextMsg.senderId !== currentMsg.senderId;
  };

  const isRecentMessage = (
    currentMsg: MessageResponse,
    prevMsg: MessageResponse | undefined,
    nextMsg: MessageResponse | undefined
  ) => {
    const RECENT_MESSAGE_PERIOD = 10 * 60 * 1000; // 10 minutes

    const prevIsRecent =
      prevMsg &&
      prevMsg.senderId === currentMsg.senderId &&
      new Date(currentMsg.createdAt).getTime() -
        new Date(prevMsg.createdAt).getTime() <=
        RECENT_MESSAGE_PERIOD;

    const nextIsRecent =
      nextMsg &&
      nextMsg.senderId === currentMsg.senderId &&
      new Date(nextMsg.createdAt).getTime() -
        new Date(currentMsg.createdAt).getTime() <=
        RECENT_MESSAGE_PERIOD;

    if (prevIsRecent && !nextIsRecent) {
      return false;
    }

    return prevIsRecent || nextIsRecent;
  };

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
          <div className="sticky -top-5 z-10 flex justify-center mb-4">
            <div className="bg-black bg-opacity-30 text-white text-xs p-1 rounded">
              {group.date || "Today"}
            </div>
          </div>
          {group.messages.map((msg, index) => {
            const prevMsg = group.messages[index - 1];
            const nextMsg = group.messages[index + 1];
            const showInfo = shouldShowInfo(msg, prevMsg, nextMsg);
            const isRecent = isRecentMessage(msg, prevMsg, nextMsg);

            // Avatars shown only on the user's exact last read message
            const readMarkers: string[] = [];

            if (msg.id === myLastReadMessageId && currentUser?.avatarUrl) {
              readMarkers.push(currentUser.avatarUrl);
            }

            if (
              msg.id === partnerLastReadMessageId &&
              chat.chatPartner.avatarUrl
            ) {
              readMarkers.push(chat.chatPartner.avatarUrl);
            }

            return (
              <Message
                key={msg.id}
                message={msg}
                shouldAnimate={true}
                showInfo={showInfo}
                isRecent={isRecent}
                readUserAvatars={readMarkers}
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(DirectMessages);
