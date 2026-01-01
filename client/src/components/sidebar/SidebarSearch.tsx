import React, { useState } from "react";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import { getChats } from "@/stores/chatStore";
import { filterChatsByType } from "@/common/utils/chat/filterChatsByType";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useTranslation } from "react-i18next";
import { SelectionBar } from "../ui/selectionBar/SelectionBar";
import ChatList from "@/components/ui/chat/ChatList";
import SearchBar from "@/components/ui/SearchBar";

const chatTypes = ["all", ChatType.DIRECT, ChatType.GROUP, ChatType.CHANNEL];

const SidebarSearch: React.FC = () => {
  const { t } = useTranslation();
  const chats = getChats();
  const setSidebar = getSetSidebar();

  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Local search state
  const [direction, setDirection] = useState<number>(1);

  // Filter chats locally based on search term
  const filteredChats = React.useMemo(() => {
    if (!searchTerm) return chats;

    return chats.filter((chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // Then filter by type
  const filteredChatsByType = React.useMemo(
    () => filterChatsByType(filteredChats, selectedType),
    [selectedType, filteredChats]
  );

  const filteredChatIds = React.useMemo(
    () => filteredChatsByType.map((chat) => chat.id),
    [filteredChatsByType]
  );
  
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <aside className="w-full h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <header className="flex w-full items-center h-(--header-height) justify-between pl-2">
        <SearchBar
          placeholder={t("sidebar_search.placeholder")}
          onSearch={handleSearch}
        />
        <span
          className="material-symbols-outlined text-2xl! opacity-60 hover:opacity-100 p-2 cursor-pointer"
          onClick={() => setSidebar(SidebarMode.DEFAULT)}
        >
          close
        </span>
      </header>

      <SelectionBar
        options={chatTypes}
        selected={selectedType}
        onSelect={handleChatTypeChange}
        getIcon={getTypeIcon}
        className="mb-3 mx-1.5"
      />

      {/* Chat List Container */}
      <SlidingContainer uniqueKey={selectedType} direction={direction}>
        {filteredChatsByType.length > 0 ? (
          <ChatList chatIds={filteredChatIds} />
        ) : (
          <div className="flex flex-col items-center justify-center my-auto opacity-40 py-10">
            <i className="material-symbols-outlined text-6xl!">search_off</i>
            <p>
              {searchTerm
                ? t("common.messages.no_result")
                : t("common.messages.no_chats", { type: selectedType })}
            </p>
          </div>
        )}
      </SlidingContainer>
    </aside>
  );
};

export default SidebarSearch;
