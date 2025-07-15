import React, { useState, useEffect, useRef, useCallback } from "react";
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

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const canScrollLeftRef = useRef(false);
  const canScrollRightRef = useRef(false);

  // State
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
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
          folder.chatIds.includes(chat.id) &&
          (folder.types.length === 0 || folder.types.includes(chat.type))
      );
    }
    return filterChatsByType(allChats, selectedFolder);
  }, [selectedFolder, allChats, folders, chatFolders]);

  // Memoized tab class generator
  const getTypeClass = useCallback(
    (type: string) => {
      return `flex items-center justify-center cursor-pointer font-semibold p-2 ${
        selectedFolder === type
          ? "opacity-100 font-bold border-b-2"
          : "opacity-70 hover:opacity-100"
      }`;
    },
    [selectedFolder]
  );

  // Handle tab change
  const handleChatTypeChange = (type: string) => {
    if (type === selectedFolder) return;

    const currentIndex = combinedTabs.indexOf(selectedFolder);
    const newIndex = combinedTabs.indexOf(type);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedFolder(type);
  };

  // Update scroll buttons (memoized)
  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const SCROLL_MARGIN = 4;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const newCanScrollLeft = scrollLeft > SCROLL_MARGIN;
    const newCanScrollRight =
      scrollLeft < scrollWidth - clientWidth - SCROLL_MARGIN;

    // Avoid unnecessary state updates
    if (canScrollLeftRef.current !== newCanScrollLeft) {
      canScrollLeftRef.current = newCanScrollLeft;
      setCanScrollLeft(newCanScrollLeft);
    }

    if (canScrollRightRef.current !== newCanScrollRight) {
      canScrollRightRef.current = newCanScrollRight;
      setCanScrollRight(newCanScrollRight);
    }
  }, []);

  // Scroll handlers
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
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

  // Scroll & Resize Observers (Merged)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Initial check
    updateScrollButtons();

    // Observers
    const resizeObserver = new ResizeObserver(updateScrollButtons);
    const handleScroll = () => updateScrollButtons();
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({ left: e.deltaY * 3, behavior: "smooth" });
      }
    };

    resizeObserver.observe(container);
    container.addEventListener("scroll", handleScroll);
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Delayed check (for initial render)
    const timer = setTimeout(updateScrollButtons, 50);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [updateScrollButtons]);

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

      {/* Chat Type Selector */}
      <div className="relative flex items-center justify-center w-full custom-border-t custom-border-b shadow">
        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto no-scrollbar scrollbar-hide"
        >
          {isCompact ? (
            <a className={getTypeClass(selectedFolder)}>
              {selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)}
            </a>
          ) : (
            combinedTabs.map((type) => {
              const isFolder = chatFolders.includes(type);
              const folder = isFolder
                ? folders.find((f) => f.name === type)
                : null;

              return (
                <a
                  key={type}
                  className={getTypeClass(type)}
                  onClick={() => handleChatTypeChange(type)}
                  style={
                    isFolder && folder?.color
                      ? {
                          color: folder.color,
                          borderColor: folder.color,
                        }
                      : {}
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </a>
              );
            })
          )}
        </div>

        {!isCompact && canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="bg-[input-border-color] custom-border-r shadow-lg backdrop-blur-sm rounded-none flex items-center justify-center overflow-hidden h-full w-6 absolute left-0 top-0 z-40 select-none"
          >
            <i className="material-symbols-outlined text-sm font-bold pl-1.5">
              arrow_back_ios
            </i>
          </button>
        )}

        {!isCompact && canScrollRight && (
          <button
            onClick={scrollRight}
            className="bg-[input-border-color] custom-border-l shadow-lg backdrop-blur-sm rounded-none flex items-center justify-center overflow-hidden h-full w-6 absolute right-0 top-0 z-40 select-none"
          >
            <i className="material-symbols-outlined text-sm font-bold pl-0.5">
              arrow_forward_ios
            </i>
          </button>
        )}
      </div>

      {/* Chat List Container */}
      <SlidingContainer direction={direction} uniqueKey={selectedFolder}>
        <ChatList chats={filteredChats} isCompact={isCompact} />
      </SlidingContainer>
    </aside>
  );
};

export default SidebarDefault;
