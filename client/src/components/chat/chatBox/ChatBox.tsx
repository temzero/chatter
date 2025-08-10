import React, { useRef, useEffect, useCallback, useState } from "react";
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
import { isNearBottom } from "@/utils/isNearBottom";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  // Constants
  const chatId = chat?.id || "";
  const isMessagePinned = chat?.pinnedMessage !== null;

  // Refs
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const scrollPositionRef = useRef(0);

  // State
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Store hooks
  const messages = useMessagesByChatId(chatId);
  const hasMoreMessages = useHasMoreMessages(chatId);
  const fetchMoreMessages = useMessageStore((state) => state.fetchMoreMessages);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior,
        });
      }
    }, 1);
  }, []);

  // Load messages when scroll
  const handleInfiniteScroll = useCallback(
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
            return;
          }

          // Use double requestAnimationFrame for smoother rendering
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (chatBoxRef.current) {
                const newScrollHeight = chatBoxRef.current.scrollHeight;
                chatBoxRef.current.scrollTop =
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

  // Scroll to bottom when fist render
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Scroll to bottom when messages change and near to bottom
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // Adjust this condition to fit your actual system message detection
    const isLastMessageSystem = lastMessage.systemEvent;

    if (!isLastMessageSystem && isNearBottom(chatBoxRef.current)) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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
      ref={chatBoxRef}
      onScroll={handleInfiniteScroll}
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
