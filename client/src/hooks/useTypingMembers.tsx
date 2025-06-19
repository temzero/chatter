// hooks/useTypingMembers.ts
import { useMemo } from "react";
import { useTypingUsersByChatId } from "@/stores/typingStore";
import { ChatMember } from "@/types/chat";
import { useActiveMembersByChatId } from "@/stores/chatMemberStore";

type UseTypingMembersResult = {
  typingMembers: ChatMember[];
  isTyping: boolean;
};

export const useTypingMembers = (chatId: string): UseTypingMembersResult => {
  const members = useActiveMembersByChatId(chatId) as ChatMember[];
  const typingUserIds = useTypingUsersByChatId(chatId);

  const typingMembers = useMemo(() => {
    const userIdIndexMap = new Map(
      typingUserIds.map((id, index) => [id, index])
    );

    return (members ?? [])
      .filter((member) => userIdIndexMap.has(member.userId))
      .sort(
        (a, b) =>
          (userIdIndexMap.get(a.userId) ?? 0) -
          (userIdIndexMap.get(b.userId) ?? 0)
      );
  }, [members, typingUserIds]);

  return {
    typingMembers,
    isTyping: typingUserIds.length > 0,
  };
};
