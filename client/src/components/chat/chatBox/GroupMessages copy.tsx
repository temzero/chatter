import React, { useMemo } from "react";
import Message from "../Message";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatResponse } from "@/types/responses/chat.response";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useActiveMembers } from "@/stores/chatMemberStore";
// import { useCurrentUser } from "@/stores/authStore";
import { ChatType } from "@/types/enums/ChatType";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/utils/messageHelpers";

interface GroupMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const GroupMessages: React.FC<GroupMessagesProps> = ({ chat, messages }) => {
  const chatId = chat?.id;
  // const currentUser = useCurrentUser();
  // const myLastReadAt = chat.myLastReadAt;
  const myMemberId = chat.myMemberId;
  const chatMembers = useActiveMembers();

  // Update my last read timestamp
  if (myMemberId) {
    chatMemberService.updateLastRead(myMemberId);
  }

  const messagesByDate = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  // Precompute last read message ID for each user
  const lastReadMessageIdMap = useMemo(() => {
    const map: Record<string, string> = {}; // userId => messageId

    const sortedMessages = [...messages];

    chatMembers.forEach((member) => {
      if (!member.lastReadAt) return;

      const lastReadMsg = sortedMessages
        .slice()
        .reverse()
        .find(
          (msg) =>
            new Date(msg.createdAt).getTime() <=
            new Date(member.lastReadAt!).getTime()
        );

      if (lastReadMsg) {
        map[member.userId] = lastReadMsg.id;
      }
    });

    return map;
  }, [messages, chatMembers]);

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

            const readUserAvatars: string[] = [];

            for (const member of chatMembers) {
              if (!member.avatarUrl) continue;

              const lastReadMessageId = lastReadMessageIdMap[member.userId];
              if (lastReadMessageId === msg.id) {
                readUserAvatars.push(member.avatarUrl);
              }
            }

            return (
              <Message
                key={msg.id}
                message={msg}
                chatType={ChatType.GROUP}
                shouldAnimate={true}
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
