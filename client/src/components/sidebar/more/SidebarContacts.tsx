// SidebarContacts.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { useChatStore } from "@/stores/chatStore";
import { ChatType } from "@/types/enums/ChatType";
import { DirectChatResponse } from "@/types/chat";
import getChatName from "@/utils/getChatName";
import { Avatar } from "@/components/ui/avatar/Avatar";

interface SidebarContactsProps {
  onVideoCall?: (phoneNumber: string) => void;
  onAudioCall?: (phoneNumber: string) => void;
}

const SidebarContacts: React.FC<SidebarContactsProps> = ({
  onVideoCall,
  onAudioCall,
}) => {
  const chats = useChatStore((s) => s.chats);
  const directChats = chats.filter(
    (chat): chat is DirectChatResponse =>
      chat.type === ChatType.DIRECT && !!chat.chatPartner?.phoneNumber
  );

  const handleVideoCall =
    (chat: DirectChatResponse) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onVideoCall && chat.chatPartner?.phoneNumber) {
        onVideoCall(chat.chatPartner.phoneNumber);
      }
    };

  const handleAudioCall =
    (chat: DirectChatResponse) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAudioCall && chat.chatPartner?.phoneNumber) {
        onAudioCall(chat.chatPartner.phoneNumber);
      }
    };

  return (
    <SidebarLayout title="Contacts">
      {directChats.length > 0 ? (
        directChats.map((chat) => {
          const chatPartner = chat.chatPartner;

          return (
            <div
              key={chat.id}
              className="flex gap-3 items-center justify-between custom-border-b p-3 hover:bg-[var(--hover-color)]  cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  avatarUrl={chatPartner?.avatarUrl}
                  firstName={chatPartner.firstName}
                  lastName={chatPartner.lastName}
                  size="10"
                />
                <h1 className="font-medium">{getChatName(chat)}</h1>
              </div>
              <div className="flex gap-2 items-center">
                {chatPartner?.phoneNumber && (
                  <>
                    <button
                      className="opacity-60 hover:opacity-100 hover:text-green-500"
                      onClick={handleVideoCall(chat)}
                      title="Video call"
                    >
                      <i className="material-symbols-outlined">videocam</i>
                    </button>
                    <button
                      className="opacity-60 hover:opacity-100 hover:text-green-500"
                      onClick={handleAudioCall(chat)}
                      title="Audio call"
                    >
                      <i className="material-symbols-outlined">phone_enabled</i>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center mt-8 opacity-60">
          <i className="material-symbols-outlined text-6xl mb-4">contacts</i>
          <p>No contacts with phone numbers</p>
        </div>
      )}
    </SidebarLayout>
  );
};

export default SidebarContacts;
