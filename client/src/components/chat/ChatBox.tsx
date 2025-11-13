import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatMemberService } from "@/services/http/chatMemberService";
import { useActiveChat } from "@/stores/chatStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { useBlockStatus } from "@/common/hooks/useBlockStatus";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import Header from "./Header";
import ChatBar from "./components/ChatBar";
import MessagesContainer from "./messagesContainer/MessagesContainer";
import { useTranslation } from "react-i18next";
import logger from "@/common/utils/logger";

const ChatBox = React.memo(() => {
  logger.log({prefix: "MOUNTED"},"ChatBox");
  const { t } = useTranslation();

  const activeChat = useActiveChat();

  const { isBlockedByMe, isBlockedMe } = useBlockStatus(
    activeChat?.id ?? "",
    activeChat?.myMemberId ?? ""
  );

  if (!activeChat) {
    logger.error("No activeChat");
    return null;
  }

  const isDirectChat = activeChat.type === ChatType.DIRECT;
  const isDeleted = activeChat.isDeleted;
  const isBlocked = isDirectChat && (isBlockedByMe || isBlockedMe);
  const isMember = Boolean(activeChat.myMemberId);

  return (
    <section
      className="h-full pt-16 flex-1 relative flex flex-col justify-between overflow-hidden transition-all"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Header chat={activeChat} isBlockedByMe={isBlockedByMe} isBlocked={isBlocked}/>
      <MessagesContainer chat={activeChat} />
      {!isDeleted && (
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
                  {t("chat_box.join_channel")}
                </button>
              </motion.div>
            )
          ) : (
            <div className="absolute bottom-0 left-0 backdrop-blur-xl w-full flex flex-col items-center p-4 justify-between shadow border-[var(--border-color)]">
              <h1 className="text-red-500 font-semibold text-center">
                {isBlockedByMe && isBlockedMe && t("common.messages.blocked_each_other")}
                {!isBlockedByMe && isBlockedMe && t("common.messages.blocked_me")}
                {isBlockedByMe &&
                  !isBlockedMe &&
                  t("common.messages.blocked_them")}
              </h1>
            </div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
});

export default React.memo(ChatBox);
