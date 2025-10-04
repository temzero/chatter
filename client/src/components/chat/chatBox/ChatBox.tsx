import React, { useRef, useEffect, useCallback } from "react";
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
import InfiniteScroller from "@/components/ui/InfiniteScroller";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  const chatId = chat?.id || "";
  const isMessagePinned = chat?.pinnedMessage !== null;

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const messages = useMessagesByChatId(chatId);
  const hasMoreMessages = useHasMoreMessages(chatId);
  const fetchMoreMessages = useMessageStore((state) => state.fetchMoreMessages);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Scroll to bottom once after mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Auto scroll if near bottom when new message arrives
  useEffect(() => {
    if (messages.length === 0) return;

    if (scrollerRef.current) {
      const el = scrollerRef.current;
      const nearBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight) < 150; // 150px threshold

      // Don't scroll if last message is a systemEvent
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.systemEvent && nearBottom) {
        scrollToBottom("smooth");
      }
    }
  }, [messages, scrollToBottom]);

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
    <InfiniteScroller
      ref={scrollerRef}
      onLoadMore={() => fetchMoreMessages(chatId)}
      hasMore={hasMoreMessages}
      isScrollUp={true}
      loader={
        <div className="w-full flex justify-center py-4 sticky top-0 z-10 bg-bg-primary">
          <RingLoader color="#777777" size={24} />
        </div>
      }
      className={`px-6 pb-[calc(3*var(--header-height))] flex-1 h-full w-full flex flex-col overflow-x-hidden ${
        isMessagePinned
          ? "pt-[calc(var(--header-height)+var(--pinned-message-height)+4px)]"
          : "pt-[calc(var(--header-height)+4px)]"
      }`}
    >
      {renderMessages()}
      <TypingIndicator chatId={chatId} />
    </InfiniteScroller>
  );
};

export default React.memo(ChatBox);
