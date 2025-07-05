import React, { useRef, useEffect } from "react";
import DirectMessages from "./DirectMessages";
import GroupMessages from "./GroupMessages";
import ChannelMessages from "./ChannelMessages";
import TypingIndicator from "../../ui/typingIndicator/TypingIndicator";
import type { ChatResponse } from "@/types/responses/chat.response";
import { useMessagesByChatId, useMessageStore } from "@/stores/messageStore";
import { ChatType } from "@/types/enums/ChatType";
import { toast } from "react-toastify";
import { RingLoader } from "react-spinners";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  const chatId = chat?.id || "";
  const messages = useMessagesByChatId(chatId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMessagePinned = chat?.pinnedMessage !== null;
  const fetchMoreMessages = useMessageStore((state) => state.fetchMoreMessages);
  const isLoading = useMessageStore((state) => state.isLoading);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const prevMessagesLengthRef = useRef(0);
  const hasScrolledInitially = useRef(false);

  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currLength = messages.length;

    const lastMsg = messages[currLength - 1];
    const prevLastMsg = messages[prevLength - 1];

    const isNewMessage =
      currLength > prevLength && lastMsg?.id !== prevLastMsg?.id;

    const isFirstLoad = !hasScrolledInitially.current && currLength > 0;

    if ((isNewMessage || isFirstLoad) && chatId !== "") {
      scrollToBottom();
      hasScrolledInitially.current = true;
    }

    prevMessagesLengthRef.current = currLength;
  }, [chatId, messages]);

  const renderMessages = () => {
    if (!chat) return null;

    switch (chat.type) {
      case ChatType.DIRECT:
        return <DirectMessages chat={chat} messages={messages} />;
      case ChatType.GROUP:
        return <GroupMessages chat={chat} messages={messages} />;
      case ChatType.CHANNEL:
        return <ChannelMessages chat={chat} messages={messages} />;
      default:
        return <DirectMessages chat={chat} messages={messages} />;
    }
  };

  async function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const element = e.currentTarget;
    if (element.scrollTop === 0 && chatId) {
      toast.info("Loading more messages...");
      const addedCount = await fetchMoreMessages(chatId);
      if (addedCount === 0) {
        toast.info("No more messages.");
      }
    }
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`px-6 pb-[calc(3*var(--header-height))] flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto
        ${
          isMessagePinned
            ? "pt-[calc(var(--header-height)+var(--pinned-message-height)+4px)]"
            : "pt-[calc(var(--header-height)+4px)]"
        }
        `}
    >
      {isLoading && (
        <div className="w-full flex justify-center py-2">
          <RingLoader color="#777777" size={32} />
        </div>
      )}
      {renderMessages()}
      <TypingIndicator chatId={chatId} />
    </div>
  );
};

export default React.memo(ChatBox);
