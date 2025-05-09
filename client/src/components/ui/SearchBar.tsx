import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useDebounce } from "@/hooks/useDebounce";

type SearchBarProps = {
  placeholder?: string;
  type?: string;
};

const SearchBar = ({
  placeholder = "Search something...",
  type,
}: SearchBarProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const setSearchTerm = useChatStore((state) => state.setSearchTerm);

  // Debounce the search input (200ms delay)
  const debouncedSearchTerm = useDebounce(localSearchTerm);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  useEffect(() => {
    // Reset search when component unmounts
    return () => {
      setSearchTerm("");
      setLocalSearchTerm("");
    };
  }, [setSearchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  // const handleClear = () => {
  //   setLocalSearchTerm("");
  //   setSearchTerm("");
  // };

  return (
    <div className="flex w-full items-center gap-1 p-1 rounded border-2 border-[var(--border-color)] shadow focus-within:border-[var(--primary-color)] focus-within:shadow-md transition-all duration-200">
      <i
        className={`material-symbols-outlined transition-opacity duration-200 ${
          localSearchTerm ? "opacity-100" : "opacity-40"
        }`}
      >
        {type === "add" ? "add" : "search"}
      </i>
      <input
        type="text"
        placeholder={placeholder}
        autoFocus
        value={localSearchTerm}
        onChange={handleChange}
        className="w-full bg-transparent outline-none"
      />
      {/* {localSearchTerm && (
        <button
          onClick={handleClear}
          className="material-symbols-outlined  text-xl opacity-60 hover:opacity-100"
          aria-label="Clear search"
        >
          close
        </button>
      )} */}
    </div>
  );
};

export default SearchBar;
