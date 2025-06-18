import React, { useMemo } from "react";
import Message from "./Message";
import ChannelMessage from "./MessageChannel";
import { ChatType } from "@/types/enums/ChatType";
import type { MessageResponse } from "@/types/messageResponse";

interface GroupMessagesProps {
  messages: MessageResponse[];
  chatType: ChatType;
  chatId: string;
}

const ChatBoxMessages: React.FC<GroupMessagesProps> = ({
  messages,
  chatType,
  chatId,
}) => {
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

  // Helper function to determine if showInfo should be true
  const shouldShowInfo = (
    currentMsg: MessageResponse,
    _prevMsg: MessageResponse | undefined,
    nextMsg: MessageResponse | undefined
  ) => {
    // Show info only if the next message is from a different sender or does not exist
    return !nextMsg || nextMsg.senderId !== currentMsg.senderId;
  };

  // Helper function to determine if message is recent (within 5 minutes)
  const isRecentMessage = (
    currentMsg: MessageResponse,
    prevMsg: MessageResponse | undefined,
    nextMsg: MessageResponse | undefined
  ) => {
    const RECENT_MESSAGE_PERIOD = 10 * 60 * 1000; // 10m

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

    // If it has a prev recent msg, but no recent next msg => it's the last in the block => not recent
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

            return chatType === ChatType.CHANNEL ? (
              <ChannelMessage key={msg.id} message={msg} />
            ) : (
              <Message
                key={msg.id}
                message={msg}
                chatType={chatType}
                shouldAnimate={true}
                showInfo={showInfo}
                isRecent={isRecent}
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(ChatBoxMessages);
