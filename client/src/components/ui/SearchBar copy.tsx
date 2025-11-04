import { useRef } from "react";

type SearchBarProps = {
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  onSearch?: (searchTerm: string) => void;
};

const SearchBar = ({
  placeholder = "Search something...",
  type,
  autoFocus = true,
  onSearch,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch?.(value);
  };

  return (
    <div className="flex w-full items-center gap-1 p-1 rounded border-2 border-[var(--border-color)] shadow focus-within:border-[var(--primary-color)] focus-within:shadow-md transition-all duration-200">
      <i
        className={`material-symbols-outlined transition-opacity duration-200 ${
          inputRef.current?.value ? "opacity-100" : "opacity-40"
        }`}
      >
        {type === "add" ? "add" : "search"}
      </i>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full bg-transparent outline-none"
        autoFocus={autoFocus}
      />
    </div>
  );
};

export default SearchBar;
