import React, { useState } from "react";
import { motion } from "framer-motion";
import { useModalStore } from "@/stores/modalStore";
import { useChatStore } from "@/stores/chatStore";
import { ChatResponse } from "@/types/responses/chat.response";
import { ChatType } from "@/types/enums/chatType";
import { Avatar } from "../ui/avatar/Avatar";
import SearchBar from "../ui/SearchBar";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/utils/copyToClipboard";

const AddMemberModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const modalContent = useModalStore((state) => state.modalContent);
  const chat = modalContent?.props?.chat as ChatResponse | undefined;
  // const memberUserIds = chat?.otherMemberUserIds;
  // const closeModal = useModalStore((state) => state.closeModal);

  const filteredChats = useChatStore((state) => state.filteredChats);
  const directChats = filteredChats.filter((c) => c.type === ChatType.DIRECT);

  const handleInvite = (userId: string) => {
    if (!chat) return;
    toast.info(`Invite ${userId}`);
    // chatWebSocketService.inviteToGroupChat({ chatId: chat.id, userId });
  };

  const invitationLink = `https://chatter.com/invite/${chat?.id || ""}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(invitationLink);
    if (success) {
      toast.success(
        "Invitation Link copied! You can you this to invite people"
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded p-4 max-w-xl w-[400px] custom-border z-[99]"
    >
      <h1 className="font-bold text-center text-xl mb-4 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined font-bold text-3xl">person_add</span>
        Invite members
      </h1>

      <SearchBar placeholder="Search for people..." />

      <div className="flex flex-col items-start h-[50vh] overflow-y-auto mt-2">
        {directChats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center w-full gap-3 p-2 text-left transition custom-border-b"
          >
            <Avatar avatarUrl={chat.avatarUrl} name={chat.name ?? undefined} />
            <h2 className="font-medium">{chat.name}</h2>
            <button
              className="ml-auto w-10 h-8 opacity-60 hover:opacity-100 rounded hover:bg-[var(--primary-green)] hover:border-2 hover:border-green-400 flex items-center justify-center text-white transition-all duration-300"
              onClick={() => handleInvite(chat.id)}
              aria-label="Send"
            >
              <span className="material-symbols-outlined text-3xl">send</span>
            </button>
          </div>
        ))}
      </div>

      {/* Invitation Link */}
      <div className="mt-4 w-full">
        {/* <h1 className="text-sm font-semibold mb-1">Invitation Link</h1> */}
        <div className="flex items-center gap-2 bg-[var(--input-bg)] rounded w-full border-2 border-[--border-color]">
          <p className="text-sm p-1 px-1.5 whitespace-nowrap overflow-auto scrollbar-hide">
            {invitationLink}
          </p>
          <button
            className="border-l-2 border-[--border-color] p-1 px-2 select-none hover:bg-[--hover-color]"
            onClick={handleCopy}
          >
            <span
              className={`material-symbols-outlined ${
                copied && "text-green-500 font-bold"
              }`}
            >
              {copied ? "check" : "content_copy"}
            </span>
            {/* {copied ? "Copied!" : "Copy Invitation Link"} */}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddMemberModal;
