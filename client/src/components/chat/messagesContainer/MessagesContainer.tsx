import React, { useRef, useCallback } from "react";
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
import { useMessagesAutoScroll } from "@/common/hooks/useMessagesAutoScroll";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const MessagesContainer: React.FC<ChatBoxProps> = ({ chat }) => {
  console.log("[MOUNTED]", "MessagesContainer");

  const chatId = chat?.id || "";
  const isMessagePinned = chat?.pinnedMessage !== null;

  const isMuted: boolean = chat?.mutedUntil
    ? new Date(chat.mutedUntil).getTime() > Date.now()
    : false;

  const messageIds = useMessageIds(chatId);
  const hasMoreMessages = useHasMoreMessages(chatId);
  const fetchMoreMessages = useMessageStore.getState().fetchMoreMessages;

  const isSearchMessages = useMessageStore((state) => state.isSearchMessages);
  const isShowImportant = useMessageStore(
    (state) => state.filterImportantMessages
  );

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useMessagesAutoScroll({
    containerRef: scrollerRef, // pass your scrollable container ref
    items: messageIds, // array of messages
    isImportantOnly: isShowImportant,
    chatId: chatId,
  });

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
    </InfiniteScroller>
  );
};

export default React.memo(MessagesContainer);
