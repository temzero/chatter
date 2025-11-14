import React, { useEffect, useMemo } from "react";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { AnimatePresence } from "framer-motion";
import { useMessageStore } from "@/stores/messageStore";
import { MarkLastMessageRead } from "@/common/utils/message/markMessageRead";
import { useTranslation } from "react-i18next";
import ChannelMessage from "../components/message/channel/ChannelMessage";

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
  console.log(
    "[MOUNTED]",
    "ChannelMessages:",
    messageIds.length
  );
  const { t } = useTranslation();

  const chatId = chat.id;
  const messagesById = useMessageStore.getState().messagesById;
  const messages = messageIds.map((id) => messagesById[id]).filter(Boolean);

  useEffect(() => {
    if (chat && messages.length > 0) {
      return MarkLastMessageRead({ chat, messages });
    }
  }, [chat, messages]);

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const groups: { date: string; messages: typeof messages }[] = [];

    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.date !== date) {
        groups.push({ date, messages: [msg] });
      } else {
        lastGroup.messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl select-none">
        {t("common.messages.no_messages_yet")}
      </div>
    );
  }

  return (
    <>
      {messagesByDate.map((group) => (
        <React.Fragment key={`${group.date}-${chatId}`}>
          {!isSearch && (
            <div
              className="sticky top-0 flex justify-center my-2"
              style={{ zIndex: 1 }}
            >
              <div className="bg-[var(--background-color)] text-xs p-1 rounded">
                {group.date || "Today"}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {group.messages.map((msg) => {
              return (
                <div key={msg.id} className="flex flex-col items-center">
                  <ChannelMessage messageId={msg.id} />
                </div>
              );
            })}
          </AnimatePresence>
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(ChannelMessages);
