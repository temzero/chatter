import React, { useEffect } from "react";
import { useActiveChat } from "@/stores/chatStore";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import DirectChat from "./sidebarInfoEdit/DirectChat";
import GroupChat from "./sidebarInfoEdit/GroupChat";
import OpenAttachmentBtn from "@/components/ui/buttons/OpenAttachmentBtn";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { useActiveMembers, useChatMemberStore } from "@/stores/chatMemberStore";

const SidebarInfoDefault: React.FC = () => {
  const activeChat = useActiveChat();
  const activeMembers = useActiveMembers();

  useEffect(() => {
    if (!activeChat) {
      useSidebarInfoStore.setState({ isSidebarInfoVisible: false });
      return;
    }
    if (!activeMembers && activeChat?.id) {
      useChatMemberStore.getState().fetchChatMembers(activeChat.id);
    }
  }, [activeMembers, activeChat?.id, activeChat]);

  if (!activeChat) return;

  const isDirect = activeChat?.type === ChatType.DIRECT;

  return (
    <aside className="relative w-full h-full overflow-hidden">
      {isDirect ? (
        <DirectChat activeChat={activeChat} activeMembers={activeMembers} />
      ) : (
        <GroupChat activeChat={activeChat} activeMembers={activeMembers} />
      )}
      <OpenAttachmentBtn />
    </aside>
  );
};

export default SidebarInfoDefault;
