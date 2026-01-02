import React, { useState } from "react";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import {
  SelectionBar,
  SelectionBarOption,
} from "../ui/selectionBar/SelectionBar";
import CreateNewChat from "@/components/ui/chat/CreateNewChat";
import CreateNewGroupChat from "@/components/ui/chat/CreateNewGroupChat";

const SidebarNewChat: React.FC = () => {
  const { t } = useTranslation();
  const setSidebar = getSetSidebar();
  const [selectedType, setSelectedType] = useState<ChatType>(ChatType.DIRECT);
  const [direction, setDirection] = useState<number>(1);

  // Define all options in one array
  const sidebarChatOptions: SelectionBarOption<ChatType>[] = [
    {
      value: ChatType.DIRECT,
      icon: "person",
    },
    {
      value: ChatType.GROUP,
      icon: "groups",
    },
    {
      value: ChatType.CHANNEL,
      icon: "tv",
    },
  ];

  const handleChatTypeChange = (type: ChatType) => {
    if (type === selectedType) return;

    // Get current and new indices for animation direction
    const currentIndex = sidebarChatOptions.findIndex(
      (opt) => opt.value === selectedType
    );
    const newIndex = sidebarChatOptions.findIndex((opt) => opt.value === type);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
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

  // Find the selected option for the header title
  const selectedOption = sidebarChatOptions.find(
    (opt) => opt.value === selectedType
  );

  return (
    <aside className="w-full h-full flex flex-col transition-all duration-300 ease-in-out">
      <header className="flex w-full items-center h-(--header-height) justify-between pl-2">
        <h1 className="font-semibold text-xl pl-1">
          {selectedOption?.label || t("sidebar_new_chat.title.direct")}
        </h1>
        <i
          className="material-symbols-outlined text-2xl! opacity-60 hover:opacity-100 cursor-pointer p-2"
          onClick={() => setSidebar(SidebarMode.DEFAULT)}
        >
          close
        </i>
      </header>

      <SelectionBar<ChatType>
        options={sidebarChatOptions}
        selected={selectedType}
        onSelect={handleChatTypeChange}
        className="mb-3 mx-1.5"
      />

      <SlidingContainer uniqueKey={selectedType} direction={direction}>
        {NewChatWrapper(selectedType)}
      </SlidingContainer>
    </aside>
  );
};

export default SidebarNewChat;
