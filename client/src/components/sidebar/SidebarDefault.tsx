import React, { useState } from "react";
import { useAllChatIds, useChatMap } from "@/stores/chatStore";
import { getSetSidebar, useIsCompactSidebar } from "@/stores/sidebarStore";
import { useFolders } from "@/stores/folderStore";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import { motion } from "framer-motion";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { FolderResponse } from "@/shared/types/responses/folder.response";
import ChatList from "@/components/ui/chat/ChatList";
import ChatFolderSelector from "@/components/ui/chat/ChatFolderSelector";
import SidebarWellCome from "./SidebarWellCome";
import { LogoWithText } from "../ui/icons/LogoWithText";

const SidebarDefault: React.FC = () => {
  console.log("[MOUNTED]", "SidebarDefault");
  // Much better approach - stable selectors
  const chatIds = useAllChatIds();
  const chatMap = useChatMap();
  const folders = useFolders();
  const isCompact = useIsCompactSidebar();
  const setSidebar = getSetSidebar();
  // Memoize the "All" folder to prevent recreating on every render
  const allFolder = React.useMemo(
    (): FolderResponse => ({
      id: "all",
      name: "all",
      chatIds: [],
      types: [],
      color: "",
      position: 0,
      createdAt: "",
      updatedAt: "",
    }),
    []
  );

  // Memoize folder list
  const folderList = React.useMemo(
    () => [allFolder, ...folders],
    [allFolder, folders]
  );

  // State for selected folder & scroll direction
  const [selectedFolder, setSelectedFolder] = useState(folderList[0]);
  const [direction, setDirection] = useState<number>(1);

  // Filter chat IDs based on selected folder - much more efficient
  const filteredChatIds = React.useMemo(() => {
    if (!selectedFolder) return [];

    if (selectedFolder.id === "all") return chatIds;

    return chatIds.filter((chatId) => {
      const chat = chatMap[chatId];
      return (
        selectedFolder.chatIds.includes(chatId) ||
        selectedFolder.types.includes(chat.type)
      );
    });
  }, [selectedFolder, chatIds, chatMap]);

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

  if (chatIds.length === 0 && folders.length === 0) return <SidebarWellCome />;

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 ease-in-out`}
    >
      <header className="relative flex w-full items-center h-(--header-height) justify-between">
        <motion.a
          className="flex items-center cursor-pointer -ml-16"
          onClick={() => setSidebar(SidebarMode.MORE)}
          whileHover={{ x: 39 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
        >
          <span
            className={`material-symbols-outlined text-6xl! cursor-pointer text-(--primary-green-glow) ${
              isCompact ? "mr-9" : "mr-3"
            }`}
          >
            trending_flat
          </span>

<LogoWithText/>
        </motion.a>

        {!isCompact && (
          <div className="flex">
            <a
              className="cursor-pointer select-none nav-btn hover:scale-125 hover:text-(--primary-green) transition-all"
              onClick={() => setSidebar(SidebarMode.NEW_CHAT)}
            >
              <i className="material-symbols-outlined text-2xl!">add</i>
            </a>

            <a
              className="cursor-pointer select-none nav-btn hover:scale-125 hover:text-(--primary-green) transition-all -ml-2"
              onClick={() => setSidebar(SidebarMode.SEARCH)}
            >
              <i className="material-symbols-outlined text-2xl!">search</i>
            </a>
          </div>
        )}
      </header>

      {folders.length > 0 ? (
        <ChatFolderSelector
          selectedFolder={selectedFolder}
          onSelectFolder={handleChatTypeChange}
          folders={folderList}
        />
      ) : (
        <div className="custom-border" />
      )}

      <SlidingContainer direction={direction} uniqueKey={selectedFolder.id}>
        <ChatList chatIds={filteredChatIds} isCompact={isCompact} />
      </SlidingContainer>
    </aside>
  );
};

export default SidebarDefault;
