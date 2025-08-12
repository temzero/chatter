// components/modals/AddFolderModal.tsx
import React, { useState } from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "../ui/avatar/Avatar";
import { ChatType } from "@/types/enums/ChatType";

const COLORS = [
  null,
  "#FF5252", // red
  "#E040FB", // purple
  "#536DFE", // indigo
  "#00BCD4", // cyan (darker for distinction)
  "#4CAF50", // green
  "#CDDC39", // lime (less neon than #EEFF41)
  "#FFEB3B", // yellow (brighter, less neon)
  "#FF9800", // orange
  "#795548", // brown (earthy, distinct)
];

const AddFolderModal: React.FC = () => {
  const modalContent = useModalStore((state) => state.modalContent);
  const closeModal = useModalStore((state) => state.closeModal);
  const chats = useChatStore((state) => state.chats);

  // Get initial folder name from props or use empty string
  const initialFolderName = (modalContent?.props?.folderName as string) || "";
  const [folderName, setFolderName] = useState(initialFolderName);
  const [folderTypes, setFolderTypes] = useState<ChatType[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(COLORS[0]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = React.useMemo(() => {
    let result = chats;

    // Filter by selected types if any are selected
    if (folderTypes.length > 0) {
      result = result.filter((chat) => folderTypes.includes(chat.type));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (chat) =>
          chat.name?.toLowerCase().includes(query) ||
          (chat.lastMessage?.content ?? "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [chats, folderTypes, searchQuery]);

  const handleCreate = () => {
    if (!folderName.trim()) return;

    // Capitalize first letter of folder name
    const formattedName =
      folderName.trim().charAt(0).toUpperCase() + folderName.trim().slice(1);

    console.log("Creating folder:", {
      name: formattedName,
      types: folderTypes,
      color: selectedColor,
      chatIds: selectedChats,
    });

    // TODO: Your creation logic here

    closeModal();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 1) {
      setFolderName(value.toUpperCase());
    } else {
      setFolderName(value);
    }
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      style={{
        borderColor: selectedColor || "var(--border-color)",
      }}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] border rounded max-w-xl w-[400px] z-[99] overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex p-4 pt-3 pb-1 gap-2 items-center"
        style={{
          backgroundColor: selectedColor || "var(--sidebar-color)",
          color: selectedColor ? "black" : "var(--text-color)",
        }}
      >
        <span className="material-symbols-outlined font-semibold text-4xl">
          folder
        </span>
        <input
          type="text"
          value={folderName}
          onChange={handleNameChange}
          placeholder="Folder Name"
          className="flex-1 bg-transparent outline-none text-2xl font-semibold border-b-2 custom-border-b rounded-none"
          style={{ color: selectedColor ? "black" : "var(--text-color)" }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-4">
        {/* Color Selection */}
        <div>
          <div className="grid grid-cols-10 gap-2">
            {COLORS.map((color) => (
              <button
                key={color ?? "none"}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedColor === color
                    ? "ring-4 ring-offset-2 ring-offset-[var(--sidebar-color)] ring-[--border-color]"
                    : ""
                }`}
                style={{
                  backgroundColor: color ?? "transparent",
                }}
                title={color ?? "Default Text Color"}
              >
                {color === null ? (
                  <span className="material-symbols-outlined opacity-70">
                    close
                  </span>
                ) : (
                  ""
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Folder Type Multi-Select */}
        <div>
          <h1 className="mb-2">
            Chat Types{" "}
            {(folderTypes.length === 3 || folderTypes.length === 0) && (
              <span className="text-[--primary-green] text-sm font-semibold">
                (All)
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            {["direct", "group", "channel"].map((type) => {
              const isSelected = folderTypes.includes(
                type as (typeof folderTypes)[number]
              );
              return (
                <button
                  key={type}
                  onClick={() =>
                    setFolderTypes((prev) =>
                      isSelected
                        ? prev.filter((t) => t !== type)
                        : [...prev, type as ChatType]
                    )
                  }
                  className={`flex-1 py-1 rounded border-2 border-[var(--border-color)] text-sm capitalize transition-colors duration-200 ${
                    isSelected ? "bg-[--primary-green] font-semibold" : ""
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h1>Chats ({selectedChats.length})</h1>
            {selectedChats.length > 0 && (
              <button
                onClick={() => setSelectedChats([])}
                className="text-xs opacity-70 hover:opacity-100"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full p-2 text-sm rounded border border-[var(--border-color)] bg-transparent"
            />
          </div>

          <div className="custom-border rounded overflow-y-auto min-h-40 max-h-80 mt-2">
            {filteredChats.length > 0 ? (
              <ul className="divide-y divide-[var(--border-color)]">
                {filteredChats.map((chat) => (
                  <li
                    key={chat.id}
                    className="flex items-center p-2 hover:bg-[var(--hover-color)] cursor-pointer"
                    onClick={() => toggleChatSelection(chat.id)}
                  >
                    <div className="flex items-center justify-center mr-2">
                      <input
                        type="checkbox"
                        checked={selectedChats.includes(chat.id)}
                        onChange={() => toggleChatSelection(chat.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-[var(--border-color)] text-[--primary-green] focus:ring-[--primary-green]"
                      />
                    </div>
                    <Avatar
                      avatarUrl={chat.avatarUrl}
                      name={chat.name || ""}
                      size="8"
                      textSize="text-sm"
                    />
                    <div className="ml-2 flex-1 min-w-0">
                      <p className="truncate font-medium">{chat.name}</p>
                      {chat.lastMessage && (
                        <p className="text-xs opacity-70 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-50">
                      {chat.type === "direct"
                        ? "person"
                        : chat.type === "group"
                        ? "groups"
                        : "campaign"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 opacity-40">
                <span className="material-symbols-outlined text-4xl mb-2">
                  search_off
                </span>
                <p className="text-sm">No chats found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex custom-border-t">
        <button
          className="p-3 hover:text-green-400 opacity-60 hover:opacity-100 flex-1"
          onClick={handleCreate}
        >
          Create Folder
        </button>
      </div>
    </motion.div>
  );
};

export default AddFolderModal;
