import React from "react";
import { ChatResponse } from "@/types/responses/chat.response";
import { useActiveChat } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import MemberItem from "./GroupChatMember";
import { ChatMemberRole } from "@/types/enums/ChatMemberRole";
import { SidebarInfoModes } from "@/stores/sidebarInfoStore";
import { useActiveMembers } from "@/stores/chatMemberStore";

const GroupChat: React.FC = () => {
  const activeChat = useActiveChat() as ChatResponse;
  const activeMembers = useActiveMembers() || [];
  const { setSidebarInfo } = useSidebarInfoStore();

  // Header buttons specific to group chat
  const showEditButton =
    activeChat.myRole !== undefined &&
    [ChatMemberRole.ADMIN, ChatMemberRole.OWNER].includes(activeChat.myRole);

  const headerIcons: {
    icon: string;
    action: () => void;
    className?: string;
  }[] = [
    { icon: "notifications", action: () => {} },
    { icon: "search", action: () => {} },
    ...(showEditButton
      ? [{ icon: "edit", action: () => setSidebarInfo("groupEdit") }]
      : []),
  ];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header moved inside GroupChat */}
      <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
        {headerIcons.map(({ icon, action, className = "" }) => (
          <a
            key={icon}
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
