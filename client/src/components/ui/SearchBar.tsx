import { useEffect, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(localSearchTerm);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  useEffect(() => {
    return () => {
      setSearchTerm("");
      setLocalSearchTerm("");
    };
  }, [setSearchTerm]);

  // ⏳ Set focus time to prevent animation flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 202);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

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
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={localSearchTerm}
        onChange={handleChange}
        className="w-full bg-transparent outline-none"
      />
    </div>
  );
};

export default SearchBar;
