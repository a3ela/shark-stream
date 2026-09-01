"use client";

import { Bookmark } from "lucide-react";
import Image from "next/image";

interface SiteDoc {
  _id: string;
  name: string;
  url: string;
  logoUrl: string;
  verified: boolean;
  category: { _id: string; name: string; slug: string } | string;
}

interface SiteCardProps {
  site: SiteDoc;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function SiteCard({
  site,
  index,
  isFavorite,
  onToggleFavorite,
}: SiteCardProps) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded border border-(--border-color) bg-(--bg-glass) transition-all duration-200 hover:border-(--primary)/30 hover:shadow-lg hover:shadow-(--primary)/5"
    >
      {/* Top row */}
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="font-mono text-xs text-(--text-secondary)/50">
          {String(index + 1).padStart(2, "0")}
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(site._id);
          }}
          className="p-1 transition-colors"
          aria-label="Bookmark"
        >
          <Bookmark
            className={`h-4 w-4 transition-colors ${
              isFavorite
                ? "fill-(--primary) text-(--primary)"
                : "text-(--text-secondary)/40 group-hover:text-(--text-secondary)"
            }`}
          />
        </button>
      </div>

      <div className="flex h-25 items-center justify-center px-3">
        {site.logoUrl ? (
          <Image
            width={120}
            height={120}
            src={site.logoUrl}
            alt={site.name}
            className="h-25 w-25 object-contain"
          />
        ) : (
          <div className="flex h-25 w-25 items-center justify-center rounded-xl bg-(--primary)/10 text-lg font-bold text-(--primary)">
            {site.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-(--border-color) px-3 py-2.5">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="font-heading text-sm font-bold text-(--text-primary)">
            {site.name}
          </span>

          {site.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Checked
            </span>
          )}
        </div>

        <p className="truncate text-xs text-(--text-secondary)/60">
          {getDomain(site.url)}
        </p>
      </div>
    </a>
  );
}
