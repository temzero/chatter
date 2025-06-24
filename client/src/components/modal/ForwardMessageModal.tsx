// components/modals/ForwardMessageModal.tsx
import React from "react";
import { MessageResponse } from "@/types/messageResponse";
import { useModalStore } from "@/stores/modalStore";
import { useChatStore } from "@/stores/chatStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { ForwardMessagePayload } from "@/types/sendMessagePayload";

interface ForwardMessageModalProps {
  message: MessageResponse;
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  message,
}) => {
  const closeModal = useModalStore((state) => state.closeModal);
  const chats = useChatStore((state) => state.chats);

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
      <h1 className="font-bold text-center text-xl mb-4">Forward Message</h1>
      <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => handleForward(chat.id)}
            className="p-2 text-left hover:bg-[var(--hover-color)] rounded transition"
          >
            <h2 className="font-medium">{chat.name}</h2>
            {chat.lastMessage && (
              <p className="text-sm opacity-60 truncate">
                {chat.lastMessage.content}
              </p>
            )}
          </button>
        ))}
      </div>
      <button
        onClick={closeModal}
        className="mt-4 w-full py-1 bg-[var(--primary-green)] text-white rounded"
      >
        Cancel
      </button>
    </div>
  );
};

export default ForwardMessageModal;
