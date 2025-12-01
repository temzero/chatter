import { useRef, useEffect, useState } from "react";

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
  const [hasValue, setHasValue] = useState(false); // ✅ Track with state

  useEffect(() => {
    if (!autoFocus) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => clearTimeout(timer);
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHasValue(!!value); // ✅ Update state
    onSearch?.(value);
  };

  return (
    <div className="flex w-full items-center gap-1 p-1 rounded border-2 border-(--border-color) shadow focus-within:border-(--primary-color) focus-within:shadow-md transition-all duration-200">
      <i
        className={`material-symbols-outlined transition-opacity duration-200 ${
          hasValue ? "opacity-100" : "opacity-40" // ✅ Use state instead
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
      />
    </div>
  );
};

export default SearchBar;
