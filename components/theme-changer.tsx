"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "./theme-provider";
import { Palette } from "lucide-react";

export default function ThemeChanger() {
  const { currentTheme, themes, changeTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Desktop: dot selector */}
      <div className="hidden items-center gap-1 md:flex">
        <div className="flex items-center gap-1 rounded-full border border-(--border-color) bg-(--bg-glass-hover)/40 p-1">
          {Object.values(themes).map((theme) => (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                currentTheme === theme.id
                  ? "ring-2 ring-(--primary)/50 shadow-lg shadow-(--glow-tertiary)"
                  : "hover:bg-(--bg-glass-hover)/70"
              }`}
              aria-label={`Switch to ${theme.name} theme`}
              title={theme.name}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: theme.color }}
              />
              {currentTheme === theme.id && (
                <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--primary)" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="relative rounded-lg p-2 transition-colors hover:bg-(--bg-glass-hover)/70"
        >
          <Palette className="h-5 w-5 text-(--text-secondary)" />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: themes[currentTheme]?.color }}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-full right-0 z-50 mb-2 w-40 overflow-hidden rounded-xl border border-(--border-color) bg-(--bg-glass) shadow-xl shadow-(--shadow-color) backdrop-blur-sm">
            {Object.values(themes).map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  changeTheme(theme.id);
                  setDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-(--bg-glass-hover)/70 ${
                  currentTheme === theme.id
                    ? "text-(--primary)"
                    : "text-(--text-primary)"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                {theme.name}
                {currentTheme === theme.id && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
