import React, { useState } from "react";
import { getSetSidebar } from "@/stores/sidebarStore";
import CreateNewChat from "@/components/ui/chat/CreateNewChat";
import CreateNewGroupChat from "@/components/ui/chat/CreateNewGroupChat";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

const sidebarChatTypes = [ChatType.DIRECT, ChatType.GROUP, ChatType.CHANNEL];

const SidebarNewChat: React.FC = () => {
  const { t } = useTranslation();
  const setSidebar = getSetSidebar();
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
    const currentIndex = sidebarChatTypes.indexOf(selectedType);
    const newIndex = sidebarChatTypes.indexOf(type);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  const getTypeLabel = (type: ChatType) => {
    switch (type) {
      case ChatType.GROUP:
        return t("sidebar_new_chat.title.group");
      case ChatType.CHANNEL:
        return t("sidebar_new_chat.title.channel");
      case ChatType.DIRECT:
      default:
        return t("sidebar_new_chat.title.direct");
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
        return <CreateNewChat />;
    }
  };

  return (
    <aside className="w-full h-full flex flex-col transition-all duration-300 ease-in-out">
      <header className="flex w-full items-center h-(--header-height) justify-between pl-2">
        <h1 className="font-semibold text-xl pl-1">
          {getTypeLabel(selectedType)}
        </h1>
        <i
          className="material-symbols-outlined text-2xl! opacity-60 hover:opacity-100 cursor-pointer p-2"
          onClick={() => setSidebar(SidebarMode.DEFAULT)}
        >
          close
        </i>
      </header>

      <div className="flex custom-border-t custom-border-b bg-black/10">
        {sidebarChatTypes.map((type) => (
          <button
            key={type}
            className={getTypeClass(type)}
            onClick={() => handleChatTypeChange(type)}
          >
            <i
              className={clsx(
                "material-symbols-outlined py-1",
                type === selectedType && "filled",
                type === ChatType.GROUP && "text-[2.1rem]!"
              )}
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
