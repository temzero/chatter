import React, { useState } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import CreateNewChat from "../ui/CreateNewChat";
import CreateNewGroupChat from "../ui/CreateNewGroupChat";

const chatTypes = ["person", "group", "channel"];

const SidebarNewChat: React.FC = () => {
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);

  const getTypeClass = (type: string) =>
    `flex items-center justify-center gap-1 cursor-pointer rounded ${
      selectedType === type
        ? "opacity-100 font-bold text-green-400"
        : "opacity-40 hover:opacity-80"
    }`;

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      <header
        id="logo-container"
        className="flex w-full items-center h-[var(--header-height)] p-2 pr-0 justify-between"
      >
        <h1 className="font-semibold text-xl pl-1">
          New{" "}
          {selectedType === "group"
            ? "Group Chat"
            : selectedType === "channel"
            ? "Channel"
            : "Chat"}
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
          <a
            key={type}
            className={getTypeClass(type)}
            onClick={() => setSelectedType(type)}
          >
            <i
              className={`material-symbols-outlined ${
                type === "group" ? "text-[2.1rem]" : ""
              }`}
            >
              {type === "person"
                ? "person"
                : type === "group"
                ? "groups"
                : "tv"}
            </i>
          </a>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedType === "person" ? <CreateNewChat /> : <CreateNewGroupChat type={selectedType}/>}
      </div>
    </aside>
  );
};

export default SidebarNewChat;
