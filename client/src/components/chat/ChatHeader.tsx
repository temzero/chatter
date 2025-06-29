import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { FriendshipStatus } from "@/types/friendship";
import { ChatType } from "@/types/enums/ChatType";
import { OnlineDot } from "../ui/OnlineDot";
import { useChatStatus } from "@/stores/presenceStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import type { ChatResponse } from "@/types/chat";
import PinnedMessage from "./PinnedMessage";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { DirectChatMember } from "@/types/chatMember";

interface ChatHeaderProps {
  chat: ChatResponse;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat }) => {
  const toggleSidebarInfo = useSidebarInfoStore(
    (state) => state.toggleSidebarInfo
  );

  const chatListMembers = useChatMemberStore.getState().chatMembers[chat.id];
  const isOnline = useChatStatus(chat?.id, chat.type);

  const isChannel = chat.type === ChatType.CHANNEL;
  const isDirect = chat.type === ChatType.DIRECT;
  const isGroup = chat.type === ChatType.GROUP;
  // const isSaved = chat.type === ChatType.SAVED;

  // Get chat partner's friendship status if DIRECT chat
  let canCall = false;
  if (isDirect && chat.otherMemberUserIds && chatListMembers) {
    const partnerId = chat.otherMemberUserIds[0];
    const partnerMember = chatListMembers.find(
      (member) => member.userId === partnerId
    ) as DirectChatMember;
    if (partnerMember?.friendshipStatus === FriendshipStatus.ACCEPTED) {
      canCall = true;
    }
  }

  if (!chat) return null;

  return (
    <header
      className="absolute top-0 left-0 w-full cursor-pointer hover:shadow-2xl flex items-center justify-between min-h-[var(--header-height)] max-h-[var(--header-height)] px-3 backdrop-blur-xl shadow z-40"
      onClick={toggleSidebarInfo}
    >
      {chat.pinnedMessage && (
        <PinnedMessage
          message={chat.pinnedMessage}
          chatType={chat.type}
          isBanner
          onUnpin={() => {
            chatWebSocketService.togglePinMessage({
              chatId: chat.id,
              messageId: null,
            });
          }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={chat.id}
          className="flex gap-3 items-center cursor-pointer"
          initial={{ opacity: 0.2, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 0.9 }}
          transition={{ type: "tween", duration: 0.1, ease: "easeInOut" }}
        >
          <ChatAvatar chat={chat} type="header" />
          <h1 className="text-xl font-medium">{chat.name}</h1>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-1">
        <div className="flex items-center cursor-pointer rounded-full opacity-60 hover:opacity-100 p-1">
          {isDirect && canCall && (
            <i className="material-symbols-outlined text-3xl">phone_enabled</i>
          )}
          {isGroup && (
            <i className="material-symbols-outlined text-3xl">videocam</i>
          )}
          {isChannel && (
            <i className="material-symbols-outlined text-3xl">connected_tv</i>
          )}
        </div>

        <OnlineDot isOnline={isOnline} />
      </div>
    </header>
  );
};

export default React.memo(ChatHeader);
