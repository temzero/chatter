import React, { useState } from "react";
import { useAllChats } from "@/stores/chatStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useFolderStore } from "@/stores/folderStore";
import { Logo } from "../ui/Logo";
import { SlidingContainer } from "../ui/SlidingContainer";
import { motion } from "framer-motion";
import { SidebarMode } from "@/types/enums/sidebarMode";
import {FolderResponse} from "@/shared/types/responses/folder.response";
import ChatList from "@/components/ui/ChatList";
import ChatFolderSelector from "../ui/ChatFolderSelector";

const SidebarDefault: React.FC = () => {
  const allChats = useAllChats();
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const folders = useFolderStore((state) => state.folders);
  const isCompact = useSidebarStore((state) => state.isCompact);

  // Create a virtual "All" folder
  const allFolder: FolderResponse = {
    id: "all",
    name: "all",
    chatIds: [],
    types: [],
    color: "",
    position: 0,
    createdAt: "",
    updatedAt: "",
  };
  const folderList = [allFolder, ...folders];

  // State for selected folder & scroll direction
  const [selectedFolder, setSelectedFolder] = useState(folderList[0]);
  const [direction, setDirection] = useState<number>(1);

  // Filter chats based on selected folder
  const filteredChats = React.useMemo(() => {
    if (!selectedFolder) return [];
    if (selectedFolder.id === "all") return allChats;

    return allChats.filter(
      (chat) =>
        selectedFolder.chatIds.includes(chat.id) ||
        selectedFolder.types.includes(chat.type)
    );
  }, [selectedFolder, allChats]);

  // Handle folder change
  const handleChatTypeChange = (folder: (typeof folderList)[number]) => {
    if (folder.id === selectedFolder.id) return;

    const currentIndex = folderList.findIndex(
      (f) => f.id === selectedFolder.id
    );
    const newIndex = folderList.findIndex((f) => f.id === folder.id);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedFolder(folder);
  };

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 ease-in-out

      `}
    >
      {/* Header */}
      <header className="relative flex w-full items-center h-[var(--header-height)] justify-between">
        <motion.a
          className="flex items-center cursor-pointer -ml-[64px]"
          onClick={() => setSidebar(SidebarMode.MORE)}
          whileHover={{ x: 33 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
        >
          <span
            className={`material-symbols-outlined text-6xl cursor-pointer ${
              isCompact ? "mr-9" : "mr-3"
            }`}
          >
            trending_flat
          </span>
          <div className="w-8 h-8 flex items-center justify-center">
            <Logo className="h-full w-full" />
          </div>
          {!isCompact && (
            <span className="text-2xl font-semibold px-1">Chatter</span>
          )}
        </motion.a>

        {!isCompact && (
          <div className="flex">
            <a
              className="cursor-pointer select-none nav-btn"
              onClick={() => setSidebar(SidebarMode.NEW_CHAT)}
            >
              <i className="material-symbols-outlined text-2xl">add</i>
            </a>
            <a
              className="cursor-pointer select-none nav-btn -ml-2"
              onClick={() => setSidebar(SidebarMode.SEARCH)}
            >
              <i className="material-symbols-outlined text-2xl">search</i>
            </a>
          </div>
        )}
      </header>

      {/* Chat Folder Selector */}
      {folders.length > 0 ? (
        <ChatFolderSelector
          selectedFolder={selectedFolder}
          onSelectFolder={handleChatTypeChange}
          folders={folderList}
        />
      ) : (
        <div className="custom-border" />
      )}

      {/* Chat List */}
      <SlidingContainer direction={direction} uniqueKey={selectedFolder.id}>
        <ChatList chats={filteredChats} isCompact={isCompact} />
      </SlidingContainer>
    </aside>
  );
};

export default SidebarDefault;
