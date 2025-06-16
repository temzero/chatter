import React, { useMemo, useRef } from "react";
import Message from "./Message";
import ChannelMessage from "./MessageChannel";
import { ChatType } from "@/types/enums/ChatType";
import type { MessageResponse } from "@/types/messageResponse";

interface ChatBoxMessagesProps {
  messages: MessageResponse[];
  chatType: ChatType;
}

const ChatBoxMessages: React.FC<ChatBoxMessagesProps> = ({
  messages,
  chatType,
}) => {
  const prevLengthRef = useRef(messages.length);

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof messages }[] = [];

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

  const lastGroup = groupedMessages[groupedMessages.length - 1];
  const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1];

  const isNewMessage = messages.length > prevLengthRef.current;

  // Update the ref AFTER checking
  prevLengthRef.current = messages.length;

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
        No messages yet!
      </div>
    );
  }

  return (
    <>
      {groupedMessages.map((group) => (
        <React.Fragment key={group.date}>
          <div className="sticky -top-5 z-10 flex justify-center mb-4">
            <div className="bg-black bg-opacity-30 text-white text-xs p-1 rounded">
              {group.date || "Today"}
            </div>
          </div>
          {group.messages.map((msg) => {
            const animate = isNewMessage && msg.id === lastMessage?.id;

            return chatType === ChatType.CHANNEL ? (
              <ChannelMessage key={msg.id} message={msg} />
            ) : (
              <Message
                key={msg.id}
                message={msg}
                shouldAnimate={animate}
                chatType={chatType}
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(ChatBoxMessages);
