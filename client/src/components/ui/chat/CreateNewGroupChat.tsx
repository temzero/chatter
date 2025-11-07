import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { getChats, useChatStore } from "@/stores/chatStore";
import { getCurrentUser } from "@/stores/authStore";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import type { ChatResponse } from "@/shared/types/responses/chat.response";
import type { ChatType } from "@/shared/types/enums/chat-type.enum";
import ContactSelectionList from "@/components/ui/contact/ContactSelectionList";
import SearchBar from "@/components/ui/SearchBar";

interface CreateChatProps {
  type: ChatType.GROUP | ChatType.CHANNEL;
}

const CreateNewGroupChat: React.FC<CreateChatProps> = ({ type }) => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const isLoading = useChatStore((state) => state.isLoading);
  const createGroupChat = useChatStore.getState().createGroupChat;

  const setActiveChatId = useChatStore.getState().setActiveChatId;
  const setSidebar = getSetSidebar();

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Add search state

  const chats = getChats();

  // Filter private chats locally with search
  const privateChats = React.useMemo(() => {
    // Convert object → array, then filter
    const directChats = Object.values(chats).filter(
      (chat: { type: string }) => chat.type === "direct"
    );

    if (!searchTerm) return directChats;

    return directChats.filter((chat: ChatResponse) =>
      (chat.name ?? "") // handle null safely
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

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
    return privateChats.filter((chat: { id: string }) =>
      selectedContacts.includes(chat.id)
    );
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const CreateNewGroup = async () => {
    try {
      if (!currentUser) {
        console.error(t("sidebar_new_chat.group.user_not_authenticated"));
        return;
      }

      // Get the selected chats and extract just the member IDs (excluding current user)
      const selectedChats = getSelectedChats();
      const userIds =
        selectedChats.length > 0
          ? Array.from(
              new Set(
                selectedChats
                  .map((chat) => chat.otherMemberUserIds?.[0])
                  .filter((id): id is string => typeof id === "string")
              )
            )
          : [];

      const payload = {
        name,
        userIds,
        type,
      };

      const newChat = await createGroupChat(payload);
      console.log("Successfully created:", newChat);

      setActiveChatId(newChat.id);
      setSidebar(SidebarMode.DEFAULT);
    } catch (error) {
      console.error("Failed to create group/channel:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <SearchBar
          placeholder={t("sidebar_new_chat.group.search_placeholder")}
          onSearch={handleSearch}
        />
      </div>

      {privateChats.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <ContactSelectionList
            chats={privateChats}
            selectedContacts={selectedContacts}
            onContactToggle={handleContactToggle}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-auto opacity-40">
          <i className="material-symbols-outlined text-6xl">search_off</i>
          <p>
            {searchTerm
              ? t("common.messages.no_result")
              : t("common.messages.no_contacts")}
          </p>
        </div>
      )}

      <form
        className="flex flex-col p-3 gap-2 border-2 border-b-0 border-[--border-color] rounded-t-xl"
        onSubmit={(e) => {
          e.preventDefault();
          CreateNewGroup();
        }}
      >
        {getSelectedChats().length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            {getSelectedChats().map((chat) => (
              <div
                key={chat.id}
                className="relative w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 cursor-pointer group"
                onClick={() => handleRemoveContact(chat.id)}
              >
                <Avatar
                  avatarUrl={chat.avatarUrl}
                  name={chat.name || ""}
                  size={8}
                  textSize="text-sm"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="material-symbols-outlined text-white">close</i>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-1 text-lg"
          placeholder={t("sidebar_new_chat.group.enter_name")}
          maxLength={50}
          required
        />

        <button
          disabled={
            (type === "group" &&
              (selectedContacts.length === 0 || !name.trim())) ||
            (type === "channel" && !name.trim()) ||
            isLoading
          }
          className={`flex items-center justify-center gap-2 py-1 w-full ${
            (type === "channel" && name.trim()) ||
            (type === "group" && selectedContacts.length > 0 && name.trim())
              ? "bg-[var(--primary-green)]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isLoading
            ? t("common.loading.creating")
            : t(
                type === "group"
                  ? "sidebar_new_chat.group.create_group"
                  : "sidebar_new_chat.group.create_channel"
              )}
        </button>
      </form>
    </div>
  );
};

export default CreateNewGroupChat;
