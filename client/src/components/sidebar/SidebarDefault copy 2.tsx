import { useAllChatIds } from "@/stores/chatStore";
import { getSetSidebar, useIsCompactSidebar } from "@/stores/sidebarStore";
import { Logo } from "@/components/ui/icons/Logo";
import { motion } from "framer-motion";
import { SidebarMode } from "@/common/enums/sidebarMode";
import ChatList from "@/components/ui/chat/ChatList";

const SidebarDefault: React.FC = () => {
  console.log("SidebarDefault");

  // Much better approach - stable selectors
  const chatIds = useAllChatIds(); // Returns state.chatIds (stable array)
  // const chatMap = useAllChats(); // Returns state.chats (stable object)
  const isCompact = useIsCompactSidebar();
  const setSidebar = getSetSidebar();

  // Memoize the "All" folder to prevent recreating on every render

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 ease-in-out`}
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
      {/* {folders.length > 0 ? (
          <ChatFolderSelector
            selectedFolder={selectedFolder}
            onSelectFolder={handleChatTypeChange}
            folders={folderList}
          />
        ) : (
          <div className="custom-border" />
        )} */}

      {/* Chat List - Now passing chatIds instead of chat objects */}
      {/* <SlidingContainer direction={direction} uniqueKey={selectedFolder.id}> */}
      <ChatList chatIds={chatIds} isCompact={isCompact} />
      {/* </SlidingContainer> */}
    </aside>
  );
};

export default SidebarDefault;
