import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveChat } from "@/stores/chatStore";
import SidebarInfo from "./sidebarInfo/SidebarInfo";
import ChatHeader from "./ChatHeader";
import ChatBar from "./ChatBar";
import ChatBox from "./chatBox/ChatBox";
import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import { ChatMemberRole } from "@/types/enums/chatMemberRole";
import { useBlockStatus } from "@/hooks/useBlockStatus";
import { ChatType } from "@/types/enums/ChatType";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useCurrentUserId } from "@/stores/authStore";

const ChatContent = React.memo(() => {
  const activeChat = useActiveChat();
  const currentUserId = useCurrentUserId();
  const { isBlockedByMe, isBlockedMe } = useBlockStatus(
    activeChat?.id ?? "",
    activeChat?.myMemberId ?? ""
  );

  if (!activeChat) return null;

  const isDirectChat = activeChat.type === ChatType.DIRECT;
  const isBlocked = isDirectChat && (isBlockedByMe || isBlockedMe);
  const isMember = Boolean(activeChat.myMemberId);

  return (
    <section className="relative flex-1 flex flex-col justify-between h-full overflow-hidden">
      <ChatHeader chat={activeChat} isBlockedByMe={isBlockedByMe} />
      <ChatBox chat={activeChat} />

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
                    await chatMemberService.addMembers(activeChat.id, [
                      currentUserId,
                    ]);
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

const ChatSidebar = React.memo(() => {
  const isChatInfoVisible = useSidebarInfoVisibility();

  return isChatInfoVisible ? (
    <div className="w-[var(--sidebar-width)]">
      <SidebarInfo />
    </div>
  ) : null;
});

const Chat: React.FC = () => {
  return (
    <section className="flex-1 flex h-full">
      <ChatContent />
      <ChatSidebar />
    </section>
  );
};

export default React.memo(Chat);
