import React from "react";
import ContactInfoItem from "@/components/ui/contactInfoItem";
import { ChatResponse } from "@/types/responses/chat.response";
import {
  SidebarInfoModes,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import FriendshipBtn from "@/components/ui/FriendshipBtn";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { useActiveChat } from "@/stores/chatStore";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useActiveMembers } from "@/stores/chatMemberStore";

const DirectChat: React.FC = () => {
  const activeChat = useActiveChat() as ChatResponse;
  const { setSidebarInfo } = useSidebarInfoStore();
  const chatMembers = useActiveMembers();
  const openModal = useModalStore((state) => state.openModal);

  const chatPartner = chatMembers?.find(
    (member) => member.id !== activeChat.myMemberId
  ) as DirectChatMember;

  if (!chatPartner || !activeChat) return null;

  // Header buttons specific to direct chat
  const headerIcons = [
    { icon: "notifications", action: () => {} },
    { icon: "search", action: () => {} },
    {
      icon: "block",
      action: () => openModal(ModalType.BLOCK_USER, { chatPartner: chatPartner }),
      className: "rotate-90",
    },
    {
      icon: "edit",
      action: () => setSidebarInfo("directEdit"),
    },
  ];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header moved inside DirectChat */}
      <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
        {headerIcons.map(({ icon, action, className = "" }) => (
          <a
            key={icon}
            className={`flex items-center rounded-full cursor-pointer opacity-50 hover:opacity-100 ${className}`}
            onClick={action}
          >
            <i className="material-symbols-outlined">{icon}</i>
          </a>
        ))}
      </header>

      {/* Chat content */}
      <div className="flex flex-col justify-center items-center gap-4 p-4 w-full h-full overflow-y-auto">
        <ChatAvatar chat={activeChat} type="info" />
        <h1 className="text-xl font-semibold">{activeChat.name}</h1>
        {chatPartner.nickname && (
          <h2 className="text-sm opacity-80 -mt-1">
            {chatPartner.firstName} {chatPartner.lastName}
          </h2>
        )}
        {chatPartner.bio && (
          <p className="text-center opacity-80">{chatPartner.bio}</p>
        )}

        <FriendshipBtn
          userId={chatPartner.userId}
          username={chatPartner.username}
          firstName={chatPartner.firstName}
          lastName={chatPartner.lastName}
          avatarUrl={chatPartner.avatarUrl ?? undefined}
          friendshipStatus={chatPartner.friendshipStatus}
          className="bg-[var(--primary-green)]"
        />

        {chatPartner.friendshipStatus === FriendshipStatus.ACCEPTED && (
          <div className="w-full flex flex-col items-center rounded font-light custom-border overflow-hidden">
            <ContactInfoItem
              icon="alternate_email"
              value={chatPartner.username}
              copyType="username"
              defaultText="No username"
            />
            <ContactInfoItem
              icon="call"
              value={chatPartner.phoneNumber || null}
              copyType="phoneNumber"
            />
            <ContactInfoItem
              icon="mail"
              value={chatPartner.email}
              copyType="email"
            />
            <ContactInfoItem
              icon="cake"
              value={chatPartner.birthday}
              copyType="birthday"
            />
          </div>
        )}

        <div className="flex flex-col custom-border rounded w-full">
          {[
            {
              icon: "bookmark",
              text: "Saved Messages",
              action: "saved" as SidebarInfoModes,
            },
            {
              icon: "attach_file",
              text: "Media & Files",
              action: "media" as SidebarInfoModes,
            },
          ].map(({ icon, text, action }) => (
            <div
              key={text}
              className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]"
              onClick={() => setSidebarInfo(action)}
            >
              <div className="flex gap-2">
                <span className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                  <i className="material-symbols-outlined">{icon}</i>
                </span>
                <h1>{text}</h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DirectChat;
