import React, { useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SlidingContainer } from "../ui/SlidingContainer";
import ChatList from "@/components/ui/ChatList";
import { useChatStore } from "@/stores/chatStore";
import { filterChatsByType } from "@/utils/filterChatsByType";

const chatTypes = ["all", "direct", "group", "channel"];

const SidebarSearch: React.FC = () => {
  const filteredChats = useChatStore((state) => state.filteredChats);
  const { setSidebar } = useSidebarStore();

  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  const filteredChatsByType = React.useMemo(() => {
    return filterChatsByType(filteredChats, selectedType);
  }, [selectedType, filteredChats]);

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

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <header
        id="logo-container"
        className="flex w-full items-center h-[var(--header-height)] justify-between"
      >
        <div className="flex items-center w-full px-2">
          <SearchBar placeholder="Search chats..." />
          <span
            className="material-symbols-outlined text-2xl opacity-60 hover:opacity-100 p-1 cursor-pointer ml-2"
            onClick={() => setSidebar("default")}
          >
            close
          </span>
        </div>
      </header>

      {/* Chat Type Selector */}
      <div className="flex justify-around items-center custom-border-t custom-border-b w-full shadow">
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
      </div>

      {/* Chat List Container */}
      <SlidingContainer uniqueKey={selectedType} direction={direction}>
        {filteredChatsByType.length > 0 ? (
          <ChatList chats={filteredChatsByType} />
        ) : (
          <div className="flex flex-col items-center justify-center my-auto opacity-40 py-10">
            <i className="material-symbols-outlined text-6xl">search_off</i>
            <p>No Result!</p>
          </div>
        )}
      </SlidingContainer>
    </aside>
  );
};

export default SidebarSearch;
