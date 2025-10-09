import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveChat } from "@/stores/chatStore";
import Header from "./Header";
import ChatBar from "./components/ChatBar";
import MessagesContainer from "./messagesContainer/MessagesContainer";
import { ChatMemberRole } from "@/types/enums/chatMemberRole";
import { useBlockStatus } from "@/hooks/useBlockStatus";
import { ChatType } from "@/types/enums/ChatType";
import { chatMemberService } from "@/services/chat/chatMemberService";

const ChatBox = React.memo(() => {
  const activeChat = useActiveChat();
  // const { isBlockedByMe, isBlockedMe } = useBlockStatus(
  //   activeChat?.id ?? "",
  //   activeChat?.myMemberId ?? ""
  // );

  console.log("ChatBox activeChat", activeChat);
  if (!activeChat) return null;

  const isDirectChat = activeChat.type === ChatType.DIRECT;
  // const isBlocked = isDirectChat && (isBlockedByMe || isBlockedMe);
  const isBlocked = false;
  const isBlockedByMe = false;
  const isBlockedMe = false;
  const isMember = Boolean(activeChat.myMemberId);

  return (
    <section className="h-full flex-1 relative flex flex-col justify-between overflow-hidden transition-all">
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
