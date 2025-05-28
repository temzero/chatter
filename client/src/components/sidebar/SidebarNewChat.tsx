import React, { useState } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import CreateNewChat from "../ui/CreateNewChat";
import CreateNewGroupChat from "../ui/CreateNewGroupChat";
import { SlidingContainer } from "../ui/SlidingContainer";
import { ChatType } from "@/types/enums/ChatType";

const SidebarNewChat: React.FC = () => {
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const [selectedType, setSelectedType] = useState<ChatType>(ChatType.DIRECT);
  const [direction, setDirection] = useState<number>(1);

  const getTypeClass = (type: ChatType) =>
    `flex items-center justify-center gap-1 cursor-pointer rounded w-full ${
      selectedType === type
        ? "opacity-100 font-bold text-green-400"
        : "opacity-40 hover:opacity-80"
    }`;

  const handleChatTypeChange = (type: ChatType) => {
    if (type === selectedType) return;
    const currentIndex = Object.values(ChatType).indexOf(selectedType);
    const newIndex = Object.values(ChatType).indexOf(type);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  const getTypeLabel = (type: ChatType) => {
    switch (type) {
      case ChatType.GROUP:
        return "Group Chat";
      case ChatType.CHANNEL:
        return "Channel";
      case ChatType.DIRECT:
      default:
        return "Chat";
    }
  };

  const getTypeIcon = (type: ChatType) => {
    switch (type) {
      case ChatType.GROUP:
        return "groups";
      case ChatType.CHANNEL:
        return "tv";
      case ChatType.DIRECT:
      default:
        return "person";
    }
  };

  const NewChatWrapper = (type: ChatType) => {
    switch (type) {
      case ChatType.DIRECT:
        return <CreateNewChat />;
      case ChatType.GROUP:
        return <CreateNewGroupChat type={ChatType.GROUP} />;
      case ChatType.CHANNEL:
        return <CreateNewGroupChat type={ChatType.CHANNEL} />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      <header className="flex w-full items-center h-[var(--header-height)] p-2 pr-0 justify-between">
        <h1 className="font-semibold text-xl pl-1">
          New {getTypeLabel(selectedType)}
        </h1>
        <i
          className="material-symbols-outlined text-2xl opacity-60 hover:opacity-100 p-1 cursor-pointer"
          onClick={() => setSidebar("default")}
        >
          close
        </i>
      </header>

      <div className="flex custom-border-t">
        {Object.values(ChatType).map((type) => (
          <button
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
          </button>
        ))}
      </div>

      <SlidingContainer uniqueKey={selectedType} direction={direction}>
        {NewChatWrapper(selectedType)}
      </SlidingContainer>
    </aside>
  );
};

export default SidebarNewChat;
