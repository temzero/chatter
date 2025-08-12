import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { ChatType } from "@/types/enums/ChatType";
import { OnlineDot } from "../ui/OnlineDot";
import { useChatStatus } from "@/stores/presenceStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import type { ChatResponse } from "@/types/responses/chat.response";
import PinnedMessage from "./PinnedMessage";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { useMessageStore } from "@/stores/messageStore";
import MessageSearchBar from "../ui/MessageSearchBar";
import { useUserLastSeen } from "@/stores/presenceStore";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { CallMode, CallStatus, CallType } from "@/types/enums/modalType";

interface ChatHeaderProps {
  chat: ChatResponse;
  isBlockedByMe: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  isBlockedByMe = false,
}) => {
  const toggleSidebarInfo = useSidebarInfoStore(
    (state) => state.toggleSidebarInfo
  );

  const chatListMembers = useChatMemberStore.getState().chatMembers[chat.id];
  const isOnline = useChatStatus(chat?.id, chat.type);
  const isSearchMessages = useMessageStore((state) => state.isSearchMessages);
  const openModal = useModalStore((state) => state.openModal);

  const isChannel = chat.type === ChatType.CHANNEL;
  const isDirect = chat.type === ChatType.DIRECT;
  const isGroup = chat.type === ChatType.GROUP;

  const partnerId =
    isDirect && chat.otherMemberUserIds?.length
      ? chat.otherMemberUserIds[0]
      : undefined;

  const lastSeen = useUserLastSeen(partnerId);

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
      className="absolute top-0 left-0 w-full cursor-pointer hover:shadow-2xl flex items-center justify-between min-h-[var(--header-height)] max-h-[var(--header-height)] px-3 backdrop-blur-xl shadow z-[80]"
      onClick={toggleSidebarInfo}
    >
      {chat.pinnedMessage && (
        <PinnedMessage message={chat.pinnedMessage} chatType={chat.type} />
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
          <ChatAvatar chat={chat} type="header" isBlocked={isBlockedByMe} />
          <h1 className="text-xl font-medium">
            {chat.type === ChatType.SAVED ? "Saved" : chat.name}
          </h1>
          {isDirect && !isOnline && lastSeen && (
            <span className="text-xs text-gray-400">
              Last seen {formatTimeAgo(lastSeen)}
            </span>
          )}
          {chat.isDeleted && (
            <h1 className="text-yellow-500/80">Has left the chat</h1>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isSearchMessages ? "search" : "buttons"}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 25 }}
          className={`flex justify-end items-center ${
            isSearchMessages ? "w-[49%]" : "w-auto"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {isSearchMessages ? (
            <MessageSearchBar />
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex items-center cursor-pointer rounded-full opacity-60 hover:opacity-100 p-1">
                {isDirect && canCall && (
                  <button
                    onClick={() =>
                      openModal(ModalType.CALL, {
                        callType: CallType.VOICE,
                        callMode: CallMode.DIRECT,
                        status: CallStatus.CALLING,
                        partner: {
                          id: partnerId!,
                          name: chat.name,
                          avatarUrl: chat.avatarUrl ?? "",
                        },
                      })
                    }
                  >
                    <i className="material-symbols-outlined text-3xl">
                      phone_enabled
                    </i>
                  </button>
                )}

                {isGroup && (
                  <button
                    onClick={() =>
                      openModal(ModalType.CALL, {
                        callType: CallType.VIDEO,
                        callMode: CallMode.GROUP,
                        status: CallStatus.CALLING,
                      })
                    }
                  >
                    <i className="material-symbols-outlined text-3xl">
                      videocam
                    </i>
                  </button>
                )}

                {isChannel && (
                  <button>
                    <i className="material-symbols-outlined text-3xl">
                      connected_tv
                    </i>
                  </button>
                )}
              </div>
              {!chat.isDeleted && <OnlineDot isOnline={isOnline} />}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </header>
  );
};

export default React.memo(ChatHeader);
