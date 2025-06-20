import React, { useMemo } from "react";
import Message from "../Message";
import { MessageResponse } from "@/types/messageResponse";
import { ChatResponse } from "@/types/chat";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useMembersByChatId } from "@/stores/chatMemberStore";
import { ChatType } from "@/types/enums/ChatType";

interface GroupMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const GroupMessages: React.FC<GroupMessagesProps> = ({
  chat,
  messages,
}) => {
  const chatId = chat?.id;

  // Update my last read at
  if (chat?.myMemberId) {
    console.log('chat?.myMemberId', chat?.myMemberId)
    chatMemberService.updateLastRead(chat.myMemberId);
  }

  const mylastReatAt = chat.myLastReadAt;
  const chatMembers = useMembersByChatId(chatId);
  console.log('chatMembers: ', chatMembers)

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

            const isLastRead =
              mylastReatAt &&
              new Date(msg.createdAt).getTime() <=
                new Date(mylastReatAt).getTime() &&
              (!nextMsg ||
                new Date(nextMsg.createdAt).getTime() >
                  new Date(mylastReatAt).getTime());

            return (
              <React.Fragment key={msg.id}>
                <Message
                  message={msg}
                  chatType={ChatType.GROUP}
                  shouldAnimate={true}
                  showInfo={showInfo}
                  isRecent={isRecent}
                />
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

export default React.memo(GroupMessages);
