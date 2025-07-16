import React, { useState, useEffect } from "react";
import { useAllChats } from "@/stores/chatStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useFolderStore } from "@/stores/folderStore";
import { Logo } from "../ui/Logo";
import { SlidingContainer } from "../ui/SlidingContainer";
import ChatList from "@/components/ui/ChatList";
import { motion } from "framer-motion";
import { SidebarMode } from "@/types/enums/sidebarMode";
import ChatFolderSelector from "../ui/ChatFolderSelector";

const SidebarDefault: React.FC = () => {
  // State & Store Hooks
  const allChats = useAllChats();
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const isCompact = useSidebarStore((state) => state.isCompact);

  const { folders, initialize } = useFolderStore();
  const chatFolders = folders.map((folder) => folder.name);
  const defaultFolder = chatFolders[0] || "all";

  // State for selected folder and scroll direction
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolder);
  const [direction, setDirection] = useState<number>(1);

  // Initialize folders on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Memoized filtered chats
  const filteredChats = React.useMemo(() => {
    const folder = folders.find((f) => f.name === selectedFolder);
    if (!folder) return allChats; // Return all chats if no folder is selected or found

    return allChats.filter(
      (chat) =>
        folder.chatIds.includes(chat.id) || folder.types.includes(chat.type)
    );
  }, [selectedFolder, allChats, folders]);

  // Handle tab change
  const handleChatTypeChange = (folder: string) => {
    if (folder === selectedFolder) return;

    const currentIndex = chatFolders.indexOf(selectedFolder);
    const newIndex = chatFolders.indexOf(folder);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedFolder(folder);
  };

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 ease-in-out ${
        isCompact
          ? "w-[var(--sidebar-width-small)]"
          : "w-[var(--sidebar-width)]"
      }`}
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

      {/* Chat Folder Selector Bar */}
      {chatFolders.length > 0 ? (
        <ChatFolderSelector
          selectedFolder={selectedFolder}
          onSelectFolder={handleChatTypeChange}
          chatFolders={chatFolders}
        />
      ) : (
        <div className="custom-border" />
      )}

      {/* Chat List Container */}
      <SlidingContainer direction={direction} uniqueKey={selectedFolder}>
        <ChatList chats={filteredChats} isCompact={isCompact} />
      </SlidingContainer>
    </aside>
  );
};

export default SidebarDefault;
