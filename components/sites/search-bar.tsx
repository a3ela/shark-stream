"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="site-search">
      <Search className="site-search__icon" aria-hidden="true" />
      <label className="sr-only" htmlFor="site-directory-search">Search streaming sites</label>
      <input
        id="site-directory-search"
        type="text"
        placeholder="Search sites, quality, or tags"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="site-search__input"
      />
      {value && <button type="button" className="site-search__clear" onClick={() => onChange("")} aria-label="Clear site search"><X size={16} /></button>}
    </div>
  );
}
