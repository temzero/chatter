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
  const formatMessages = useMemo(() => {
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
      {formatMessages.map((group) => (
        <React.Fragment key={`${group.date}-${chatId}`}>
          <div className="sticky -top-5 z-10 flex justify-center mb-4">
            <div className="bg-black bg-opacity-30 text-white text-xs p-1 rounded">
              {group.date || "Today"}
            </div>
          </div>
          {group.messages.map((msg) => {
            return chatType === ChatType.CHANNEL ? (
              <ChannelMessage key={msg.id} message={msg} />
            ) : (
              <Message key={msg.id} message={msg} chatType={chatType} />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(ChatBoxMessages);
