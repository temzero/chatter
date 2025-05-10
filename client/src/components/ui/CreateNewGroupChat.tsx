import React, { useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import ContactSelectionList from "../ui/ContactSelectionList";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "./Avatar";
import type { PrivateChat } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";

interface CreateChatProps {
  type: "group" | "channel";
}

const CreateNewChat: React.FC<CreateChatProps> = ({ type }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setActiveChatById = useChatStore((state) => state.setActiveChatById)
  const setSidebar = useSidebarStore(state => state.setSidebar)

  const [step, setStep] = useState<"select-contacts" | "set-details">(
    "select-contacts"
  );
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const filteredChats = useChatStore((state) => state.filteredChats);
  const privateChats = filteredChats.filter((chat) => chat.type === "private");

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getSelectedChats = (): PrivateChat[] => {
    return privateChats.filter((chat) => selectedContacts.includes(chat.id));
  };

  const CreateNewGroup = async () => {
    try {
      // Get the selected chats and extract just the member IDs
      const selectedChats = getSelectedChats(); // This returns PrivateChat[]
      if (!selectedChats.length || !currentUser) {
        console.error("not enough member");
        return;
      }

      console.log("selected chats: ", selectedChats);

      const memberIds = Array.from(
        new Set([
          currentUser.id,
          ...selectedChats.map((chat) => chat.chatPartner.id),
        ])
      );

      const payload = {
        name,
        memberIds,
        type,
      };

      console.log("payload: ", payload);

      const newChat = await chatService.createGroup(payload);

      console.log("Successfully created:", newChat);
      setActiveChatById(newChat.id)
      setSidebar('default')
      // Handle success (e.g., close modal, redirect)
    } catch (error) {
      console.error("Failed to create group/channel:", error);
      // Handle error (e.g., show error message)
    }
  };

  const handleCreateChat = () => {
    console.log({
      type,
      name: name.trim(),
      description: description.trim(),
      members: selectedContacts,
      isPublic,
    });
    // TODO: Implement creation logic
  };

  const renderDetailsStep = () => (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-semibold mb-4">
        {type === "group" ? "Group" : "Channel"} Details
      </h2>

      {type === "channel" && (
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <span>Public {type}</span>
          </label>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {type === "group" ? "Group" : "Channel"} Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder={`Enter ${type} name`}
          maxLength={50}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder={`Enter ${type} description`}
          rows={3}
          maxLength={200}
        />
      </div>

      <div className="mt-auto">
        <button
          onClick={() => setStep("select-contacts")}
          className="mb-2 w-full py-2 border rounded"
        >
          Back
        </button>
        <button
          onClick={handleCreateChat}
          disabled={!name.trim()}
          className={`w-full py-2 rounded ${
            name.trim()
              ? "bg-[var(--primary-green)]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Create {type === "group" ? "Group" : "Channel"}
        </button>
      </div>
    </div>
  );

  const renderSelectContactsStep = () => (
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
          <div className="flex flex-wrap gap-2 items-center">
            {getSelectedChats().map((chat) => (
              <Avatar key={chat.id} avatar={chat.avatar} size="sm" />
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
            selectedContacts.length === 0 || (type === "group" && !name.trim())
          }
          className={`flex items-center gap-2 py-1 w-full ${
            selectedContacts.length > 0 && (type === "channel" || name.trim())
              ? "bg-[var(--primary-green)]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <p>Create {type === "group" ? "Group" : "Channel"}</p>
        </button>
      </form>
    </div>
  );

  return step === "set-details"
    ? renderDetailsStep()
    : renderSelectContactsStep();
};

export default CreateNewChat;
