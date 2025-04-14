import { useState } from 'react';

const SearchBar = ({ placeholder = 'Search something...' }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="input flex items-center gap-1">
      <i
        className={`material-symbols-outlined transition-opacity duration-200 ${
          inputValue ? 'opacity-100' : 'opacity-40'
        }`}
      >
        search
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
