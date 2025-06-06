import React from "react";
import ContactInfoItem from "@/components/ui/contactInfoItem";
import { DirectChatResponse } from "@/types/chat";
import {
  SidebarInfoModes,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import getChatName from "@/utils/getChatName";
import FriendshipBtn from "@/components/ui/FriendshipBtn";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { useActiveChat } from "@/stores/chatStore";

const DirectChat: React.FC = () => {
  const activeChat = useActiveChat() as DirectChatResponse;
  const { setSidebarInfo } = useSidebarInfoStore();
  if (!activeChat) return;
  const chatPartner = activeChat.chatPartner;

  if (!chatPartner) {
    console.error("No chatPartner found!");
    return;
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 px-4 w-full h-full">
      <ChatAvatar chat={activeChat} type="info" />
      <h1 className="text-xl font-semibold">{getChatName(activeChat)}</h1>
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
        {(
          [
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
          ] as {
            icon: string;
            text: string;
            action: SidebarInfoModes;
          }[]
        ).map(({ icon, text, action }) => (
          <React.Fragment key={text}>
            <div
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
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DirectChat;
