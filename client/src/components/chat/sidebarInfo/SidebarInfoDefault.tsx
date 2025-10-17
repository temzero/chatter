import React from "react";
import { useActiveChat } from "@/stores/chatStore";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import DirectChat from "./SidebarInfoEdit/DirectChat";
import GroupChat from "./SidebarInfoEdit/GroupChat";
import OpenAttachmentBtn from "@/components/ui/buttons/OpenAttachmentBtn";

const SidebarInfoDefault: React.FC = () => {
  const activeChat = useActiveChat();
  const isDirect = activeChat?.type === ChatType.DIRECT;

  return (
    <aside className="relative w-full h-full overflow-hidden">
      {isDirect ? <DirectChat /> : <GroupChat />}
      <OpenAttachmentBtn />
    </aside>
  );
};

export default SidebarInfoDefault;
