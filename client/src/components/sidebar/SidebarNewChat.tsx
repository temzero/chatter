import React, { useState } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import CreateNewChat from "../ui/CreateNewChat";
import CreateNewGroupChat from "../ui/CreateNewGroupChat";
import { SlidingContainer } from "../ui/SlidingContainer";
import { ChatType } from "@/types/enums/ChatType";

const chatTypes = ["person", "group", "channel"];

const SidebarNewChat: React.FC = () => {
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  const getTypeClass = (type: string) =>
    `flex items-center justify-center gap-1 cursor-pointer rounded w-full ${
      selectedType === type
        ? "opacity-100 font-bold text-green-400"
        : "opacity-40 hover:opacity-80"
    }`;

  const handleChatTypeChange = (type: string) => {
    if (type === selectedType) return;
    const currentIndex = chatTypes.indexOf(selectedType);
    const newIndex = chatTypes.indexOf(type);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "group":
        return "Group Chat";
      case "channel":
        return "Channel";
      case "person":
      default:
        return "Chat";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "group":
        return "groups";
      case "channel":
        return "tv";
      case "person":
      default:
        return "person";
    }
  };

  const NewChatWrapper = (type: string) => {
    switch (type) {
      case "person":
        return <CreateNewChat />;
      case "group":
        return <CreateNewGroupChat type={ChatType.GROUP} />;
      case "channel":
        return <CreateNewGroupChat type={ChatType.CHANNEL} />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      <header
        id="logo-container"
        className="flex w-full items-center h-[var(--header-height)] p-2 pr-0 justify-between"
      >
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
        {chatTypes.map((type) => (
          <button
            key={type}
            className={getTypeClass(type)}
            onClick={() => handleChatTypeChange(type)}
          >
            <i
              className={`material-symbols-outlined ${
                type === "group" ? "text-[2.1rem]" : ""
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
