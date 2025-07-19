import React from "react";
import { ChatResponse } from "@/types/responses/chat.response";
import { useActiveChat } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import MemberItem from "./GroupChatMember";
import { ChatMemberRole } from "@/types/enums/ChatMemberRole";
import { SidebarInfoModes } from "@/stores/sidebarInfoStore";
import { useActiveMembers, useChatMemberStore } from "@/stores/chatMemberStore";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { toast } from "react-toastify";

const GroupChat: React.FC = () => {
  const activeChat = useActiveChat() as ChatResponse;
  const activeMembers = useActiveMembers() || [];
  const openModal = useModalStore((state) => state.openModal);
  const { setSidebarInfo } = useSidebarInfoStore();

  const handleUnmute = async () => {
    try {
      await useChatMemberStore
        .getState()
        .updateMember(activeChat.id, activeChat.myMemberId, {
          mutedUntil: null,
        });
      toast.success("Unmuted group chat successfully");
    } catch (error) {
      console.error("Failed to unmute group chat:", error);
      toast.error("Failed to unmute group chat");
    }
  };

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
    { icon: "search", title: "Search", action: () => {} },
    ...(showEditButton
      ? [
          {
            icon: "edit",
            title: "Edit",
            action: () => setSidebarInfo("groupEdit"),
          },
        ]
      : []),
  ];

  // Conditionally add mute/unmute buttons at the beginning
  if (activeChat.mutedUntil) {
    headerIcons.unshift({
      icon: "notifications_off",
      title: "Unmute",
      action: handleUnmute,
      className: "",
    });
  } else {
    headerIcons.unshift({
      icon: "notifications",
      title: "Mute",
      action: () =>
        openModal(ModalType.MUTE, {
          chatId: activeChat.id,
          myMemberId: activeChat.myMemberId,
        }),
      className: "",
    });
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header moved inside GroupChat */}
      <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
        {headerIcons.map(({ icon, title, action, className = "" }) => (
          <a
            key={icon}
            title={title}
            className={`flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100 ${className}`}
            onClick={action}
          >
            <i className="material-symbols-outlined">{icon}</i>
          </a>
        ))}
      </header>

      {/* Chat content */}
      <div className="flex flex-col justify-center items-center gap-4 p-4 w-full overflow-y-auto">
        <ChatAvatar chat={activeChat} type="info" />
        <h1 className="text-xl font-semibold">{activeChat.name}</h1>
        {activeChat.description && (
          <p className="text-sm opacity-80 mb-2">{activeChat.description}</p>
        )}

        <div className="flex flex-col custom-border rounded w-full">
          {[
            {
              icon: "bookmark",
              title: "Saved Messages",
              action: "saved" as SidebarInfoModes,
            },
            {
              icon: "attach_file",
              title: "Media & Files",
              action: "media" as SidebarInfoModes,
            },
          ].map(({ icon, title, action }) => (
            <div
              key={title}
              title={title}
              className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]"
              onClick={() => setSidebarInfo(action)}
            >
              <div className="flex gap-2">
                <span className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                  <i className="material-symbols-outlined">{icon}</i>
                </span>
                <h1>{title}</h1>
              </div>
            </div>
          ))}
        </div>

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
