"use client";

import { useState, useMemo, useCallback } from "react";
import CategorySidebar from "./category-sidebar";
import SearchBar from "./search-bar";
import SiteCard from "./site-card";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

interface SiteDoc {
  _id: string;
  name: string;
  url: string;
  logoUrl: string;
  verified: boolean;
  category: { _id: string; name: string; slug: string } | string;
  createdAt: string;
}

interface DectionaryProps {
  sites: SiteDoc[];
  categories: Category[];
}

export default function Dectionary({
  sites = [],
  categories = [],
}: DectionaryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("sharkstream-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("sharkstream-favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const filteredSites = useMemo(() => {
    let result = sites ?? [];

    if (selectedCategory === "favorites") {
      result = result.filter((s) => favorites.includes(s._id));
    } else if (selectedCategory !== "all") {
      result = result.filter((s) => {
        const cat = s.category as { _id?: string } | string | null;
        const catId = (
          cat && typeof cat === "object" && "_id" in cat ? cat._id : cat
        ) as string | undefined;

        return String(catId) === String(selectedCategory);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
      );
    }

    return result;
  }, [sites, selectedCategory, searchQuery, favorites]);

  const sectionLabel = useMemo(() => {
    if (selectedCategory === "all") return "All";
    if (selectedCategory === "favorites") return "Favorites";
    const cat = categories.find((c) => c._id === selectedCategory);
    return cat?.name ?? "All";
  }, [selectedCategory, categories]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6" id="explore">
      <div className="flex flex-col lg:flex-row lg:gap-10">
        {/* Sidebar */}
        <aside className="mb-6 lg:mb-0">
          <CategorySidebar
            categories={categories}
            sites={sites}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--text-secondary) mb-1">
                The Index / {sectionLabel}
              </p>
              <h2 className="font-heading text-4xl font-extrabold text-(--text-primary)">
                Take your pick
              </h2>
              <p className="text-sm text-(--text-secondary)">
                {filteredSites.length} results ready to explore
              </p>
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Card grid */}
          {filteredSites.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredSites.map((site, i) => (
                <SiteCard
                  key={site._id}
                  site={site}
                  index={i}
                  isFavorite={favorites.includes(site._id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-(--border-color) bg-(--bg-glass) py-16 text-center">
              <p className="text-lg font-semibold text-(--text-primary) mb-1">
                No sites found
              </p>
              <p className="text-sm text-(--text-secondary)">
                Try a different search or category.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
