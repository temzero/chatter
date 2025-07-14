import React, { useState } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useFolderStore } from "@/stores/folderStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import ChatListItemSelection from "@/components/ui/ChatListItemSelection";

type SidebarData = { folderId?: string } | undefined;

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

const SidebarFolder: React.FC = () => {
  const chats = useChatStore((state) => state.chats);
  const currentSidebar = useSidebarStore((state) => state.currentSidebar);
  const sidebarData = useSidebarStore(
    (state) => state.sidebarData
  ) as SidebarData;
  const folders = useFolderStore((state) => state.folders);
  const folder = folders.find((f) => f.id === sidebarData?.folderId);
  const deleteFolder = useFolderStore((state) => state.deleteFolder);
  const updateFolder = useFolderStore((state) => state.updateFolder);

  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState(folder?.name || "");
  const [selectedColor, setSelectedColor] = useState<string | null>(
    folder?.color || COLORS[0]
  );
  const [selectedChats, setSelectedChats] = useState<string[]>(
    folder?.chatIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");

  if (!folder) {
    return <div className="p-4 text-gray-500">Folder not found</div>;
  }

  const folderChatIds = folder.chatIds || [];
  const folderChats = folderChatIds
    .map((id) => chats.find((chat) => chat.id === id))
    .filter(Boolean);

  const allChats = chats.filter(
    (chat) =>
      chat.name && chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleSave = async () => {
    await updateFolder({
      ...folder,
      name: folderName,
      color: selectedColor,
      chatIds: selectedChats,
    });
    setIsEditing(false);
  };

  if (currentSidebar !== SidebarMode.FOLDER || !folder) return null;

  return (
    <SidebarLayout
      title={isEditing ? "Edit Folder" : "Folder Details"}
      backLocation={SidebarMode.FOLDERS}
    >
      <div
        style={{
          borderColor: folder.color || "",
        }}
        className="border-4 h-full overflow-y-auto"
      >
        <div
          className="flex relative px-3 py-2"
          style={{
            backgroundColor: folder.color || "",
            color: folder.color ? "black" : "",
          }}
        >
          {isEditing ? (
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="text-xl font-semibold w-full bg-transparent outline-none"
              style={{ color: selectedColor ? "black" : "" }}
            />
          ) : (
            <h2 className="text-xl font-semibold">{folder.name}</h2>
          )}
        </div>

        <div className="p-2">
          {isEditing && (
            <div className="grid grid-cols-10 gap-2 mb-4">
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
          )}

          <div className="space-y-1">
            {/* {isEditing && selectedChats.length > 0 && (
                <button
                  onClick={() => setSelectedChats([])}
                  className="text-xs opacity-70 hover:opacity-100"
                >
                  Clear selection
                </button>
              )} */}

            {isEditing && (
              <div className="mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full p-2 text-sm rounded border border-[var(--border-color)] bg-transparent"
                />
              </div>
            )}

            {folderChats.length === 0 && !isEditing ? (
              <p className="text-gray-500 text-center py-4">
                No chats in this folder
              </p>
            ) : isEditing ? (
              <ul className="divide-y divide-[var(--border-color)]">
                {allChats.map((chat) => (
                  <ChatListItemSelection
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChats.includes(chat.id)}
                    toggleChatSelection={toggleChatSelection}
                  />
                ))}
              </ul>
            ) : (
              folderChats.map((chat) => (
                <div
                  key={chat?.id}
                  className="flex items-center gap-2 py-1 custom-border-b"
                >
                  <ChatAvatar chat={chat} type="header" />
                  <h3 className="text-lg font-semibold">{chat?.name}</h3>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mt-4">
            {isEditing ? (
              <>
                <button
                  className="flex-1 py-2 rounded bg-[--primary-green] hover:bg-[--primary-green-dark)]"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button
                  className="flex-1 py-2 rounded border border-[var(--border-color)]"
                  onClick={() => {
                    setIsEditing(false);
                    setFolderName(folder.name);
                    setSelectedColor(folder.color || null);
                    setSelectedChats(folder.chatIds || []);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex-1 py-2 rounded border border-[var(--border-color)]"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Folder
                </button>
                <button
                  className="flex-1 py-2 rounded text-red-500 border border-red-500 hover:bg-red-500/10"
                  onClick={() => deleteFolder(folder.id)}
                >
                  Delete Folder
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarFolder;
