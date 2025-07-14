// components/sidebar/SidebarNewFolder.tsx
import React, { useState, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { ChatType } from "@/types/enums/ChatType";
import { useFolderStore } from "@/stores/folderStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import ChatListItemSelection from "@/components/ui/ChatListItemSelection";

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
];

interface folderToEdit {
  id: string;
  name: string;
  color: string | null;
  chatIds: string[];
  types: (ChatType.DIRECT | ChatType.GROUP | ChatType.CHANNEL)[];
}

const SidebarNewFolder: React.FC = () => {
  const chats = useChatStore((state) => state.chats);
  const createFolder = useFolderStore((state) => state.createFolder);
  const updateFolder = useFolderStore((state) => state.updateFolder);
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const sidebarData = useSidebarStore((state) => state.sidebarData) as
    | { folderToEdit?: folderToEdit }
    | undefined;
  const folderToEdit = sidebarData?.folderToEdit;

  const isEditMode = !!folderToEdit;

  const [folderName, setFolderName] = useState(folderToEdit?.name || "");
  const [folderTypes, setFolderTypes] = useState<
    (ChatType.DIRECT | ChatType.GROUP | ChatType.CHANNEL)[]
  >(folderToEdit?.types || []);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    folderToEdit?.color || COLORS[0]
  );
  const [selectedChats, setSelectedChats] = useState<string[]>(
    folderToEdit?.chatIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (folderToEdit) {
      setFolderName(folderToEdit.name);
      setFolderTypes(folderToEdit.types);
      setSelectedColor(folderToEdit.color);
      setSelectedChats(folderToEdit.chatIds);
    }
  }, [folderToEdit]);

  const handleSubmit = async () => {
    if (!folderName.trim()) return;

    const payload = {
      name: folderName.trim(),
      types: folderTypes,
      color: selectedColor,
      chatIds: selectedChats,
    };

    if (isEditMode && folderToEdit) {
      updateFolder({
        ...folderToEdit,
        ...payload,
      });
    } else {
      await createFolder(payload);
    }
    setSidebar(SidebarMode.FOLDERS);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <SidebarLayout
      title={isEditMode ? "Edit Folder" : "Create New Folder"}
      backLocation={
        isEditMode
          ? { mode: SidebarMode.FOLDER, data: { folderId: folderToEdit.id } }
          : SidebarMode.FOLDERS
      }
    >
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex flex-col gap-4 p-2 overflow-y-auto flex-1">
          {/* Color Selection */}
          <div className="grid grid-cols-9 gap-2 mt-2">
            {COLORS.map((color) => (
              <button
                key={color ?? "none"}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedColor === color
                    ? "ring-4 -ring-offset-4 ring-offset-[var(--sidebar-color)] ring-[--border-color]"
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

          {/* Folder Type Multi-Select */}
          <div>
            <h2 className="mb-2">
              Chat Types{" "}
              {(folderTypes.length === 3 || folderTypes.length === 0) && (
                <span className="text-[--primary-green] text-sm font-semibold">
                  (All)
                </span>
              )}
            </h2>
            <div className="flex gap-1">
              {[ChatType.DIRECT, ChatType.GROUP, ChatType.CHANNEL].map(
                (type) => {
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
                            : [
                                ...prev,
                                type as
                                  | ChatType.DIRECT
                                  | ChatType.GROUP
                                  | ChatType.CHANNEL,
                              ]
                        )
                      }
                      className={`flex-1 py-1 rounded border-2 border-[var(--border-color)] text-sm capitalize transition-colors duration-200 ${
                        isSelected ? "bg-[--primary-green] font-semibold" : ""
                      }`}
                    >
                      {type}
                      <span className="material-symbols-outlined opacity-50 ml-1">
                        {type === ChatType.DIRECT
                          ? "person"
                          : type === ChatType.GROUP
                          ? "groups"
                          : "campaign"}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Chat Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2>Chats ({selectedChats.length})</h2>
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

            <div className="overflow-y-auto">
              {chats.length > 0 ? (
                <ul className="divide-y divide-[var(--border-color)]">
                  {chats.map((chat) => (
                    <ChatListItemSelection
                      key={chat.id}
                      chat={chat}
                      isSelected={selectedChats.includes(chat.id)}
                      toggleChatSelection={toggleChatSelection}
                    />
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
        <div
          style={{
            color: selectedColor ? "black" : "var(--text-color)",
            backgroundColor: selectedColor || "",
          }}
          className="custom-border shadow-xl p-3 bg-[--background-color] rounded-lg"
        >
          {/* Header */}
          <div
            // style={{
            //   color: selectedColor || "var(--text-color)",
            // }}
          >
            <span className="material-symbols-outlined font-bold text-4xl">
              {isEditMode ? "bookmark_manager" : "create_new_folder"}
            </span>
            <div className="mb-3">
              <input
                type="text"
                value={folderName}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                placeholder="Folder Name"
                className="flex-1 outline-none text-2xl w-full font-semibold "
                autoFocus
                maxLength={50}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!folderName.trim()}
            className={`border border-black w-full py-2 rounded flex items-center justify-center gap-2 shadow-xl ${
              folderName.trim()
                ? "bg-[--primary-green] hover:bg-[--primary-green-dark)]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined">
              {isEditMode ? "save" : "create_new_folder"}
            </span>
            {isEditMode ? "Save Changes" : "Create Folder"}
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarNewFolder;
