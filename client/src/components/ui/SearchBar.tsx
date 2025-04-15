import { useState } from 'react';

type SearchBarProps = {
  placeholder?: string;
  type?: string;
  value?: string;
};

const SearchBar = ({ value, placeholder = 'Search something...', type }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(value );

  return (
    <div className="flex w-full items-center gap-1 p-1 rounded border-2 border-[var(--border-color)] shadow focus-within:border-[var(--primary-color)] focus-within:shadow-md transition-all duration-200">
      <i
        className={`material-symbols-outlined transition-opacity duration-200 ${
          inputValue ? 'opacity-100' : 'opacity-40'
        }`}
      >
        {type === 'add' ? 'add' : 'search'}
      </i>
      <input
        type="text"
        placeholder={placeholder}
        autoFocus
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
