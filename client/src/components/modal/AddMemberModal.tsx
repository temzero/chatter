import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useActiveChat, useChatStore } from "@/stores/chatStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { modalAnimations } from "@/common/animations/modalAnimations";
import { copyToClipboard } from "@/common/utils/copyToClipboard";
import { handleError } from "@/common/utils/error/handleError";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { FriendContactResponse } from "@/shared/types/responses/friend-contact.response";
import { useFriendContacts } from "@/common/hooks/useFriendContacts";
import { useAllUniqueMembers } from "@/common/hooks/useAllUniqueMembers";
import { useTranslation } from "react-i18next";
import { getCloseModal } from "@/stores/modalStore";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import SearchBar from "@/components/ui/SearchBar";

const AddMemberModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const [copied, setCopied] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const chat = useActiveChat();
  const setSidebarInfo = getSetSidebarInfo();

  const chatMemberUserIds = chat?.otherMemberUserIds || [];

  // Use the new hook to get unique members from other chats
  const allUniqueMembers = useAllUniqueMembers(chat?.id) ?? [];
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

  const filteredContacts = combinedContacts.filter(
    (contact) =>
      !searchTerm ||
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      handleError(error, t("modal.add_member.failed_add"));
    }
  };

  const primaryInviteLink = chat?.inviteLinks?.[0];
  const primaryInviteLinkToken = primaryInviteLink?.split("/").pop() ?? "";

  const generateInviteLink = async () => {
    if (!chat) return;
    try {
      await useChatStore.getState().generateInviteLink(chat.id);
      toast.success(t("toast.friendship.invite_link_generated"));
    } catch (error) {
      handleError(error, "Failed to generate invite link");
    }
  };

  const handleRefreshInviteLink = async () => {
    if (!chat || refreshed) return;

    try {
      await useChatStore
        .getState()
        .refreshInviteLink(chat.id, primaryInviteLinkToken);
      setRefreshed(true);
      toast.success(t("toast.friendship.invite_link_refreshed"));
    } catch (error) {
      handleError(error, "Failed to refresh invite link");
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(primaryInviteLink);
    if (success) {
      toast.success(t("modal.add_member.copy_success"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(t("modal.add_member.copy_failed"));
    }
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-(--panel-color) text-(--text-color) rounded p-4 max-w-xl w-[400px] custom-border"
    >
      <h1 className="font-bold text-center text-xl mb-4 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-3xl! font-bold">
          person_add
        </span>
        {t("modal.add_member.title")}
      </h1>

      <SearchBar
        placeholder={t("modal.add_member.search_placeholder")}
        onSearch={(term) => setSearchTerm(term)}
      />

      <div className="flex flex-col items-start h-[50vh] overflow-y-auto mt-2 select-none">
        {loading ? (
          <p className="text-center w-full text-gray-500">
            {t("modal.add_member.loading")}
          </p>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.userId}
              className="flex items-center w-full select-none gap-3 p-2 text-left transition custom-border-b hover:bg-(--hover-color) cursor-pointer"
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
                className={`w-4 h-4 rounded border-2 select-none ${
                  selectedContacts.includes(contact.userId)
                    ? "bg-(--primary-green) border-(--primary-green)"
                    : "border-(--border-color)"
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
            <i className="material-symbols-outlined text-6xl!">search_off</i>
            <p>{t("modal.add_member.no_contacts")}</p>
          </div>
        )}
      </div>

      {/* Selected contacts preview */}
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center py-2 select-none">
          {getSelectedContacts().map((contact) => (
            <div key={contact.userId} className="flex items-center gap-2">
              <div
                className="relative w-8 h-8 rounded-full! flex items-center justify-center hover:opacity-80 cursor-pointer group"
                onClick={() => handleRemoveContact(contact.userId)}
              >
                <div className="relative">
                  <Avatar
                    avatarUrl={contact.avatarUrl}
                    name={contact.firstName}
                    size={8}
                    textSize="text-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full! flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
      <div className="h-8 flex">
        {selectedContacts.length > 0 ? (
          <button
            className="w-full bg-(--primary-green) p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddMembers}
          >
            {selectedContacts.length === 1
              ? t("modal.add_member.add_single")
              : t("modal.add_member.add_multiple", {
                  count: selectedContacts.length,
                })}
          </button>
        ) : (
          <div className="flex items-center bg-(--input-bg) rounded w-full border-2 border-(--border-color)">
            {primaryInviteLink ? (
              <div className="flex items-center w-full h-full overflow-hidden">
                <motion.p
                  onClick={handleCopy}
                  className={`h-full w-full text-sm p-1 px-2 whitespace-nowrap overflow-auto scrollbar-hide cursor-pointer hover:bg-(--hover-color) ${
                    copied ? "text-green-500 font-semibold" : ""
                  }`}
                  title={
                    copied
                      ? t("modal.add_member.link_copied_title")
                      : t("modal.add_member.link_copy_title")
                  }
                  key={primaryInviteLink}
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {copied
                    ? t("modal.add_member.link_copied")
                    : primaryInviteLink}
                </motion.p>
                {!refreshed && (
                  <button
                    title={t("modal.add_member.refresh_title")}
                    className={`border-l-2 border-(--border-color) p-1 px-2 opacity-60 hover:opacity-100 select-none ${
                      refreshed
                        ? "cursor-not-allowed"
                        : "hover:bg-(--hover-color)"
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
              </div>
            ) : (
              <button
                className="w-full p-1 px-2 select-none hover:bg-(--hover-color) hover:text-green-400"
                onClick={generateInviteLink}
              >
                <span className="material-symbols-outlined mr-1">
                  wand_stars
                </span>
                {t("modal.add_member.generate_invite")}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AddMemberModal;
