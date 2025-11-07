import React, { useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { RingLoader } from "react-spinners";
import {
  useHasMoreMessages,
  useMessageIds,
  useMessageStore,
} from "@/stores/messageStore";
import TypingIndicator from "@/components/ui/typingIndicator/TypingIndicator";
import InfiniteScroller from "@/components/ui/layout/InfiniteScroller";
import Messages from "./Messages";
import ChannelMessages from "./ChannelMessages";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { scrollToBottom } from "@/common/utils/scrollToBottom";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const MessagesContainer: React.FC<ChatBoxProps> = ({ chat }) => {
  console.log("MessagesContainer");

  const chatId = chat?.id || "";
  const isMessagePinned = chat?.pinnedMessage !== null;

  const isMuted: boolean = chat?.mutedUntil
    ? new Date(chat.mutedUntil).getTime() > Date.now()
    : false;

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const messageIds = useMessageIds(chatId);
  const hasMoreMessages = useHasMoreMessages(chatId);
  const fetchMoreMessages = useMessageStore.getState().fetchMoreMessages;

  const isSearchMessages = useMessageStore((state) => state.isSearchMessages);
  const isShowImportant = useMessageStore((state) => state.showImportantOnly);
  // Scroll to bottom helper

  useLayoutEffect(() => {
    scrollToBottom(scrollerRef.current);
  }, [messageIds, isShowImportant]);

  // Auto scroll if near bottom when new message arrives
  useEffect(() => {
    if (messageIds.length === 0) return;

    const el = scrollerRef.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 150;
    if (nearBottom) {
      scrollToBottom(el, "smooth");
    }
  }, [messageIds]);

  const renderMessages = useCallback(() => {
    if (!chat) return null;
    switch (chat.type) {
      case ChatType.CHANNEL:
        return (
          <ChannelMessages
            chat={chat}
            messageIds={messageIds}
            isSearch={isSearchMessages}
          />
        );
      default:
        return (
          <Messages
            chat={chat}
            messageIds={messageIds}
            isSearch={isSearchMessages}
          />
        );
    }
  }, [chat, isSearchMessages, messageIds]);

  return (
    <InfiniteScroller
      ref={scrollerRef}
      onLoadMore={() => fetchMoreMessages(chatId)}
      hasMore={hasMoreMessages}
      isScrollUp={true}
      loader={
        <div
          className="w-full flex justify-center py-4 sticky top-0 bg-bg-primary"
          style={{ zIndex: 3 }}
        >
          <RingLoader color="#777777" size={24} />
        </div>
      }
      className={`px-6 pb-[calc(3*var(--header-height))] flex-1 h-full w-full flex flex-col overflow-x-hidden${
        isMessagePinned
          ? "pt-[calc(var(--header-height)+var(--pinned-message-height)+4px)]"
          : "pt-[calc(var(--header-height)+4px)]"
      }`}
    >
      {renderMessages()}
      <TypingIndicator chatId={chatId} isMuted={isMuted ?? false} />
      {/* {!isMuted && <TypingIndicator chatId={chatId} />} */}
    </InfiniteScroller>
  );
};

export default React.memo(MessagesContainer);
