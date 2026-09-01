"use client";

import {
  LayoutGrid,
  Star,
  MonitorPlay,
  Tv,
  BookOpen,
  Radio,
  DollarSign,
  Smartphone,
  Gamepad2,
  Volleyball,
  Music,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

interface SiteDoc {
  _id: string;
  category: { _id: string } | string;
}

interface CategorySidebarProps {
  categories: Category[];
  sites: SiteDoc[];
  selectedCategory: string;
  onSelect: (id: string) => void;
}

const slugIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "movies-shows": MonitorPlay,
  anime: Tv,
  manga: BookOpen,
  Radio: Radio,
  paid: DollarSign,
  apps: Smartphone,
  games: Gamepad2,
  sports: Volleyball,
  music: Music,
};

export default function CategorySidebar({
  categories,
  sites,
  selectedCategory,
  onSelect,
}: CategorySidebarProps) {
  const totalCount = sites.length;

  return (
    <div className="w-full shrink-0 lg:w-56">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--text-secondary)">
          Explore
        </span>
        <span className="text-[11px] font-medium text-(--text-secondary)">
          {totalCount} links
        </span>
      </div>

      <nav className="space-y-1">
        {/* All */}
        <button
          onClick={() => onSelect("all")}
          className={`flex w-full items-center gap-3 px-3 rounded py-2.5 text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-(--primary) text-(--text-inverse)"
              : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-glass-hover)"
          }`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" />
          All
        </button>

        {/* Favorites */}
        <button
          onClick={() => onSelect("favorites")}
          className={`flex w-full items-center gap-3 px-3 rounded py-2.5 text-sm font-medium transition-colors ${
            selectedCategory === "favorites"
              ? "bg-(--primary) text-(--text-inverse)"
              : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-glass-hover)"
          }`}
        >
          <Star className="h-4 w-4 shrink-0" />
          Favorites
        </button>

        <div className="my-3 h-px bg-(--border-color)" />

        {/* Categories */}
        {categories.map((cat) => {
          const Icon = slugIconMap[cat.slug];
          const count = sites.filter((s) => {
            const siteCat = s.category as { _id?: string } | string | null;
            const catId = (
              siteCat && typeof siteCat === "object" && "_id" in siteCat
                ? siteCat._id
                : siteCat
            ) as string | undefined;
            return String(catId) === String(cat._id);
          }).length;

          return (
            <button
              key={cat._id}
              onClick={() => onSelect(cat._id)}
              className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors ${
                selectedCategory === cat._id
                  ? "bg-(--primary) text-(--text-inverse)"
                  : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-glass-hover) rounded"
              }`}
            >
              {Icon ? (
                <Icon className="h-4 w-4 shrink-0" />
              ) : (
                <div className="h-4 w-4 shrink-0  bg-(--text-secondary)/20" />
              )}
              <span className="flex-1 text-left">{cat.name}</span>
              <span className="text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
