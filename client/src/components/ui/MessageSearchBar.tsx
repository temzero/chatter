import React, { useRef, useMemo } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useShallow } from "zustand/shallow";
import { debounce } from "lodash";

const MessageSearchBar: React.FC = () => {
  console.log("MessageSearchBar render"); // add to the MessageSearchBar

  const searchMessageInputRef = useRef<HTMLInputElement>(null);
  const { searchQuery, setSearchQuery, setDisplaySearchMessage } =
    useMessageStore(
      useShallow((state) => ({
        searchQuery: state.searchQuery,
        setSearchQuery: state.setSearchQuery,
        setDisplaySearchMessage: state.setDisplaySearchMessage,
      }))
    );

  // Debounce the setSearchQuery function
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
    setSearchQuery("");
  };

  return (
    <div
      className="border-4 border-[--input-border-color] p-1 rounded flex items-center gap-1 w-full"
      onClick={handleClick}
    >
      <span className="material-symbols-outlined select-none">
        manage_search
      </span>
      <input
        ref={searchMessageInputRef}
        className="w-full"
        type="text"
        placeholder="Search for messages"
        defaultValue={searchQuery}
        onChange={handleChange}
        autoFocus
      />
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
