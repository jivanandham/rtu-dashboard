import React, { KeyboardEvent, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  handleSearch?: () => void;
  suggestions?: string[];
  showCommercialOnly?: boolean;
  onToggleCommercialOnly?: () => void;
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search buildings, addresses, or zip codes...", 
  handleSearch,
  suggestions = [],
  showCommercialOnly = false,
  onToggleCommercialOnly
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle Enter key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && handleSearch) {
      handleSearch();
      setShowSuggestions(false);
    }
  };

  // Filter suggestions based on input value
  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative mb-6">
      {/* Search bar container with enhanced styling */}
      <div 
        className={`relative flex items-center w-full transition-all duration-200 ${
          isFocused 
            ? 'shadow-lg ring-2 ring-blue-400' 
            : 'shadow-md hover:shadow-lg'
        }`}
      >
        <div className={`absolute left-4 transition-colors duration-200 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          className="w-full h-14 pl-12 pr-20 rounded-full border bg-white text-sm focus:outline-none"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (value && suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
        />
        <div className="absolute right-3 flex items-center space-x-1">
          {value && (
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => {
                onChange('');
                setShowSuggestions(false);
              }}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          
          {/* Commercial buildings filter toggle */}
          {onToggleCommercialOnly && (
            <button
              className={`p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-sm hover:shadow mr-1 ${
                showCommercialOnly 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={onToggleCommercialOnly}
              aria-label="Filter commercial buildings"
              title="Show commercial buildings only"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="6" x2="12" y2="6.01"></line>
                <line x1="12" y1="10" x2="12" y2="10.01"></line>
                <line x1="12" y1="14" x2="12" y2="14.01"></line>
                <line x1="12" y1="18" x2="12" y2="18.01"></line>
              </svg>
            </button>
          )}
          
          <button
            className="p-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm hover:shadow"
            onClick={() => {
              if (handleSearch) handleSearch();
              setShowSuggestions(false);
            }}
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && value && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-gray-700"
              onClick={() => {
                onChange(suggestion);
                setShowSuggestions(false);
                if (handleSearch) handleSearch();
              }}
            >
              <svg className="mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
