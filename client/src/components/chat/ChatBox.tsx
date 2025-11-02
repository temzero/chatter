import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatMemberService } from "@/services/http/chatMemberService";
import { useChatStore } from "@/stores/chatStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { useBlockStatus } from "@/common/hooks/useBlockStatus";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import Header from "./Header";
import ChatBar from "./components/ChatBar";
import MessagesContainer from "./messagesContainer/MessagesContainer";
import { useShallow } from "zustand/shallow";

const ChatBox = React.memo(() => {
  console.log("ChatBox");
  const activeChat = useChatStore(
    useShallow((state) => {
      const chat = state.getActiveChat?.();
      if (!chat) return null;
      return {
        id: chat.id,
        name: chat.name,
        type: chat.type,
        myRole: chat.myRole,
        otherMemberUserIds: chat.otherMemberUserIds,
        pinnedMessage: chat.pinnedMessage,
        isDeleted: chat.isDeleted,
        avatarUrl: chat.avatarUrl,
        myMemberId: chat.myMemberId,
      };
    })
  );

  const { isBlockedByMe, isBlockedMe } = useBlockStatus(
    activeChat?.id ?? "",
    activeChat?.myMemberId ?? ""
  );

  if (!activeChat) {
    console.log("No activeChat");
    return null;
  }

  const isDirectChat = activeChat.type === ChatType.DIRECT;
  const isBlocked = isDirectChat && (isBlockedByMe || isBlockedMe);
  const isMember = Boolean(activeChat.myMemberId);

  return (
    <section
      className="h-full flex-1 relative flex flex-col justify-between overflow-hidden transition-all"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Header chat={activeChat} isBlockedByMe={isBlockedByMe} />
      <MessagesContainer chat={activeChat} />
      {!activeChat.isDeleted && (
        <AnimatePresence>
          {!isBlocked ? (
            isMember ? (
              !(
                activeChat.type === "channel" &&
                activeChat.myRole !== ChatMemberRole.OWNER
              ) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatBar
                    chatId={activeChat.id}
                    myMemberId={activeChat.myMemberId}
                  />
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="backdrop-blur-xl w-full flex flex-col items-center p-1 justify-between shadow border-[var(--border-color)]"
              >
                <button
                  className="text-[--primary-green] font-semibold rounded hover:text-white hover:bg-[--primary-green] px-2 py-1 text-lg"
                  onClick={async () => {
                    await chatMemberService.joinChat(activeChat.id);
                    window.location.reload();
                  }}
                >
                  Join Channel
                </button>
              </motion.div>
            )
          ) : (
            <div className="absolute bottom-0 left-0 backdrop-blur-xl w-full flex flex-col items-center p-4 justify-between shadow border-[var(--border-color)]">
              <h1 className="text-red-500 font-semibold">
                {isBlockedByMe &&
                  isBlockedMe &&
                  "You and this user have blocked each other."}
                {!isBlockedByMe &&
                  isBlockedMe &&
                  "You have been blocked by this user."}
                {isBlockedByMe && !isBlockedMe && "You have blocked this user."}
              </h1>
            </div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
});

export default React.memo(ChatBox);
