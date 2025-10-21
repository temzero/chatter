import React from "react";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useMuteControl } from "@/common/hooks/useMuteControl";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useFolderStore } from "@/stores/folderStore";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";

interface ChatContextMenuProps {
  x: number;
  y: number;
  chat: ChatResponse;
  onClose: () => void;
}

interface MenuAction {
  label: string;
  icon: string;
  onClick: () => void;
  className?: string;
}

export const ChatListItemContextMenu = React.forwardRef<
  HTMLDivElement,
  ChatContextMenuProps
>(({ x, y, chat, onClose }, ref) => {
  const { mute, unmute } = useMuteControl(chat.id, chat.myMemberId);
  const openModal = getOpenModal();
  const updateMemberLastRead =
    useChatMemberStore.getState().updateMemberLastRead;
  const pinChat = useChatStore.getState().pinChat;
  const folders = useFolderStore((state) => state.folders);

  const isMuted =
    chat.mutedUntil && new Date(chat.mutedUntil).getTime() > Date.now();
  const isUnread = (chat.unreadCount ?? 0) > 0;
  const isPinned = !!chat.pinnedAt;
  const isDirect = chat.type === ChatType.DIRECT;
  const isFolder = folders.length > 0;

  const menuActions: MenuAction[] = [
    {
      label: isMuted ? "Unmute" : "Mute",
      icon: isMuted ? "notifications_off" : "notifications",
      onClick: isMuted ? () => unmute() : () => mute(),
    },

    // ✅ Only show if unread
    ...(isUnread
      ? [
          {
            label: "Mark as Read",
            icon: "check",
            onClick: () => updateMemberLastRead(chat.id, chat.myMemberId, null),
          },
        ]
      : []),

    {
      label: isPinned ? "Unpin" : "Pin Chat",
      icon: isPinned ? "keep_off" : "keep",
      onClick: () => pinChat(chat.myMemberId, !isPinned),
    },

    // ✅ Only show Add to Folder if folder feature exists
    ...(isFolder
      ? [
          {
            label: "Add to Folder",
            icon: "folder_open",
            onClick: () =>
              openModal(ModalType.FOLDER, {
                chat,
              }),
          },
        ]
      : []),

    // ✅ Direct chat → Delete, group chat → Leave
    ...(isDirect
      ? [
          {
            label: "Delete Chat",
            icon: "delete",
            onClick: () =>
              openModal(ModalType.DELETE_CHAT, {
                chat,
              }),
            className: "text-red-500",
          },
        ]
      : [
          {
            label: "Leave Chat",
            icon: "logout",
            onClick: () =>
              openModal(ModalType.LEAVE_CHAT, {
                chat,
              }),
            className: "text-yellow-500",
          },
        ]),
  ];

  return (
    <div
      ref={ref}
      className="fixed bg-[--background-color] border-2 border-[--border-color] rounded shadow-xl w-48"
      style={{ zIndex: 999, top: `${y}px`, left: `${x}px` }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {menuActions.map((action) => (
        <div
          key={action.label}
          className={`flex items-center gap-3 p-2 hover:bg-[--hover-color] opacity-70 hover:opacity-100 cursor-pointer ${
            action.className || ""
          }`}
          onClick={() => {
            action.onClick();
            onClose();
          }}
        >
          <span className="material-symbols-outlined">{action.icon}</span>
          {action.label}
        </div>
      ))}
    </div>
  );
});

ChatListItemContextMenu.displayName = "ChatListItemContextMenu";
