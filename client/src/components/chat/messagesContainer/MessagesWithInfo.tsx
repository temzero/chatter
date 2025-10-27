import React, { useMemo } from "react";
import { getActiveMembers,  } from "@/stores/chatMemberStore";
// import { useActiveMembers } from "@/stores/chatMemberStore";
import Message from "@/components/chat/components/message/Message";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { getCurrentUser } from "@/stores/authStore";

interface Props {
  chat: ChatResponse;
  message: MessageResponse;
  showInfo: boolean;
  isRecent: boolean;
}

const MessageWithInfo: React.FC<Props> = ({
  chat,
  message,
  showInfo,
  isRecent,
}) => {
  const currentUser = getCurrentUser();
  // const members = useActiveMembers() || [];
  const members = getActiveMembers() || [];

  // Find myself and others
  const myMember = members.find((m) => m.id === chat.myMemberId);
  const otherMembers = members.filter((m) => m.id !== chat.myMemberId);

  // Compute who has read this message
  const readUserAvatars = useMemo(() => {
    const avatars: string[] = [];

    // My own read mark
    if (message.id === myMember?.lastReadMessageId && currentUser?.avatarUrl) {
      avatars.push(currentUser.avatarUrl);
    }

    // Others’ read marks
    for (const member of otherMembers) {
      if (member.avatarUrl && member.lastReadMessageId === message.id) {
        avatars.push(member.avatarUrl);
      }
    }

    return avatars;
  }, [
    message.id,
    myMember?.lastReadMessageId,
    currentUser?.avatarUrl,
    otherMembers,
  ]);

  const isMe = message.sender.id === currentUser?.id;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <Message
        message={message}
        chatType={chat.type}
        showInfo={showInfo}
        isRecent={isRecent}
        readUserAvatars={readUserAvatars}
        currentUserId={currentUser?.id || ""}
        isMe={isMe}
      />
    </div>
  );
};

export default React.memo(MessageWithInfo);
