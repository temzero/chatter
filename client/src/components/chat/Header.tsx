import React, { useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { OnlineDot } from "@/components/ui/icons/OnlineDot";
import { useChatStatus } from "@/stores/presenceStore";
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
import { useTranslation } from "react-i18next";
import { useIsSearchMessages } from "@/stores/messageStore";
import MessageSearchBar from "../ui/messages/MessageSearchBar";
import PinnedMessage from "./components/message/preview/PinnedMessage";
import GlassButton from "../ui/buttons/GlassButton";
interface ChatHeaderProps {
  chat: ChatResponse;
  isBlocked?: boolean;
  isBlockedByMe: boolean;
}

const Header: React.FC<ChatHeaderProps> = ({
  chat,
  isBlocked = false,
  isBlockedByMe = false,
}) => {
  console.log("[MOUNTED]", "Header");

  const { t } = useTranslation();
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
    })),
  );

  useEffect(() => {
    if (chat?.id) {
      getActiveCall(chat.id); // sync store with any ongoing call for this chat
    }
  }, [chat?.id, getActiveCall]);

  const isOnline = useChatStatus(chat?.id, chat.type);
  const isSearchMessages = useIsSearchMessages();
  const chatListMembers = useChatMemberStore.getState().chatMembers[chat.id];

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
      (member) => member.userId === partnerId,
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
      className={clsx("chat-header", {
        desktop: !isMobile,
        mobile: isMobile,
      })}
      style={{ zIndex: 2 }}
    >
      {isSearchMessages && <MessageSearchBar />}

      <AnimatePresence>
        {chat.pinnedMessage && (
          <PinnedMessage message={chat.pinnedMessage} chatType={chat.type} />
        )}
      </AnimatePresence>

      <div
        id="chat-header"
        className="flex items-center justify-between px-3 min-h-(--header-height) max-h-(--header-height)"
      >
        {isMobile && (
          <GlassButton onClick={handleGoHome}>
            <i className="material-symbols-outlined filled ml-2">
              arrow_back_ios
            </i>
          </GlassButton>
        )}
        <motion.div
          key={chat.id}
          className={clsx(
            "flex gap-2 items-center cursor-pointer hover:text-(--primary-green-glow)",
          )}
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.6, scale: 0.9 }}
          onClick={toggleSidebarInfo}
        >
          <ChatAvatar chat={chat} type="header" isBlocked={isBlockedByMe} />
          <div
            id="chat-name"
            // className="glass-panel p-0.5 rounded-xl"
            className={clsx({
              "glass-panel px-1 rounded-xl": isMobile,
            })}
          >
            <h1 className="text-xl font-medium">
              {chat.type === ChatType.SAVED ? "Saved" : chat.name}
            </h1>
            {isDirect && !isOnline && lastSeen && (
              <span className="text-xs text-gray-400">
                Last seen {formatTimeAgo(t, lastSeen)}
              </span>
            )}
            {chat.isDeleted && (
              <h1 className="text-yellow-500/80">Has left the chat</h1>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 25 }}
            className={`flex justify-end items-center`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 select-none">
              <div className="flex items-center cursor-pointer rounded-full! p-1">
                {!isBlocked &&
                  !isBlockedByMe &&
                  (isCalling ? (
                    <button
                      onClick={handleJoinCall}
                      className={clsx(
                        "font-semibold flex items-center gap-1 custom-border rounded-full! px-3",
                        "bg-(--primary-green) opacity-100 transition",
                        // Hover states
                        "hover:shadow-xl hover:border-4 hover:border-(--primary-green)",
                        "hover:bg-white hover:scale-125 hover:text-(--primary-green)",
                      )}
                    >
                      {isChannel ? "Join Broadcast" : "Join Call"}
                      <i className="material-symbols-outlined filled text-3xl!">
                        {isDirect && "phone"}
                        {isVideoCall && "videocam"}
                        {isChannel && "connected_tv"}
                      </i>
                    </button>
                  ) : (
                    <>
                      {isDirect && canCall && (
                        <GlassButton onClick={() => startCall(chat.id)}>
                          <i className="material-symbols-outlined filled text-3xl!">
                            phone_enabled
                          </i>
                        </GlassButton>
                      )}

                      {isGroup && (
                        <GlassButton
                          onClick={() =>
                            startCall(chat.id, {
                              isVideoCall: true,
                            })
                          }
                        >
                          <i className="material-symbols-outlined filled text-3xl!">
                            videocam
                          </i>
                        </GlassButton>
                      )}

                      {isChannel &&
                        (chat.myRole === ChatMemberRole.ADMIN ||
                          chat.myRole === ChatMemberRole.OWNER) && (
                          <GlassButton
                            onClick={() => openBroadCastPreview(chat.id)}
                            className="opacity-60 hover:opacity-100"
                          >
                            <i className="material-symbols-outlined filled text-3xl!">
                              connected_tv
                            </i>
                          </GlassButton>
                        )}
                    </>
                  ))}
              </div>
              {!chat.isDeleted && !isBlocked && !isBlockedByMe && (
                <OnlineDot isOnline={isOnline} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </header>
  );
};

export default React.memo(Header);
