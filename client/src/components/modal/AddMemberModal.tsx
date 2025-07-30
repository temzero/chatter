import React, { useState } from "react";
import { motion } from "framer-motion";
import { useModalStore } from "@/stores/modalStore";
import { useChatStore } from "@/stores/chatStore";
import { ChatResponse } from "@/types/responses/chat.response";
import { ChatType } from "@/types/enums/ChatType";
import { Avatar } from "../ui/avatar/Avatar";
import SearchBar from "../ui/SearchBar";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { handleError } from "@/utils/handleError";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";

const AddMemberModal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const modalContent = useModalStore((state) => state.modalContent);
  const chat = modalContent?.props?.chat as ChatResponse | undefined;
  const closeModal = useModalStore((state) => state.closeModal);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  const filteredChats = useChatStore((state) => state.filteredChats);
  const directChats = filteredChats.filter((c) => c.type === ChatType.DIRECT);

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleRemoveContact = (contactId: string) => {
    setSelectedContacts((prev) => prev.filter((id) => id !== contactId));
  };

  const getSelectedChats = (): ChatResponse[] => {
    return directChats.filter((chat) => selectedContacts.includes(chat.id));
  };

  const handleAddMembers = async () => {
    if (!chat) return;
    try {
      closeModal();
      const selectedChats = getSelectedChats();
      const userIds = selectedChats
        .map((chat) => chat.otherMemberUserIds?.[0])
        .filter((id): id is string => typeof id === "string");

      // Add all selected members at once
      await useChatStore.getState().addMembersToChat(chat.id, userIds);
      setSidebarInfo(SidebarInfoMode.DEFAULT);
    } catch (error) {
      handleError(error, "Failed to add members");
      console.error("Failed to add members:", error);
    }
  };

  const invitationLink = `https://chatter.com/invite/${chat?.id || ""}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(invitationLink);
    if (success) {
      toast.success(
        "Invitation Link copied! You can use this to invite people"
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
        <span className="material-symbols-outlined font-bold text-3xl">
          person_add
        </span>
        Invite Members
      </h1>

      <SearchBar placeholder="Search for people..." />

      <div className="flex flex-col items-start h-[50vh] overflow-y-auto mt-2">
        {directChats.length > 0 ? (
          directChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center w-full gap-3 p-2 text-left transition custom-border-b hover:bg-[var(--hover-color)] cursor-pointer"
              onClick={() => handleContactToggle(chat.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar
                  avatarUrl={chat.avatarUrl}
                  name={chat.name ?? undefined}
                />
                <h2 className="font-medium">{chat.name}</h2>
              </div>
              <div
                className={`w-4 h-4 rounded border-2 ${
                  selectedContacts.includes(chat.id)
                    ? "bg-[var(--primary-green)] border-[var(--primary-green)]"
                    : "border-[var(--border-color)]"
                } flex items-center justify-center`}
              >
                {selectedContacts.includes(chat.id) && (
                  <span className="material-symbols-outlined text-white">
                    check
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center my-auto opacity-40 w-full">
            <i className="material-symbols-outlined text-6xl">search_off</i>
            <p>No contacts found</p>
          </div>
        )}
      </div>

      {/* Selected contacts preview */}
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center py-2">
          {getSelectedChats().map((chat) => (
            <div key={chat.id} className="flex items-center gap-2">
              <div
                key={chat.id}
                className="relative w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 cursor-pointer group"
                onClick={() => handleRemoveContact(chat.id)}
              >
                <div className="relative">
                  <Avatar
                    avatarUrl={chat.avatarUrl}
                    name={chat.name || ""}
                    size="8"
                    textSize="text-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="material-symbols-outlined text-white">
                      close
                    </i>
                  </div>
                </div>
              </div>
              {selectedContacts.length === 1 && (
                <span className="text-sm font-medium">{chat.name}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {selectedContacts.length > 0 ? (
          <button
            className="w-full bg-[var(--primary-green)] p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddMembers}
          >
            {selectedContacts.length === 1
              ? "Add Member"
              : `Add ${selectedContacts.length} Members`}
          </button>
        ) : (
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
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AddMemberModal;
