import React from "react";
import { ChatResponse } from "@/types/responses/chat.response";
import { useActiveChat } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import MemberItem from "./GroupChatMember";
import { ChatMemberRole } from "@/types/enums/ChatMemberRole";
import { useActiveMembers } from "@/stores/chatMemberStore";
import { useMessageStore } from "@/stores/messageStore";
import { useMuteControl } from "@/hooks/useMuteControl";
import { SidebarInfoHeaderIcons } from "@/components/ui/SidebarInfoHeaderIcons";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";
import { ModalType, useModalStore } from "@/stores/modalStore";

const GroupChat: React.FC = () => {
  const activeChat = useActiveChat() as ChatResponse;
  const activeMembers = useActiveMembers() || [];
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const setDisplaySearchMessage = useMessageStore(
    (state) => state.setDisplaySearchMessage
  );
  const openModal = useModalStore((state) => state.openModal);
  const { mute, unmute } = useMuteControl(activeChat.id, activeChat.myMemberId);

  // Header buttons specific to group chat
  const showEditButton =
    activeChat.myRole !== undefined &&
    [ChatMemberRole.ADMIN, ChatMemberRole.OWNER].includes(activeChat.myRole);

  const headerIcons: {
    icon: string;
    title: string;
    action: () => void;
    className?: string;
  }[] = [
    {
      icon: "search",
      title: "Search",
      action: () => {
        setDisplaySearchMessage(true);
      },
    },
    ...(showEditButton
      ? [
          {
            icon: "edit",
            title: "Edit",
            action: () => setSidebarInfo(SidebarInfoMode.GROUP_EDIT),
          },
        ]
      : [
          {
            icon: "logout",
            title: "Leave",
            action: () => openModal(ModalType.LEAVE_CHAT, { chat: activeChat }),
          },
        ]),
  ];

  // Conditionally add mute/unmute buttons at the beginning
  if (activeChat.mutedUntil) {
    headerIcons.unshift({
      icon: "notifications_off",
      title: "Unmute",
      action: unmute,
      className: "",
    });
  } else {
    headerIcons.unshift({
      icon: "notifications",
      title: "Mute",
      action: mute,
      className: "",
    });
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header moved inside GroupChat */}
      <SidebarInfoHeaderIcons icons={headerIcons} />

      {/* Chat content */}
      <div className="flex flex-col justify-center items-center gap-4 p-4 w-full overflow-y-auto">
        <ChatAvatar chat={activeChat} type="info" />
        <h1 className="text-xl font-semibold">{activeChat.name}</h1>
        {activeChat.description && (
          <p className="text-sm opacity-80 mb-2">{activeChat.description}</p>
        )}

        {activeMembers.length > 0 && (
          <div className="flex flex-col rounded overflow-hidden custom-border w-full">
            {activeMembers.map((member) => (
              <MemberItem key={member.userId} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
