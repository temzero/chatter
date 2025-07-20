import React from "react";
import ContactInfoItem from "@/components/ui/contactInfoItem";
import { ChatResponse } from "@/types/responses/chat.response";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import FriendshipBtn from "@/components/ui/FriendshipBtn";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { useActiveChat } from "@/stores/chatStore";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useActiveMembers } from "@/stores/chatMemberStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useMessageStore } from "@/stores/messageStore";
import { useMuteControl } from "@/hooks/useMuteControl";
import { SidebarInfoHeaderIcons } from "@/components/ui/SidebarInfoHeaderIcons";

const DirectChat: React.FC = () => {
  const activeChat = useActiveChat() as ChatResponse;
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const chatMembers = useActiveMembers();
  const openModal = useModalStore((state) => state.openModal);
  const setDisplaySearchMessage = useMessageStore(
    (state) => state.setDisplaySearchMessage
  );
  const { mute, unmute } = useMuteControl(activeChat.id, activeChat.myMemberId);

  const chatPartner = chatMembers?.find(
    (member) => member.id !== activeChat.myMemberId
  ) as DirectChatMember;

  if (!chatPartner || !activeChat) return null;

  // Header buttons with title
  const headerIcons: {
    icon: string;
    title: string;
    action: () => void;
    className?: string;
  }[] = [];

  if (chatPartner.isBlockedByMe) {
    headerIcons.push({
      icon: "lock_open_right",
      title: "Unblock User",
      action: () =>
        openModal(ModalType.UNBLOCK_USER, { blockedUser: chatPartner }),
      className: "text-[--primary-green]",
    });
  } else if (chatPartner.isBlockedMe) {
    headerIcons.push({
      icon: "block",
      title: "Blocked by User",
      action: () =>
        openModal(ModalType.BLOCK_USER, { userToBlock: chatPartner }),
    });
  } else {
    if (activeChat.mutedUntil) {
      headerIcons.push({
        icon: "notifications_off",
        title: "Unmute",
        action: unmute,
      });
    } else {
      headerIcons.push({
        icon: "notifications",
        title: "Mute",
        action: mute,
      });
    }

    headerIcons.push(
      {
        icon: "search",
        title: "Search",
        action: () => {
          setDisplaySearchMessage(true);
        },
      },
      {
        icon: "block",
        title: "Block User",
        action: () =>
          openModal(ModalType.BLOCK_USER, { userToBlock: chatPartner }),
      },
      {
        icon: "edit",
        title: "Edit",
        action: () => setSidebarInfo("directEdit"),
      }
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <SidebarInfoHeaderIcons icons={headerIcons} />

      <div className="flex border flex-col justify-center items-center gap-4 p-4 w-full h-full overflow-y-auto">
        <Avatar
          size="36"
          avatarUrl={chatPartner.avatarUrl}
          name={chatPartner.nickname || chatPartner.firstName}
          isBlocked={chatPartner.isBlockedByMe}
        />
        <h1 className="text-xl font-semibold">{activeChat.name}</h1>
        {chatPartner.nickname && (
          <h2 className="text-sm opacity-80 -mt-1">
            {chatPartner.firstName} {chatPartner.lastName}
          </h2>
        )}
        {chatPartner.bio && (
          <p className="text-center opacity-80">{chatPartner.bio}</p>
        )}

        {chatPartner.isBlockedMe && (
          <h1 className="text-red-500">Blocked Me</h1>
        )}
        {chatPartner.isBlockedByMe ? (
          <h1 className="text-red-500">
            You've blocked this{" "}
            {chatPartner.friendshipStatus === FriendshipStatus.ACCEPTED
              ? "friend"
              : "user"}
          </h1>
        ) : (
          <FriendshipBtn
            userId={chatPartner.userId}
            username={chatPartner.username}
            firstName={chatPartner.firstName}
            lastName={chatPartner.lastName}
            avatarUrl={chatPartner.avatarUrl ?? undefined}
            friendshipStatus={chatPartner.friendshipStatus}
            className="bg-[var(--primary-green)]"
          />
        )}

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
      </div>
    </div>
  );
};

export default DirectChat;
