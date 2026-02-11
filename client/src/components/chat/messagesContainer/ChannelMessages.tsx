import React, { useEffect, useMemo, useRef } from "react";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { flattenMessagesWithDates } from "@/common/utils/message/messageHelpers";
import { AnimatePresence } from "framer-motion";
import { useMessageStore } from "@/stores/messageStore";
import { MarkLastMessageRead } from "@/common/utils/message/markMessageRead";
import { useTranslation } from "react-i18next";
import ChannelMessage from "../components/message/channel/ChannelMessage";
import DateHeader from "@/components/ui/messages/DateHeader";
import { MessageResponse } from "@/shared/types/responses/message.response";

interface ChannelMessagesProps {
  chat: ChatResponse;
  messageIds: string[];
  isSearch: boolean;
}

const ChannelMessages: React.FC<ChannelMessagesProps> = ({
  chat,
  messageIds,
  isSearch = false,
}) => {
  console.log("[MOUNTED]", "ChannelMessages:", messageIds.length);
  const { t } = useTranslation();

  const chatId = chat.id;
  const messagesById = useMessageStore.getState().messagesById;
  const messages = messageIds.map((id) => messagesById[id]).filter(Boolean);

  // ✅ Store previous chat ID
  const prevChatIdRef = useRef(chatId);

  // ✅ Determine if this is initial load for THIS chat
  const isInitialChatLoad = useMemo(() => {
    const isNewChat = prevChatIdRef.current !== chatId;
    if (isNewChat) {
      prevChatIdRef.current = chatId;
      return true;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, messages.length]);

  // MARK AS READ
  useEffect(() => {
    if (chat && messages.length > 0) {
      return MarkLastMessageRead({ chat, messages });
    }
  }, [chat, messages]);

  // ✅ Flatten messages with date headers
  const flatItems = useMemo(() => {
    return flattenMessagesWithDates(messages);
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl select-none">
        {t("common.messages.no_messages_yet")}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence initial={false}>
        {flatItems.map((item) => {
          if (item.type === "date") {
            // Render date header
            return !isSearch ? (
              <DateHeader key={item.id} date={item.data as string} />
            ) : null;
          } else {
            // Render channel message
            const message = item.data as MessageResponse;

            return (
              <ChannelMessage
                key={message.id}
                messageId={message.id}
                disableAnimation={isInitialChatLoad}
              />
            );
          }
        })}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ChannelMessages);
