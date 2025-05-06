import { useState, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";

type SearchBarProps = {
  placeholder?: string;
  type?: string;
  value?: string;
};

const SearchBar = ({
  value,
  placeholder = "Search something...",
  type,
}: SearchBarProps) => {
  const searchTerm = useChatStore((state) => state.searchTerm);
  const setSearchTerm = useChatStore((state) => state.setSearchTerm);

  const [inputValue, setInputValue] = useState(value || "");

  // Sync the input value with the context search term
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value); // Update the context search term immediately
  };

  return (
    <div className="flex w-full items-center gap-1 p-1 rounded border-2 border-[var(--border-color)] shadow focus-within:border-[var(--primary-color)] focus-within:shadow-md transition-all duration-200">
      <i
        className={`material-symbols-outlined transition-opacity duration-200 ${
          inputValue ? "opacity-100" : "opacity-40"
        }`}
      >
        {type === "add" ? "add" : "search"}
      </i>
      <input
        type="text"
        placeholder={placeholder}
        autoFocus
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
