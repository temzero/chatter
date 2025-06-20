import React, { useState } from "react";
import { Avatar } from "./avatar/Avatar";
import SearchBar from "@/components/ui/SearchBar";
import ContactSelectionList from "../ui/ContactSelectionList";
import { useChatStore } from "@/stores/chatStore";
import { useCurrentUser } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import type { DirectChatResponse } from "@/types/chat";
import type { ChatType } from "@/types/enums/ChatType";
import { SidebarMode } from "@/types/enums/sidebarMode";

interface CreateChatProps {
  type: ChatType.GROUP | ChatType.CHANNEL;
}

const CreateNewGroupChat: React.FC<CreateChatProps> = ({ type }) => {
  const createGroupChat = useChatStore((state) => state.createGroupChat);
  const isLoading = useChatStore((state) => state.isLoading);
  const currentUser = useCurrentUser();

  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setSidebar = useSidebarStore((state) => state.setSidebar);

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [name, setName] = useState("");

  const filteredChats = useChatStore((state) => state.filteredChats);
  const privateChats = filteredChats.filter((chat) => chat.type === "direct");

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

  const getSelectedChats = (): DirectChatResponse[] => {
    return privateChats.filter((chat) => selectedContacts.includes(chat.id));
  };

  const CreateNewGroup = async () => {
    try {
      if (!currentUser) {
        console.error("User not authenticated");
        return;
      }

      // Get the selected chats and extract just the member IDs (excluding current user)
      const selectedChats = getSelectedChats();
      const userIds =
        selectedChats.length > 0
          ? Array.from(
              new Set(selectedChats.map((chat) => chat.chatPartner.userId))
            )
          : []; // Empty array if no contacts selected (current user will be added by backend via token)

      const payload = {
        name,
        userIds,
        type,
      };

      const newChat = await createGroupChat(payload);
      console.log("Successfully created:", newChat);

      setActiveChat(newChat);
      setSidebar(SidebarMode.DEFAULT);
    } catch (error) {
      console.error("Failed to create group/channel:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <SearchBar placeholder="Search for contacts..." />
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
          <p>No contacts found</p>
        </div>
      )}

      <form
        className="flex flex-col p-3 gap-2 custom-border-t"
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
                  avatarUrl={chat.chatPartner.avatarUrl}
                  firstName={chat.chatPartner.firstName}
                  lastName={chat.chatPartner.lastName}
                  size="8"
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
          placeholder={`Enter ${type} name`}
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
          {isLoading ? (
            <span>Creating...</span>
          ) : (
            <span>Create {type === "group" ? "Group" : "Channel"}</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateNewGroupChat;
