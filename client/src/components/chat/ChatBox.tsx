import React, { useRef, useEffect } from "react";
import ChatBoxMessages from "./ChatBoxMessages";
import TypingIndicator from "../ui/typingIndicator/TypingIndicator";
import type { ChatResponse } from "@/types/chat";
import { useMessagesByChatId } from "@/stores/messageStore";
import { ChatType } from "@/types/enums/ChatType";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  console.log("CHAT BOX RENDERED");
  const chatType = chat?.type || ChatType.DIRECT;
  const chatId = chat?.id || "";
  const messages = useMessagesByChatId(chatId);
  console.log("messages: ", messages.length);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom()
  }, [chatId, messages.length]);

  // useEffect(() => {
  //   // Delay to ensure messages are rendered before scrolling
  //   const timeout = setTimeout(scrollToBottom, 0);
  //   return () => clearTimeout(timeout);
  // }, [chatId, messages.length]);

  return (
    <div
      ref={containerRef}
      className="px-6 py-16 pb-[160px] flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto backdrop-blur-sm"
    >
      <ChatBoxMessages
        messages={messages}
        chatType={chatType}
        chatId={chatId}
      />
      <TypingIndicator chatId={chatId} />
    </div>
  );
};

export default React.memo(ChatBox);
