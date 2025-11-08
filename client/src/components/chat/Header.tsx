import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { OnlineDot } from "@/components/ui/icons/OnlineDot";
import { useChatStatus } from "@/stores/presenceStore";
import { useMessageStore } from "@/stores/messageStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useUserLastSeen } from "@/stores/presenceStore";
import { formatTimeAgo } from "@/common/utils/format/formatTimeAgo";
import { useCallStore } from "@/stores/callStore";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { useShallow } from "zustand/shallow";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { useChatStore } from "@/stores/chatStore";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/stores/deviceStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import MessageSearchBar from "@/components/ui/messages/MessageSearchBar";
import PinnedMessage from "@/components/chat/components/message/PinnedMessage";
interface ChatHeaderProps {
  chat: ChatResponse;
  isBlockedByMe: boolean;
}

const Header: React.FC<ChatHeaderProps> = ({ chat, isBlockedByMe = false }) => {
  console.log("Header");

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const toggleSidebarInfo = useSidebarInfoStore.getState().toggleSidebarInfo;
  const setActiveChatId = useChatStore.getState().setActiveChatId;

  const {
    callId,
    chatId: callChatId,
    isVideoCall,
    callStatus,
    startCall,
    openBroadCastPreview,
    joinCall,
    getActiveCall,
  } = useCallStore(
    useShallow((state) => ({
      callId: state.callId,
      chatId: state.chatId,
      isVideoCall: state.isVideoCall,
      callStatus: state.callStatus,
      startCall: state.startCall,
      openBroadCastPreview: state.openBroadCastPreview,
      joinCall: state.joinCall,
      getActiveCall: state.getActiveCall,
    }))
  );

  useEffect(() => {
    if (chat?.id) {
      getActiveCall(chat.id); // sync store with any ongoing call for this chat
    }
  }, [chat?.id, getActiveCall]);

  const isOnline = useChatStatus(chat?.id, chat.type);
  const chatListMembers = useChatMemberStore.getState().chatMembers[chat.id];
  const isSearchMessages = useMessageStore((state) => state.isSearchMessages);

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
    const partnerMember = chatListMembers.find(
      (member) => member.userId === partnerId
    ) as ChatMemberResponse;
    if (partnerMember?.friendshipStatus === FriendshipStatus.ACCEPTED) {
      canCall = true;
    }
  }

  // Check if user can join the call (call is active and in progress for this chat)
  const isCalling =
    callChatId === chat.id && callId && callStatus === CallStatus.IN_PROGRESS;

  const handleJoinCall = () => {
    if (isChannel) {
      // no send when watching broadcast
      joinCall({
        isVoiceEnabled: false,
        isVideoEnabled: false,
      });
    } else {
      joinCall({
        isVoiceEnabled: true,
        isVideoEnabled: isVideoCall,
      });
    }
  };

  const handleGoHome = () => {
    setActiveChatId(null);
    navigate("/", { replace: true });
  };

  if (!chat) return null;

  return (
    <header
      className="w-full absolute top-0 left-0 hover:shadow-2xl flex items-center justify-between min-h-[var(--header-height)] max-h-[var(--header-height)] px-3 backdrop-blur-xl shadow select-none"
      style={{ zIndex: 2 }}
    >
      {chat.pinnedMessage && (
        <PinnedMessage message={chat.pinnedMessage} chatType={chat.type} />
      )}

      {isMobile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGoHome();
          }}
          className="flex items-center justify-center opacity-40 hover:opacity-100 w-[--header-height] h-[--header-height] -ml-3"
        >
          <i className="material-symbols-outlined text-2xl">arrow_back_ios</i>
        </button>
      )}

      <motion.div
        key={chat.id}
        className="flex gap-3 items-center cursor-pointer hover:text-[--primary-green]"
        initial={{ opacity: 0.2, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0.2, scale: 0.9 }}
        transition={{ type: "tween", duration: 0.1, ease: "easeInOut" }}
        onClick={toggleSidebarInfo}
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
            <div className="flex items-center gap-1 select-none">
              <div className="flex items-center cursor-pointer rounded-full p-1">
                {isCalling ? (
                  <button
                    onClick={handleJoinCall}
                    className="hover:shadow-xl hover:border-4 hover:border-[--primary-green] hover:bg-white hover:text-[--primary-green] font-semibold flex items-center gap-1 custom-border rounded-full px-3 bg-[--primary-green] opacity-100 transition"
                  >
                    {isChannel ? "Join Broadcast" : "Join Call"}
                    <i className="material-symbols-outlined text-3xl">
                      {isDirect && "phone"}
                      {isVideoCall && "videocam"}
                      {isChannel && "connected_tv"}
                    </i>
                  </button>
                ) : (
                  <>
                    {isDirect && canCall && (
                      <button
                        onClick={() => startCall(chat.id)}
                        className="opacity-60 hover:opacity-100 transition"
                      >
                        <i className="material-symbols-outlined text-3xl">
                          phone_enabled
                        </i>
                      </button>
                    )}

                    {isGroup && (
                      <button
                        onClick={() => startCall(chat.id, true)}
                        className="opacity-60 hover:opacity-100 transition"
                      >
                        <i className="material-symbols-outlined text-3xl">
                          videocam
                        </i>
                      </button>
                    )}

                    {isChannel &&
                      (chat.myRole === ChatMemberRole.ADMIN ||
                        chat.myRole === ChatMemberRole.OWNER) && (
                        <button
                          onClick={() => openBroadCastPreview(chat.id)}
                          className="opacity-60 hover:opacity-100 transition"
                        >
                          <i className="material-symbols-outlined text-3xl">
                            connected_tv
                          </i>
                        </button>
                      )}
                  </>
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

export default React.memo(Header);
