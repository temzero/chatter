import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatMemberService } from "@/services/http/chatMemberService";
import { useActiveChat } from "@/stores/chatStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { useBlockStatus } from "@/common/hooks/useBlockStatus";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import MessagesContainer from "./messagesContainer/MessagesContainer";
import ChatBar from "./components/chatBar/ChatBar";
import Button from "../ui/buttons/Button";

const ChatBox = React.memo(() => {
  console.log("[MOUNTED]", "ChatBox");
  const { t } = useTranslation();

  const activeChat = useActiveChat();

  const { isBlockedByMe, isBlockedMe } = useBlockStatus(
    activeChat?.id ?? "",
    activeChat?.myMemberId ?? ""
  );

  if (!activeChat) {
    console.error("No activeChat");
    return null;
  }

  const isDirectChat = activeChat.type === ChatType.DIRECT;
  const isDeleted = activeChat.isDeleted;
  const isBlocked = isDirectChat && (isBlockedByMe || isBlockedMe);
  const isMember = Boolean(activeChat.myMemberId);

  return (
    <section
      className="h-full flex-1 relative flex flex-col justify-between overflow-hidden transition-all"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Header
        chat={activeChat}
        isBlockedByMe={isBlockedByMe}
        isBlocked={isBlocked}
      />

      <MessagesContainer chat={activeChat} />
      
      {!isDeleted && (
        <AnimatePresence>
          {!isBlocked ? (
            isMember ? (
              !(
                activeChat.type === ChatType.CHANNEL &&
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
                className="chat-bottom"
              >
                <Button
                  variant="primary"
                  className="mx-auto"
                  onClick={async () => {
                    await chatMemberService.joinChat(activeChat.id);
                    window.location.reload();
                  }}
                >
                  {t("chat_box.join_channel")}
                </Button>
              </motion.div>
            )
          ) : (
            <div className="chat-bottom">
              <h1 className="text-red-500 font-semibold text-center">
                {isBlockedByMe &&
                  isBlockedMe &&
                  t("common.messages.blocked_each_other")}
                {!isBlockedByMe &&
                  isBlockedMe &&
                  t("common.messages.blocked_me")}
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
