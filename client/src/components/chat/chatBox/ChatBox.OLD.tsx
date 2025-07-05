import React, { useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { RingLoader } from "react-spinners";
import type { ChatResponse } from "@/types/responses/chat.response";
import { ChatType } from "@/types/enums/ChatType";
import {
  useHasMoreMessages,
  useMessagesByChatId,
  useMessageStore,
} from "@/stores/messageStore";
import ChannelMessages from "./ChannelMessages";
import TypingIndicator from "../../ui/typingIndicator/TypingIndicator";
import ChatMessages from "./ChatMessages";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  // Constants
  const chatId = chat?.id || "";
  const isMessagePinned = chat?.pinnedMessage !== null;

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef(0);
  const hasScrolledInitially = useRef(false);

  // Store hooks
  const messages = useMessagesByChatId(chatId);
  const isLoading = useMessageStore((state) => state.isLoading);
  const hasMoreMessages = useHasMoreMessages(chatId);
  const fetchMoreMessages = useMessageStore((state) => state.fetchMoreMessages);

  // Handlers
  const scrollToBottom = useCallback(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "auto",
    });
  }, []);

  const handleScroll = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMoreMessages) return;

      const element = e.currentTarget;
      if (element.scrollTop === 0 && chatId) {
        const prevScrollHeight = element.scrollHeight;

        toast.info("Loading more messages...");
        const addedCount = await fetchMoreMessages(chatId);

        if (addedCount === 0) {
          toast.info("No more messages.");
          return;
        }

        requestAnimationFrame(() => {
          element.scrollTop = element.scrollHeight - prevScrollHeight;
        });
      }
    },
    [chatId, hasMoreMessages, fetchMoreMessages]
  );

  // Effects
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currLength = messages.length;

    const lastMsg = messages[currLength - 1];
    const prevLastMsg = messages[prevLength - 1];

    const isFirstLoad = !hasScrolledInitially.current && currLength > 0;
    const isAppendingToBottom =
      currLength > prevLength && lastMsg?.id !== prevLastMsg?.id;

    if ((isFirstLoad || isAppendingToBottom) && chatId) {
      scrollToBottom();
      hasScrolledInitially.current = true;
    }

    prevMessagesLengthRef.current = currLength;
  }, [chatId, messages, scrollToBottom]);

  // Render functions
  const renderMessages = useCallback(() => {
    if (!chat) return null;

    switch (chat.type) {
      case ChatType.CHANNEL:
        return <ChannelMessages chat={chat} messages={messages} />;
      default:
        return <ChatMessages chat={chat} messages={messages} />;
    }
  }, [chat, messages]);

  // Memoized components
  const loadingIndicator = isLoading && hasMoreMessages && (
    <div className="w-full flex justify-center py-4">
      <RingLoader color="#777777" size={24} />
    </div>
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`px-6 pb-[calc(3*var(--header-height))] flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto ${
        isMessagePinned
          ? "pt-[calc(var(--header-height)+var(--pinned-message-height)+4px)]"
          : "pt-[calc(var(--header-height)+4px)]"
      }`}
    >
      {loadingIndicator}
      {renderMessages()}
      <TypingIndicator chatId={chatId} />
    </div>
  );
};

export default React.memo(ChatBox);
