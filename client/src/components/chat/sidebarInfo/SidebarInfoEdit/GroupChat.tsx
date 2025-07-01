import React from "react";
import { ChatResponse } from "@/types/responses/chat.response";
import { useActiveChat } from "@/stores/chatStore";
import {
  SidebarInfoModes,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import MemberItem from "./GroupChatMember";
import { useActiveMembers } from "@/stores/chatMemberStore";

const GroupChat: React.FC = () => {
  const activeChat = useActiveChat() as ChatResponse;
  const activeMembers = useActiveMembers() || [];
  console.log("activeMembers", activeMembers);
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
            <MemberItem key={member.userId} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupChat;
