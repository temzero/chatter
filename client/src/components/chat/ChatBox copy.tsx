import React, { useRef, useEffect, useState, useMemo } from "react";
import Message from "./Message";
import ChannelMessage from "./MessageChannel";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import messageSound from "@/assets/sound/message-sent2.mp3";
import { ChatType } from "@/types/enums/ChatType";
import TypingIndicator from "../ui/typingIndicator/TypingIndicator";
import type { ChatResponse } from "@/types/responses/chat.response";
import { useMessagesByChatId } from "@/stores/messageStore";

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
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(true);

  const [playMessageSound] = useSoundEffect(messageSound, 0.5);

  // Track the last message ID to properly detect new messages
  const newMessageAdded = useMemo(() => {
    if (!messages.length || isNewChat) return false;
    return messages[messages.length - 1].id !== lastMessageId;
  }, [messages, lastMessageId, isNewChat]);

  useEffect(() => {
    // Reset tracking when chat changes
    setIsNewChat(true);
    setLastMessageId(null);
  }, [chatId]);

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
    if (containerRef.current) {
      const container = containerRef.current;

      if (isNewChat) {
        waitForMediaToLoad(container).then(() => {
          container.scrollTop = container.scrollHeight;
          if (messages.length) {
            setLastMessageId(messages[messages.length - 1].id);
          }
          setIsNewChat(false);
        });
      } else if (newMessageAdded) {
        waitForMediaToLoad(container).then(() => {
          container.scrollTop = container.scrollHeight;
          playMessageSound();
          setLastMessageId(messages[messages.length - 1].id);
        });
      }
    }
  }, [messages, newMessageAdded, playMessageSound, isNewChat]);

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

      <TypingIndicator chatId={chatId} />
    </div>
  );
};

export default React.memo(ChatBox);
