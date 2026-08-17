"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext<{
  currentTheme: string;
  themes: Record<string, { id: string; name: string; color: string }>;
  changeTheme: (id: string) => void;
} | null>(null);

const THEMES: Record<string, { id: string; name: string; color: string }> = {
  blueish: { id: "blueish", name: "Azure", color: "#3b82f6" },
  redish: { id: "redish", name: "Crimson", color: "#ef4444" },
  purplish: { id: "purplish", name: "Violet", color: "#a855f7" },
  greenish: { id: "greenish", name: "Emerald", color: "#10b981" },
};

function readSavedTheme(): string {
  if (typeof window === "undefined") return "blueish";
  const saved = localStorage.getItem("theme");
  return saved && THEMES[saved] ? saved : "blueish";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState(readSavedTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  const changeTheme = useCallback((id: string) => {
    if (THEMES[id]) {
      setCurrentTheme(id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, themes: THEMES, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
