import React, { useState, useEffect } from "react";
import { useAllChats } from "@/stores/chatStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useFolderStore } from "@/stores/folderStore";
import { Logo } from "../ui/Logo";
import { SlidingContainer } from "../ui/SlidingContainer";
import ChatList from "@/components/ui/ChatList";
import { motion } from "framer-motion";
import { filterChatsByType } from "@/utils/filterChatsByType";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { ChatType } from "@/types/enums/ChatType";
import ChatFolderSelector from "../ui/ChatFolderSelector";

const chatTypes = ["all", ChatType.DIRECT, ChatType.GROUP, ChatType.CHANNEL];

const SidebarDefault: React.FC = () => {
  // State & Store Hooks
  const allChats = useAllChats();
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const isCompact = useSidebarStore((state) => state.isCompact);
  const toggleCompact = useSidebarStore((state) => state.toggleCompact);

  const { folders, initialize } = useFolderStore();
  const chatFolders = folders.map((folder) => folder.name);
  const combinedTabs = [...chatTypes, ...chatFolders];

  // State for selected folder and scroll direction
  const [selectedFolder, setSelectedFolder] = useState<string>(combinedTabs[0]);
  const [direction, setDirection] = useState<number>(1);

  // Initialize folders on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Memoized filtered chats
  const filteredChats = React.useMemo(() => {
    if (chatFolders.includes(selectedFolder)) {
      const folder = folders.find((f) => f.name === selectedFolder);
      if (!folder) return [];

      return allChats.filter(
        (chat) =>
          folder.chatIds.includes(chat.id) || folder.types.includes(chat.type)
      );
    }
    return filterChatsByType(allChats, selectedFolder);
  }, [selectedFolder, allChats, folders, chatFolders]);

  // Handle tab change
  const handleChatTypeChange = (type: string) => {
    if (type === selectedFolder) return;

    const currentIndex = combinedTabs.indexOf(selectedFolder);
    const newIndex = combinedTabs.indexOf(type);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedFolder(type);
  };

  // Keyboard shortcut (toggle compact mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`") {
        e.preventDefault();
        toggleCompact();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCompact]);

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
      <ChatFolderSelector
        selectedFolder={selectedFolder}
        onSelectFolder={handleChatTypeChange}
        combinedTabs={combinedTabs}
        chatFolders={chatFolders}
      />

      {/* Chat List Container */}
      <SlidingContainer direction={direction} uniqueKey={selectedFolder}>
        <ChatList chats={filteredChats} isCompact={isCompact} />
      </SlidingContainer>
    </aside>
  );
};

export default SidebarDefault;
