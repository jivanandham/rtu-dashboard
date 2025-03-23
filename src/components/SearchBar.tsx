import React from 'react';

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  handleSearch: () => void;
}

export default function SearchBar({ search, setSearch, handleSearch }: SearchBarProps) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Search by address or zip code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}
