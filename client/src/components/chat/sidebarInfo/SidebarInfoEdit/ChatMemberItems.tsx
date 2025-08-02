import { useState, useRef, useEffect } from "react";
import { GroupChatMember } from "@/types/responses/chatMember.response";
import { ChatMemberRole } from "@/types/enums/chatMemberRole";
import { ChatMemberStatus } from "@/types/enums/chatMemberStatus";
import { Avatar } from "@/components/ui/avatar/Avatar";
import React from "react";

interface ChatMemberItemsProps {
  members: GroupChatMember[];
  currentUserId: string;
}

const getRoleDisplayName = (role: ChatMemberRole) => {
  switch (role) {
    case ChatMemberRole.OWNER:
      return "Owner";
    case ChatMemberRole.ADMIN:
      return "Admin";
    case ChatMemberRole.GUEST:
      return "Guest";
    default:
      return "Member";
  }
};

const getStatusDisplayName = (status: ChatMemberStatus) => {
  switch (status) {
    case ChatMemberStatus.LEFT:
      return "Left";
    case ChatMemberStatus.BANNED:
      return "Banned";
    default:
      return null;
  }
};

const rolePriority = {
  [ChatMemberRole.OWNER]: 1,
  [ChatMemberRole.ADMIN]: 2,
  [ChatMemberRole.GUEST]: 3,
  [ChatMemberRole.MEMBER]: 4,
};

export const ChatMemberItems = ({
  members,
  currentUserId,
}: ChatMemberItemsProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    member: GroupChatMember | null;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const myMember = members.find((m) => m.userId === currentUserId);
  const myRole = myMember?.role;

  const handleRightClick = (e: React.MouseEvent, member: GroupChatMember) => {
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
      return; // Block context menu for guests or undefined roles
    }

    const menuWidth = 192;
    const menuHeight = 160;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > windowWidth) x = windowWidth - menuWidth;
    if (y + menuHeight > windowHeight) y = windowHeight - menuHeight;

    setContextMenu({ x, y, member });
  };

  const handleClickMember = (member: GroupChatMember) => {
    console.log("Clicked member:", member);
  };

  const handleSetNickname = (member: GroupChatMember) => {
    console.log("Set nickname for:", member);
    setContextMenu(null);
  };

  const handleRemoveMember = (member: GroupChatMember) => {
    console.log("Remove member:", member);
    setContextMenu(null);
  };

  const handleChangeRole = (member: GroupChatMember, role: ChatMemberRole) => {
    console.log(`Change role of ${member.firstName} to ${role}`);
    setContextMenu(null);
  };

  const itemClasses =
    "flex items-center p-2 hover:bg-[var(--hover-color)] border-t border-[var(--border-color)] cursor-pointer";

  const otherMembers = members.filter((m) => m.userId !== currentUserId);
  const grouped = otherMembers.reduce((acc, m) => {
    const role = m.role || "MEMBER";
    if (!acc[role]) acc[role] = [];
    acc[role].push(m);
    return acc;
  }, {} as Record<string, GroupChatMember[]>);

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) =>
      (rolePriority[a as ChatMemberRole] || 4) -
      (rolePriority[b as ChatMemberRole] || 4)
  );

  return (
    <div className="flex flex-col gap-3 rounded overflow-hidden w-full relative">
      {myMember && (
        <div className="custom-border rounded">
          <div className="p-2 bg-[--hover-color] text-sm font-medium text-[--primary-green]">
            You, the {getRoleDisplayName(myMember.role)}
          </div>
          <div
            className={itemClasses}
            onClick={() => handleClickMember(myMember)}
            onContextMenu={(e) => handleRightClick(e, myMember)}
          >
            <div className="flex-shrink-0 mr-3">
              <Avatar
                avatarUrl={myMember.avatarUrl}
                name={myMember.firstName}
                size="10"
                textSize="sm"
              />
            </div>
            <div className="flex-grow">
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
          <div className="p-2 bg-[--hover-color] text-sm font-medium text-[var(--text-secondary)]">
            {getRoleDisplayName(role as ChatMemberRole)}s ({groupMembers.length}
            )
          </div>
          {groupMembers.map((member) => (
            <div
              key={member.userId}
              className={itemClasses}
              onClick={() => handleClickMember(member)}
              onContextMenu={(e) => handleRightClick(e, member)}
            >
              <div className="flex-shrink-0 mr-3">
                <Avatar
                  avatarUrl={member.avatarUrl}
                  name={member.firstName}
                  size="10"
                  textSize="sm"
                />
              </div>
              <div className="flex-grow">
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
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          member={contextMenu.member}
          currentRole={myRole}
          onClose={() => setContextMenu(null)}
          onSetNickname={handleSetNickname}
          onRemoveMember={handleRemoveMember}
          onChangeRole={handleChangeRole}
          ref={menuRef}
        />
      )}
    </div>
  );
};

interface ContextMenuProps {
  x: number;
  y: number;
  member: GroupChatMember;
  currentRole: ChatMemberRole;
  onClose: () => void;
  onSetNickname: (member: GroupChatMember) => void;
  onRemoveMember: (member: GroupChatMember) => void;
  onChangeRole: (member: GroupChatMember, role: ChatMemberRole) => void;
}

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  (
    {
      x,
      y,
      member,
      currentRole,
      onClose,
      onSetNickname,
      onRemoveMember,
      onChangeRole,
    },
    ref
  ) => {
    const classes =
      "flex items-center gap-1 px-4 py-2 hover:bg-[--hover-color] cursor-pointer";

    return (
      <div
        ref={ref}
        className="fixed z-[1000] bg-[--background-color] border custom-border rounded shadow-lg w-48"
        style={{ top: `${y}px`, left: `${x}px` }}
      >
        <div
          className={classes}
          onClick={() => {
            onSetNickname(member);
            onClose();
          }}
        >
          Set Nickname
        </div>

        {currentRole === ChatMemberRole.OWNER && (
          <>
            <div
              className={classes}
              onClick={() => {
                onChangeRole(member, ChatMemberRole.ADMIN);
                onClose();
              }}
            >
              Set as Admin
            </div>
            <div
              className={classes}
              onClick={() => {
                onChangeRole(member, ChatMemberRole.MEMBER);
                onClose();
              }}
            >
              Set as Member
            </div>
            <div
              className={classes}
              onClick={() => {
                onChangeRole(member, ChatMemberRole.OWNER);
                onClose();
              }}
            >
              Promote to Owner
            </div>
          </>
        )}

        {(currentRole === ChatMemberRole.ADMIN ||
          currentRole === ChatMemberRole.OWNER) && (
          <>
            <div
              className={`${classes} text-red-500`}
              onClick={() => {
                onRemoveMember(member);
                onClose();
              }}
            >
              Remove
            </div>
          </>
        )}
      </div>
    );
  }
);

ContextMenu.displayName = "ContextMenu";
