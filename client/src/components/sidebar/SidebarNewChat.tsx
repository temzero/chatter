import React, { useState } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import CreateNewChat from "../ui/CreateNewChat";
import CreateNewGroupChat from "../ui/CreateNewGroupChat";
import { SlidingContainer } from "../ui/SlidingContainer";

const chatTypes = ["person", "group", "channel"];

const SidebarNewChat: React.FC = () => {
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  const getTypeClass = (type: string) =>
    `flex items-center justify-center gap-1 cursor-pointer rounded ${
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

  const NewChatWrapper = ({ type }: { type: string }) => {
    switch (type) {
      case "person":
        return <CreateNewChat />;
      case "group":
        return <CreateNewGroupChat type="group" />;
      case "channel":
        return <CreateNewGroupChat type="channel" />;
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

      <div className="flex justify-around items-center custom-border-t w-full h-[40px] backdrop-blur-[120px] p-2">
        {chatTypes.map((type) => (
          <div
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
          </div>
        ))}
      </div>

      <SlidingContainer uniqueKey={selectedType} direction={direction}>
        <NewChatWrapper type={selectedType} />
        {/* <h1 className="p-6 text-center">Content</h1> */}
      </SlidingContainer>
    </aside>
  );
};

export default SidebarNewChat;
