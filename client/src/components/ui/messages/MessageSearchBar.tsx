import React, { useRef, useMemo } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useShallow } from "zustand/shallow";
import { useTranslation } from "react-i18next";

const MessageSearchBar: React.FC = () => {
  const { t } = useTranslation();
  const searchMessageInputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    setDisplaySearchMessage,
    showImportantOnly,
    setShowImportantOnly,
  } = useMessageStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery,
      setDisplaySearchMessage: state.setDisplaySearchMessage,
      showImportantOnly: state.showImportantOnly,
      setShowImportantOnly: state.setShowImportantOnly,
    }))
  );

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
    setSearchQuery("");
  };

  const toggleImportantFilter = () => {
    setShowImportantOnly(!showImportantOnly);
  };

  return (
    <div
      className="border-4 border-(--input-border-color) p-1 rounded flex items-center gap-1 w-full"
      onClick={handleClick}
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

      {/* Toggle flag icon */}
      <button
        onClick={toggleImportantFilter}
        className="flex items-center justify-center"
        title={t("messages.search_bar.filter_important")}
      >
        <span
          className={`material-symbols-outlined mr-1 opacity-60 hover:opacity-90 ${
            showImportantOnly ? "filled text-red-400" : ""
          }`}
        >
          star
        </span>
      </button>

      <button
        onClick={handleClose}
        className="rounded-full flex items-center justify-center w-6 h-6 -ml-2 opacity-70 hover:opacity-100 hover:bg-red-500/30"
      >
        <span className="material-symbols-outlined">close_small</span>
      </button>
    </div>
  );
};

export default MessageSearchBar;
