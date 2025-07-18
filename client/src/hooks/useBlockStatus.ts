// hooks/useBlockStatus.ts
import { useDirectChatPartner } from "@/stores/chatMemberStore";

export const useBlockStatus = (
  chatId: string,
  myMemberId: string
): {
  isBlockedByMe: boolean;
  isBlockedMe: boolean;
  isEitherBlocked: boolean;
  isBothBlocked: boolean;
} => {
  const partner = useDirectChatPartner(chatId, myMemberId);
  if (!partner) {
    return {
      isBlockedByMe: false,
      isBlockedMe: false,
      isEitherBlocked: false,
      isBothBlocked: false,
    };
  }

  const isBlockedByMe = partner?.isBlockedByMe ?? false;
  const isBlockedMe = partner?.isBlockedMe ?? false;

  return {
    isBlockedByMe,
    isBlockedMe,
    isEitherBlocked: isBlockedByMe || isBlockedMe,
    isBothBlocked: isBlockedByMe && isBlockedMe,
  };
};
