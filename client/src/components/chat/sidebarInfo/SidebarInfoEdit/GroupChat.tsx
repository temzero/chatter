import React from "react";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import {
  getSetSidebarInfo,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { useMessageStore } from "@/stores/messageStore";
import { useMuteControl } from "@/common/hooks/useMuteControl";
import { SidebarInfoHeaderIcons } from "@/components/ui/icons/SidebarInfoHeaderIcons";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { rolePriority } from "@/shared/types/enums/chat-member-role.enum";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { useIsMobile } from "@/stores/deviceStore";
import { useTranslation } from "react-i18next";
import MemberItem from "./MemberItem";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";

interface GroupChatProps {
  activeChat: ChatResponse;
  activeMembers: ChatMemberResponse[] | undefined;
}

const GroupChat: React.FC<GroupChatProps> = ({ activeChat, activeMembers }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const setSidebarInfo = getSetSidebarInfo();
  const setSidebarInfoVisible =
    useSidebarInfoStore.getState().setSidebarInfoVisible;

  const setDisplaySearchMessage =
    useMessageStore.getState().setDisplaySearchMessage;
  const openModal = getOpenModal();
  const { mute, unmute } = useMuteControl(
    activeChat?.id,
    activeChat?.myMemberId
  );

  // Header buttons specific to group chat
  const showEditButton =
    activeChat?.myRole !== undefined &&
    [ChatMemberRole.ADMIN, ChatMemberRole.OWNER].includes(activeChat.myRole);

  const headerIcons: {
    icon: string;
    title: string;
    action: () => void;
    className?: string;
  }[] = [
    {
      icon: "search",
      title: t("common.actions.search"),
      action: () => {
        setDisplaySearchMessage(true);
      },
    },
    ...(showEditButton
      ? [
          {
            icon: "edit",
            title: t("common.actions.edit"),
            action: () => setSidebarInfo(SidebarInfoMode.GROUP_EDIT),
          },
        ]
      : [
          {
            icon: "logout",
            title: t("common.actions.leave"),
            action: () => openModal(ModalType.LEAVE_CHAT, { chat: activeChat }),
          },
        ]),
  ];

  // Conditionally add mute/unmute buttons at the beginning
  if (activeChat.mutedUntil) {
    headerIcons.unshift({
      icon: "notifications_off",
      title: t("common.actions.unmute"),
      action: unmute,
      className: "",
    });
  } else {
    headerIcons.unshift({
      icon: "notifications",
      title: t("common.actions.mute"),
      action: mute,
      className: "",
    });
  }

  if (isMobile) {
    headerIcons.unshift({
      icon: "arrow_back",
      title: t("common.actions.back"),
      action: () => setSidebarInfoVisible(false),
    });
  }

  // Group members by role
  const groupedMembers = activeMembers?.reduce(
    (acc: Record<ChatMemberRole, typeof activeMembers>, member) => {
      const role: ChatMemberRole = member.role || ChatMemberRole.MEMBER;
      if (!acc[role]) acc[role] = [];
      acc[role].push(member);
      return acc;
    },
    {} as Record<ChatMemberRole, typeof activeMembers>
  );

  if (!groupedMembers || !activeMembers) return;
  // Sort groups by role priority
  const sortedGroups = Object.entries(groupedMembers).sort(
    ([roleA], [roleB]) =>
      (rolePriority[roleA as ChatMemberRole] || 4) -
      (rolePriority[roleB as ChatMemberRole] || 4)
  );

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

        {activeMembers?.length > 0 && (
          <div className="flex flex-col rounded overflow-hidden border-2 border-[--border-color] w-full">
            {/* Display all members grouped by role */}
            {sortedGroups.map(([role, members]) => (
              <div key={role}>
                {members.map((member) => (
                  <MemberItem key={member.userId} member={member} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
