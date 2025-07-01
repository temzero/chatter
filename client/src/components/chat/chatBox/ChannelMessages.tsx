import React, { useMemo } from "react";
import ChannelMessage from "../MessageChannel";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatResponse } from "@/types/responses/chat.response";
import { chatMemberService } from "@/services/chat/chatMemberService";

interface ChannelMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const ChannelMessages: React.FC<ChannelMessagesProps> = ({
  chat,
  messages,
}) => {
  const chatId = chat?.id;

  // Update my last read at
  if (chat?.myMemberId) {
    chatMemberService.updateLastRead(chat.myMemberId);
  }

  const mylastReatAt = chat.myLastReadAt;

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
          <div className="sticky -top-5 z-10 flex justify-center mb-4">
            <div className="bg-black bg-opacity-30 text-white text-xs p-1 rounded">
              {group.date || "Today"}
            </div>
          </div>
          {group.messages.map((msg, index) => {
            const nextMsg = group.messages[index + 1];

            const isLastRead =
              mylastReatAt &&
              new Date(msg.createdAt).getTime() <=
                new Date(mylastReatAt).getTime() &&
              (!nextMsg ||
                new Date(nextMsg.createdAt).getTime() >
                  new Date(mylastReatAt).getTime());

            return (
              <React.Fragment key={msg.id}>
                <ChannelMessage message={msg} />
                {isLastRead && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                    <span className="material-symbols-outlined">
                      check_small
                    </span>
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
