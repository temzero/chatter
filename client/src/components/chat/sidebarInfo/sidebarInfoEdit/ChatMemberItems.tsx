import React, { useState, useRef } from "react";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { rolePriority } from "@/shared/types/enums/chat-member-role.enum";
import { ChatMemberStatus } from "@/shared/types/enums/chat-member-status.enum";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useTranslation } from "react-i18next";
import { calculateContextMenuPosition } from "@/common/utils/contextMenuUtils";
import { useClickOutside } from "@/common/hooks/keyEvent/useClickOutside";
import MemberContextMenu from "../../../ui/contextMenu/ChatMemberItems-contextMenu";

// 🧩 Role icons + i18n key mapping
const chatMemberRoleMap: Record<
  ChatMemberRole,
  {
    icon: string;
    labelKey: string;
  }
> = {
  [ChatMemberRole.OWNER]: {
    icon: "chess_queen",
    labelKey: "sidebar_info.members_edit.owner",
  },
  [ChatMemberRole.ADMIN]: {
    icon: "badge",
    labelKey: "sidebar_info.members_edit.admin",
  },
  [ChatMemberRole.MEMBER]: {
    icon: "groups",
    labelKey: "sidebar_info.members_edit.member",
  },
  [ChatMemberRole.GUEST]: {
    icon: "person_outline",
    labelKey: "sidebar_info.members_edit.guest",
  },
};

interface ChatMemberItemsProps {
  members: ChatMemberResponse[];
  chatId: string;
  currentUserId?: string;
}

export const ChatMemberItems = ({
  members,
  currentUserId,
}: ChatMemberItemsProps) => {
  const { t } = useTranslation();
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    transformOrigin: string;
    member: ChatMemberResponse | null;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setContextMenu(null));

  const myMember = members.find((m) => m.userId === currentUserId);
  const myRole = myMember?.role;

  const getRoleDisplayName = (role: ChatMemberRole) => {
    const roleInfo = chatMemberRoleMap[role];
    return roleInfo
      ? t(roleInfo.labelKey)
      : t("sidebar_info.members_edit.member");
  };

  const getStatusDisplayName = (status: ChatMemberStatus) => {
    switch (status) {
      case ChatMemberStatus.LEFT:
        return t("sidebar_info.members_edit.status_left");
      case ChatMemberStatus.BANNED:
        return t("sidebar_info.members_edit.status_banned");
      default:
        return null;
    }
  };

  const handleRightClick = (
    e: React.MouseEvent,
    member: ChatMemberResponse
  ) => {
    console.log("handleRightClick");
    e.preventDefault();
    e.stopPropagation();

    if (
      !myRole ||
      ![
        ChatMemberRole.OWNER,
        ChatMemberRole.ADMIN,
        ChatMemberRole.MEMBER,
      ].includes(myRole)
    ) {
      return;
    }

    const menuWidth = 192;
    const menuHeight = 160;
    const position = calculateContextMenuPosition(
      { x: e.clientX, y: e.clientY },
      menuWidth,
      menuHeight
    );

    setContextMenu({ ...position, member });
  };

  const itemClasses =
    "flex items-center p-2 hover:bg-(--hover-color) border-t border-(--border-color) cursor-pointer";

  const otherMembers = members.filter((m) => m.userId !== currentUserId);
  const grouped = otherMembers.reduce((acc, m) => {
    const role = m.role || "MEMBER";
    if (!acc[role]) acc[role] = [];
    acc[role].push(m);
    return acc;
  }, {} as Record<string, ChatMemberResponse[]>);

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) =>
      (rolePriority[a as ChatMemberRole] || 4) -
      (rolePriority[b as ChatMemberRole] || 4)
  );

  return (
    <div className="relative flex flex-col gap-3 rounded overflow-hidden w-full">
      {myMember && (
        <div className="custom-border rounded">
          <div className="flex items-center gap-2 p-2 bg-(--hover-color) text-sm font-medium text-(--primary-green)">
            <span className="material-symbols-outlined">
              {chatMemberRoleMap[myMember.role]?.icon}
            </span>
            {t("sidebar_info.members_edit.you_role", {
              role: getRoleDisplayName(myMember.role),
            })}
          </div>
          <div
            className={itemClasses}
            onContextMenu={(e) => handleRightClick(e, myMember)}
          >
            <div className="shrink-0 mr-3">
              <Avatar
                avatarUrl={myMember.avatarUrl}
                name={myMember.firstName}
                size={10}
                textSize="sm"
              />
            </div>
            <div className="grow">
              <div className="font-semibold">
                {myMember.firstName} {myMember.lastName}
              </div>
              {myMember.nickname && (
                <div className="opacity-50">{myMember.nickname}</div>
              )}
              <div className="text-sm opacity-50 mt-1">
                {getStatusDisplayName(myMember.status)}
              </div>
            </div>
          </div>
        </div>
      )}

      {sortedGroups.map(([role, groupMembers]) => (
        <div key={role} className="custom-border rounded">
          <div className="flex items-center justify-between p-2 bg-(--hover-color) text-sm font-medium">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined">
                {chatMemberRoleMap[role as ChatMemberRole]?.icon}
              </span>
              <span>{getRoleDisplayName(role as ChatMemberRole)}</span>
            </div>
            <p>{groupMembers.length}</p>
          </div>
          {groupMembers.map((member) => (
            <div
              key={member.userId}
              className={itemClasses}
              onContextMenu={(e) => handleRightClick(e, member)}
            >
              <div className="shrink-0 mr-3">
                <Avatar
                  avatarUrl={member.avatarUrl}
                  name={member.firstName}
                  size={10}
                  textSize="sm"
                />
              </div>
              <div className="grow">
                <div className="font-semibold">
                  {member.firstName} {member.lastName}
                </div>
                {member.nickname && (
                  <div className="opacity-50">{member.nickname}</div>
                )}
                <div className="text-sm opacity-50 mt-1">
                  {getStatusDisplayName(member.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {contextMenu?.member && myRole && (
        <MemberContextMenu
          x={contextMenu.position.x}
          y={contextMenu.position.y}
          member={contextMenu.member}
          currentRole={myRole}
          onClose={() => setContextMenu(null)}
          ref={menuRef}
          chatMemberRoleMap={chatMemberRoleMap}
        />
      )}
    </div>
  );
};
