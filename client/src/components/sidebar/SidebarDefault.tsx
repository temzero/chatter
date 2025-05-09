import React, { useState, useEffect } from "react";
import { useChatStore } from '@/stores/chatStore';
import { useSidebarStore } from "@/stores/sidebarStore";
import { Logo } from "../ui/Logo";
import SlidingContainer from "@/components/ui/SlidingContainer";
import ChatList from "@/components/ui/ChatList";
import { motion } from "framer-motion";
import { filterChatsByType } from "@/utils/filterChatsByType";

const chatTypes = ["all", "private", "group", "channel"];

const SidebarDefault: React.FC = () => {
  const chats = useChatStore((state) => state.chats);

  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const isCompact = useSidebarStore((state) => state.isCompact);
  const toggleCompact = useSidebarStore((state) => state.toggleCompact);

  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  const filteredChatsByType = React.useMemo(() => {
    return filterChatsByType(chats, selectedType);
  }, [selectedType, chats]);

  const getTypeClass = React.useCallback(
    (type: string) =>
      `flex items-center justify-center cursor-pointer p-2 ${
        selectedType === type
          ? "opacity-100 font-bold"
          : "opacity-50 hover:opacity-80"
      }`,
    [selectedType]
  );

  const handleChatTypeChange = (type: string) => {
    if (type === selectedType) return;

    const currentIndex = chatTypes.indexOf(selectedType);
    const newIndex = chatTypes.indexOf(type);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

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
      <header
        id="logo-container"
        className={`flex w-full items-center h-[var(--header-height)] justify-between`}
      >
        <motion.a
          id="branding"
          className="flex items-center cursor-pointer -ml-[64px]"
          onClick={() => setSidebar("more")}
          whileHover={{ x: 33 }} // This will move the element 5 pixels to the right on hover
          transition={{ type: "spring", stiffness: 600, damping: 30 }} // Spring animation for a bouncy effect
        >
          <span
            className={`material-symbols-outlined text-6xl cursor-pointer ${
              isCompact ? "mr-9" : "mr-3"
            }`}
          >
            trending_flat
          </span>
          <div className={`w-8 h-8 flex items-center justify-center`}>
            <Logo className="h-full w-full" />
          </div>
          {isCompact || (
            <span className="text-2xl font-semibold px-1">Chatter</span>
          )}
        </motion.a>

        {!isCompact && (
          <div className="flex">
            <a
              className="cursor-pointer select-none nav-btn"
              onClick={() => setSidebar("newChat")}
            >
              <i className="material-symbols-outlined text-2xl">add</i>
            </a>
            <a
              className="cursor-pointer select-none nav-btn -ml-2"
              onClick={() => setSidebar("search")}
            >
              <i className="material-symbols-outlined text-2xl">search</i>
            </a>
          </div>
        )}
      </header>

      {/* Chat Type Selector */}
      <div className="flex justify-around items-center custom-border-t custom-border-b w-full shadow">
        {isCompact ? (
          <a className={getTypeClass(selectedType)}>
            {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
          </a>
        ) : (
          <>
            {chatTypes.map((type) => (
              <a
                key={type}
                className={getTypeClass(type)}
                onClick={() => handleChatTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </a>
            ))}
            <i className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer text-sm">
              arrow_forward_ios
            </i>
          </>
        )}
      </div>

      {/* Chat List Container */}
      <SlidingContainer selectedType={selectedType} direction={direction}>
        <ChatList chats={filteredChatsByType} isCompact={isCompact} />
      </SlidingContainer>
    </aside>
  );
};

export default SidebarDefault;
