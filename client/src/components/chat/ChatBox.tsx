import React, { useRef, useEffect, useState, useMemo } from "react";
import Message from "./Message";
import ChannelMessage from "./MessageChannel";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import messageSound from "@/assets/sound/message-sent2.mp3";
import { ChatType } from "@/types/enums/ChatType";
import { useTypingStore } from "@/stores/typingStore";
import TypingIndicator from "../ui/typingIndicator/TypingIndicator";
import { useChatBoxData } from "@/hooks/useChatBoxData";
import { useActiveChat } from "@/stores/chatStore";

const ChatBox: React.FC = () => {
  // console.log("chatBox Rendered");
  const { activeChat, messages, chatMembers, isLoading } = useChatBoxData();

  // const activeChat = useActiveChat();
  // const messages = [];
  // const chatMembers = [];
  // const isLoading = false;

  const chatType = activeChat?.type || ChatType.DIRECT;
  const activeChatId = activeChat?.id || "";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  const activeTyping = useTypingStore((state) => state.activeTyping);
  const typingUsers = useMemo(() => {
    const chatTypingSet = activeTyping[activeChatId] || new Set();
    return Array.from(chatTypingSet);
  }, [activeTyping, activeChatId]);

  const [playMessageSound] = useSoundEffect(messageSound, 0.5);

  const newMessageAdded = useMemo(() => {
    return messages.length > previousMessageCount;
  }, [messages.length, previousMessageCount]);

  useEffect(() => {
    setPreviousMessageCount(messages.length);
  }, [messages.length]);

  const waitForMediaToLoad = (container: HTMLElement) => {
    const mediaElements = container.querySelectorAll("img, video, audio");
    const promises = Array.from(mediaElements).map(
      (media) =>
        new Promise((resolve) => {
          if (media instanceof HTMLImageElement) {
            if (media.complete) resolve(true);
            else media.onload = media.onerror = () => resolve(true);
          } else if (
            media instanceof HTMLVideoElement ||
            media instanceof HTMLAudioElement
          ) {
            if (media.readyState === 4) resolve(true);
            else media.oncanplaythrough = () => resolve(true);
          }
        })
    );
    return Promise.all(promises);
  };

  useEffect(() => {
    if (newMessageAdded && containerRef.current) {
      const container = containerRef.current;
      waitForMediaToLoad(container).then(() => {
        container.scrollTop = container.scrollHeight;
        playMessageSound();
      });
    }
  }, [newMessageAdded, messages, playMessageSound]);

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof messages }[] = [];

    messages.forEach((msg) => {
      const messageDate = new Date(msg.createdAt).toLocaleDateString();
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.date !== messageDate) {
        groups.push({
          date: messageDate,
          messages: [msg],
        });
      } else {
        lastGroup.messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="p-6 py-16 flex-1 h-full w-full flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="p-6 py-16 flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto backdrop-blur-sm"
    >
      {messages.length > 0 ? (
        groupedMessages.map((group) => (
          <React.Fragment key={group.date}>
            <div className="sticky -top-5 z-10 flex justify-center mb-4">
              <div className="bg-black bg-opacity-30 text-white text-xs p-1 rounded">
                {group.date || "Today"}
              </div>
            </div>
            {group.messages.map((msg, index) => {
              const isNewMessage =
                newMessageAdded &&
                index === group.messages.length - 1 &&
                group === groupedMessages[groupedMessages.length - 1];

              return chatType === ChatType.CHANNEL ? (
                <ChannelMessage key={msg.id} message={msg} />
              ) : (
                <Message
                  key={msg.id}
                  message={msg}
                  shouldAnimate={isNewMessage}
                  chatType={chatType}
                />
              );
            })}
          </React.Fragment>
        ))
      ) : (
        <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
          No messages yet!
        </div>
      )}

      <TypingIndicator
        chatId={activeChatId}
        userIds={typingUsers}
        members={chatMembers || []}
      />
    </div>
  );
};

export default React.memo(ChatBox);
