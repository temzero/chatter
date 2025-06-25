// components/modals/ForwardMessageModal.tsx
import React from "react";
import { MessageResponse } from "@/types/messageResponse";
import { useModalStore } from "@/stores/modalStore";
import { useChatStore } from "@/stores/chatStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { ForwardMessagePayload } from "@/types/sendMessagePayload";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import SearchBar from "../ui/SearchBar";

interface ForwardMessageModalProps {
  message: MessageResponse;
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  message,
}) => {
  const closeModal = useModalStore((state) => state.closeModal);
  const filteredChats = useChatStore((state) => state.filteredChats);
  const forwardChats = filteredChats.filter((chat) => chat.id !== message.chatId);

  const handleForward = async (chatId: string) => {
    const payload: ForwardMessagePayload = {
      chatId,
      messageId: message.id,
    };

    try {
      chatWebSocketService.forwardMessage(payload);
      closeModal();
    } catch (error) {
      console.error("Failed to forward message:", error);
    }
  };

  return (
    <div className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded p-4 max-w-xl w-[400px] custom-border">
      <h1 className="font-bold text-center text-xl mb-4 flex items-center justify-center gap-2">
        Forward Message To...
        {/* <span className="material-symbols-outlined text-3xl">send</span> */}
      </h1>
      <SearchBar placeholder='Search for chat to forward to'/>
      <div className="flex flex-col items-start h-[50vh] overflow-y-auto mt-2">
        {forwardChats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center w-full gap-3 p-2 text-left transition custom-border-b"
          >
            <ChatAvatar chat={chat} type="header" />
            <h2 className="font-medium">{chat.name}</h2>
            {/* <button className="ml-auto " onClick={() => handleForward(chat.id)}>
              Forward
            </button> */}

            <button
              className={` ml-auto w-10 h-8 opacity-60 hover:opacity-100 rounded hover:bg-[var(--primary-green)] hover:border-2 hover:border-green-400 flex items-center justify-center text-white transition-all duration-300
              }`}
              onClick={() => handleForward(chat.id)}
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-3xl">send</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForwardMessageModal;
