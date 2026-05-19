import { useEffect, useState } from 'react';

const MAX_LENGTH = 200;

const SearchBar = ({ onSearch, disabled, initialValue = '' }) => {
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const submitSearch = () => {
    if (!text.trim() || disabled) {
      return;
    }

    onSearch(text);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      submitSearch();
    }
  };

  return (
    <div className="search-panel">
      <label htmlFor="search-input" className="sr-only">
        English or French word or sentence
      </label>
      <div className="search-row">
        <input
          id="search-input"
          type="text"
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type English or French..."
          disabled={disabled}
        />
        <button type="button" onClick={submitSearch} disabled={disabled || !text.trim()}>
          Translate
        </button>
      </div>
      <p className="character-count">
        {text.length}/{MAX_LENGTH}
      </p>
    </div>
  );
};

export default SearchBar;
