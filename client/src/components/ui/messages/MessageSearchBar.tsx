import React, { useRef, useMemo } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useShallow } from "zustand/shallow";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { buttonAnimation } from "@/common/animations/buttonAnimations";

const MessageSearchBar: React.FC = () => {
  const { t } = useTranslation();
  const searchMessageInputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    setDisplaySearchMessage,
    filterImportantMessages,
    setShowImportantOnly,
    filterLinkMessages,
    setShowLinkOnly,
  } = useMessageStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery,
      setDisplaySearchMessage: state.setDisplaySearchMessage,
      filterImportantMessages: state.filterImportantMessages,
      setShowImportantOnly: state.setShowImportantOnly,
      filterLinkMessages: state.filterLinkMessages,
      setShowLinkOnly: state.setShowLinkOnly,
    }))
  );

  console.log("filterLinkMessages", filterLinkMessages);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedSetSearchQuery = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    [setSearchQuery]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchQuery(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleClose = () => {
    setDisplaySearchMessage(false);
    setShowImportantOnly(false);
    setShowLinkOnly(false);
    setSearchQuery("");
  };

  /* -------------------- FILTER CONFIG -------------------- */
  const filters = [
    {
      key: "link",
      icon: "link",
      active: filterLinkMessages,
      onToggle: () => setShowLinkOnly(!filterLinkMessages),
      activeClass: "bg-blue-500",
      title: t("messages.search_bar.filter_link"),
    },
    {
      key: "important",
      icon: "star",
      active: filterImportantMessages,
      onToggle: () => setShowImportantOnly(!filterImportantMessages),
      activeClass: "bg-yellow-400",
      title: t("messages.search_bar.filter_important"),
    },
  ] as const;

  return (
    <motion.div
      className="w-full border-4 bg-(--sidebar-color) border-(--input-border-color) p-1 flex items-center gap-1"
      style={{ zIndex: 99 }}
      onClick={handleClick}
      {...messageAnimations.pinMessage}
    >
      <span className="material-symbols-outlined select-none">
        manage_search
      </span>

      <input
        ref={searchMessageInputRef}
        className="w-full"
        type="text"
        placeholder={t("messages.search_bar.placeholder")}
        defaultValue={searchQuery}
        onChange={handleChange}
        autoFocus
      />

      {/* 🔁 Render filters */}
      {filters.map((filter) => (
        <motion.button
          key={filter.key}
          onClick={filter.onToggle}
          className="flex items-center justify-center"
          title={filter.title}
          {...buttonAnimation}
        >
          <span
            className={`material-symbols-outlined text-white rounded-full opacity-60 hover:opacity-90 ${
              filter.active
                ? `${filter.activeClass} opacity-100`
                : "bg-(--input-border-color)"
            }`}
          >
            {filter.icon}
          </span>
        </motion.button>
      ))}

      <button
        onClick={handleClose}
        className="rounded-full! flex items-center justify-center w-6 h-6 opacity-70 hover:opacity-100 hover:bg-red-500/30"
      >
        <span className="material-symbols-outlined">close_small</span>
      </button>
    </motion.div>
  );
};

export default MessageSearchBar;
