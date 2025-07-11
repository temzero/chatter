// SidebarContacts.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { useChatStore } from "@/stores/chatStore";
import { ChatType } from "@/types/enums/ChatType";
import { ChatResponse } from "@/types/responses/chat.response";
import { useDirectChatPartner } from "@/stores/chatMemberStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { DirectChatMember } from "@/types/responses/chatMember.response";

interface SidebarContactsProps {
  onVideoCall?: (phoneNumber: string) => void;
  onAudioCall?: (phoneNumber: string) => void;
}

interface ContactItemProps {
  chat: ChatResponse;
  onVideoCall?: (phoneNumber: string) => void;
  onAudioCall?: (phoneNumber: string) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  chat,
  onVideoCall,
  onAudioCall,
}) => {
  const chatPartner = useDirectChatPartner(
    chat.id,
    chat.myMemberId
  ) as DirectChatMember;

  const handleVideoCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatPartner?.phoneNumber) {
      onVideoCall?.(chatPartner.phoneNumber);
    }
  };

  const handleAudioCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatPartner?.phoneNumber) {
      onAudioCall?.(chatPartner.phoneNumber);
    }
  };

  return (
    <div className="flex gap-3 items-center justify-between custom-border-b p-3 hover:bg-[var(--hover-color)] cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar
          avatarUrl={chatPartner?.avatarUrl}
          name={chatPartner?.firstName || ""}
          size="10"
        />
        <h1 className="font-medium">
          {chatPartner?.firstName || chat.name || "Unknown"}
        </h1>
      </div>
      <div className="flex gap-2 items-center">
        {chatPartner?.phoneNumber && (
          <>
            <button
              className="opacity-60 hover:opacity-100 hover:text-green-500"
              onClick={handleVideoCall}
              title="Video call"
            >
              <i className="material-symbols-outlined">videocam</i>
            </button>
            <button
              className="opacity-60 hover:opacity-100 hover:text-green-500"
              onClick={handleAudioCall}
              title="Audio call"
            >
              <i className="material-symbols-outlined">phone_enabled</i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SidebarContacts: React.FC<SidebarContactsProps> = ({
  onVideoCall,
  onAudioCall,
}) => {
  const chats = useChatStore((s) => s.chats);
  const directChats = chats.filter(
    (chat): chat is ChatResponse => chat.type === ChatType.DIRECT
  );

  return (
    <SidebarLayout title="Contacts">
      {directChats.length > 0 ? (
        directChats.map((chat) => (
          <ContactItem
            key={chat.id}
            chat={chat}
            onVideoCall={onVideoCall}
            onAudioCall={onAudioCall}
          />
        ))
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
