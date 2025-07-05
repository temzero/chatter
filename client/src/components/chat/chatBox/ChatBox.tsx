import React, { useRef, useEffect, useCallback, useState } from "react";
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
  const isFetchingRef = useRef(false);
  const scrollPositionRef = useRef(0);

  // State
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Store hooks
  const messages = useMessagesByChatId(chatId);
  const hasMoreMessages = useHasMoreMessages(chatId);
  const fetchMoreMessages = useMessageStore((state) => state.fetchMoreMessages);

  // Handlers
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  const handleScroll = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMoreMessages || isFetchingRef.current) return;

      const element = e.currentTarget;
      const scrollPosition = element.scrollTop;
      scrollPositionRef.current = scrollPosition;

      // Check if we're near the top (with a small threshold)
      if (scrollPosition < 100 && chatId) {
        isFetchingRef.current = true;
        setIsLoadingMore(true);

        try {
          const prevScrollHeight = element.scrollHeight;
          const addedCount = await fetchMoreMessages(chatId);

          if (addedCount === 0) {
            toast.info("No more messages.");
            return;
          }

          // Use double requestAnimationFrame for smoother rendering
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (containerRef.current) {
                const newScrollHeight = containerRef.current.scrollHeight;
                containerRef.current.scrollTop =
                  newScrollHeight - prevScrollHeight;
              }
            });
          });
        } finally {
          isFetchingRef.current = false;
          setIsLoadingMore(false);
        }
      }
    },
    [chatId, hasMoreMessages, fetchMoreMessages]
  );

  // Effects
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currLength = messages.length;

    const isFirstLoad = !hasScrolledInitially.current && currLength > 0;
    const isAppendingToBottom = currLength > prevLength;

    if (isFirstLoad && chatId) {
      scrollToBottom();
      hasScrolledInitially.current = true;
    } else if (isAppendingToBottom) {
      // Only auto-scroll if we were near the bottom before new messages arrived
      const wasNearBottom =
        scrollPositionRef.current >
        (containerRef.current?.scrollHeight || 0) -
          (containerRef.current?.clientHeight || 0) -
          100;

      if (wasNearBottom) {
        scrollToBottom("smooth");
      }
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
      {isLoadingMore && (
        <div className="w-full flex justify-center py-4 sticky top-0 z-10 bg-bg-primary">
          <RingLoader color="#777777" size={24} />
        </div>
      )}
      {renderMessages()}
      <TypingIndicator chatId={chatId} />
    </div>
  );
};

export default React.memo(ChatBox);
