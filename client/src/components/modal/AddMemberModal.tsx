import React, { useState } from "react";
import { motion } from "framer-motion";
import { useModalStore } from "@/stores/modalStore";
import { useActiveChat, useChatStore } from "@/stores/chatStore";
import { Avatar } from "../ui/avatar/Avatar";
import SearchBar from "../ui/SearchBar";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { handleError } from "@/utils/handleError";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";
import { FriendContactResponse } from "@/types/responses/friendContact.response";
import { useFriendContacts } from "@/hooks/useFriendContacts";
import { useAllUniqueMembers } from "@/hooks/useAllUniqueMembers";

const AddMemberModal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const chat = useActiveChat();
  const closeModal = useModalStore((state) => state.closeModal);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  const chatMemberUserIds = chat?.otherMemberUserIds || [];

  // Use the new hook to get unique members from other chats
  const allUniqueMembers = useAllUniqueMembers(chat?.id);
  const { contacts: friendContacts, loading } =
    useFriendContacts(chatMemberUserIds);

  // Combine friend contacts with unique members from other chats
  const combinedContacts = [
    ...friendContacts,
    ...allUniqueMembers.filter(
      (uniqueMember) =>
        !friendContacts.some((friend) => friend.userId === uniqueMember.userId)
    ),
  ];

  const handleContactToggle = (userId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRemoveContact = (userId: string) => {
    setSelectedContacts((prev) => prev.filter((id) => id !== userId));
  };

  const getSelectedContacts = (): FriendContactResponse[] => {
    return combinedContacts.filter((contact) =>
      selectedContacts.includes(contact.userId)
    );
  };

  const handleAddMembers = async () => {
    if (!chat) return;
    try {
      closeModal();
      await useChatStore.getState().addMembersToChat(chat.id, selectedContacts);
      setSidebarInfo(SidebarInfoMode.DEFAULT);
    } catch (error) {
      handleError(error, "Failed to add members");
      console.error("Failed to add members:", error);
    }
  };

  const primaryInviteLink = chat?.inviteLinks?.[0];
  const primaryInviteLinkToken = primaryInviteLink?.split("/").pop() ?? "";

  const generateInviteLink = async () => {
    if (!chat) return;
    await useChatStore.getState().generateInviteLink(chat.id);
  };

  const handleRefreshInviteLink = async () => {
    if (!chat || refreshed) return;
    await useChatStore
      .getState()
      .refreshInviteLink(chat.id, primaryInviteLinkToken);
    setRefreshed(true);
    // setTimeout(() => setRefreshed(false), 2000);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(primaryInviteLink);
    if (success) {
      toast.success("Invitation Link copied!");
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
        {loading ? (
          <p className="text-center w-full text-gray-500">
            Loading contacts...
          </p>
        ) : combinedContacts.length > 0 ? (
          combinedContacts.map((contact) => (
            <div
              key={contact.userId}
              className="flex items-center w-full gap-3 p-2 text-left transition custom-border-b hover:bg-[var(--hover-color)] cursor-pointer"
              onClick={() => handleContactToggle(contact.userId)}
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar
                  avatarUrl={contact.avatarUrl}
                  name={contact.firstName}
                />
                <h2 className="font-medium">
                  {contact.firstName} {contact.lastName}
                </h2>
              </div>
              <div
                className={`w-4 h-4 rounded border-2 ${
                  selectedContacts.includes(contact.userId)
                    ? "bg-[var(--primary-green)] border-[var(--primary-green)]"
                    : "border-[var(--border-color)]"
                } flex items-center justify-center`}
              >
                {selectedContacts.includes(contact.userId) && (
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
          {getSelectedContacts().map((contact) => (
            <div key={contact.userId} className="flex items-center gap-2">
              <div
                className="relative w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 cursor-pointer group"
                onClick={() => handleRemoveContact(contact.userId)}
              >
                <div className="relative">
                  <Avatar
                    avatarUrl={contact.avatarUrl}
                    name={contact.firstName}
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
                <span className="text-sm font-medium">
                  {contact.firstName} {contact.lastName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col">
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
          <div className="flex items-center bg-[var(--input-bg)] rounded w-full border-2 border-[--border-color]">
            {primaryInviteLink ? (
              <div className="flex items-center w-full gap-1">
                {!refreshed && (
                  <button
                    title="Refresh"
                    className={`border-r-2 border-[--border-color] p-1 px-2 select-none ${
                      refreshed
                        ? "cursor-not-allowed"
                        : "hover:bg-[--hover-color]"
                    }`}
                    onClick={handleRefreshInviteLink}
                    disabled={refreshed}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        refreshed && "text-green-500 font-bold"
                      }`}
                    >
                      {refreshed ? "check" : "refresh"}
                    </span>
                  </button>
                )}

                <p className="text-sm p-1 px-2 whitespace-nowrap overflow-auto scrollbar-hide">
                  {primaryInviteLink}
                </p>
                <button
                  title="Copy"
                  className="ml-auto border-l-2 border-[--border-color] p-1 px-2 select-none hover:bg-[--hover-color]"
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
            ) : (
              <button
                className="w-full p-1 px-2 select-none hover:bg-[--hover-color] hover:text-green-400"
                onClick={generateInviteLink}
              >
                <span className="material-symbols-outlined mr-2">add_link</span>
                Generate Invite Link
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AddMemberModal;
