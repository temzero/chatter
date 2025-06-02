import React from "react";
import { GroupChatResponse } from "@/types/chat";
import { useChatStore } from "@/stores/chatStore";
import {
  SidebarInfoModes,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";

const GroupChat: React.FC = () => {
  const activeChat = useChatStore((s) => s.activeChat) as GroupChatResponse;
  const { activeMembers } = useChatStore();

  const { createOrGetDirectChat } = useChatStore();
  const { setSidebarInfo } = useSidebarInfoStore();

  return (
    <div className="flex flex-col justify-center items-center gap-4 px-4 w-full">
      <ChatAvatar chat={activeChat} type="info" />
      <h1 className="text-xl font-semibold">{activeChat.name}</h1>
      {activeChat.description && (
        <p className="text-sm opacity-80 mb-2">{activeChat.description}</p>
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

      {activeMembers.length > 0 && (
        <div className="flex flex-col rounded overflow-hidden custom-border w-full">
          {activeMembers.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between hover:bg-[var(--hover-color)] p-2 cursor-pointer"
              onClick={() => createOrGetDirectChat(member.userId)}
            >
              <div className="flex gap-2 items-center">
                <Avatar
                  avatarUrl={member.avatarUrl}
                  firstName={member.firstName}
                  lastName={member.lastName}
                  size="8"
                  textSize="sm"
                />
                <h1 className="text-sm">
                  {member.nickname || `${member.firstName} ${member.lastName}`}
                </h1>
              </div>
              {member.isBanned ? (
                <span className="material-symbols-outlined">dangerous</span>
              ) : (
                member.isAdmin && (
                  <span className="material-symbols-outlined opacity-50">
                    manage_accounts
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupChat;
