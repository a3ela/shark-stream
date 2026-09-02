"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-xs ml-auto">
      <Search className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-secondary)" />
      <input
        type="text"
        placeholder="Find a Site..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b py-2 pl-9 pr-4 text-sm text-(--text-primary) placeholder-(--text-secondary)/50 outline-none transition-colors focus:border-(--primary)/50"
      />
    </div>
  );
}
