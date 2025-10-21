import React, { useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import ChatList from "@/components/ui/chat/ChatList";
import { useChatStore } from "@/stores/chatStore";
import { filterChatsByType } from "@/common/utils/chat/filterChatsByType";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useTranslation } from "react-i18next";

const chatTypes = ["all", ChatType.DIRECT, ChatType.GROUP, ChatType.CHANNEL];

const SidebarSearch: React.FC = () => {
  const { t } = useTranslation();
  const filteredChats = useChatStore((state) => state.filteredChats);
  const setSidebar = getSetSidebar();

  const [selectedType, setSelectedType] = useState("all");
  const [direction, setDirection] = useState<number>(1);

  const filteredChatsByType = React.useMemo(
    () => filterChatsByType(filteredChats, selectedType),
    [selectedType, filteredChats]
  );

  const getTypeClass = (type: ChatType | string) =>
    `flex flex-col items-center justify-center gap-0.5 cursor-pointer py-2 flex-1 transition ${
      selectedType === type
        ? "opacity-100 font-semibold text-green-400"
        : "opacity-50 hover:opacity-80"
    }`;

  const handleChatTypeChange = (type: ChatType | string) => {
    if (type === selectedType) return;
    const currentIndex = chatTypes.indexOf(selectedType);
    const newIndex = chatTypes.indexOf(type);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  const getTypeIcon = (type: ChatType | string) => {
    switch (type) {
      case ChatType.DIRECT:
        return "person";
      case ChatType.GROUP:
        return "groups";
      case ChatType.CHANNEL:
        return "tv";
      default:
        return "menu";
    }
  };

  return (
    <aside className="w-full h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <header className="flex w-full items-center h-[var(--header-height)] justify-between px-2">
        <SearchBar placeholder={t("sidebar_search.placeholder")} />
        <span
          className="material-symbols-outlined text-2xl opacity-60 hover:opacity-100 p-1 cursor-pointer"
          onClick={() => setSidebar(SidebarMode.DEFAULT)}
        >
          close
        </span>
      </header>

      {/* Chat Type Selector */}
      <div className="flex justify-around items-center custom-border-t custom-border-b w-full shadow">
        {chatTypes.map((type) => (
          <a
            key={type}
            className={getTypeClass(type)}
            onClick={() => handleChatTypeChange(type)}
          >
            <i
              className={`material-symbols-outlined ${
                type === ChatType.GROUP ? "text-[2.1rem]" : ""
              }`}
            >
              {getTypeIcon(type)}
            </i>
          </a>
        ))}
      </div>

      {/* Chat List Container */}
      <SlidingContainer uniqueKey={selectedType} direction={direction}>
        {filteredChatsByType.length > 0 ? (
          <ChatList chats={filteredChatsByType} />
        ) : (
          <div className="flex flex-col items-center justify-center my-auto opacity-40 py-10">
            <i className="material-symbols-outlined text-6xl">search_off</i>
            <p>{t("sidebar_search.no_result")}</p>
          </div>
        )}
      </SlidingContainer>
    </aside>
  );
};

export default SidebarSearch;
