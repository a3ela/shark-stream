"use client";

import { Bookmark, Check, ShieldCheck, Tv, Lock } from "lucide-react";
import Image from "next/image";

export interface SiteDoc {
  _id: string;
  name: string;
  url: string;
  logoUrl: string;
  verified: boolean;
  category: { _id: string; name: string; slug: string } | string;
  ads?: "none" | "low" | "high";
  quality?: string;
  tags?: string[];
  requiresLogin?: boolean;
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
      className="group relative flex flex-col justify-between overflow-hidden rounded border border-(--border-color) bg-(--bg-glass) transition-all duration-200 hover:border-(--primary)/30 hover:shadow-lg hover:shadow-(--primary)/5"
    >
      <div>
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

        {/* Logo */}
        <div className="flex h-24 items-center justify-center px-3">
          {site.logoUrl ? (
            <Image
              width={100}
              height={100}
              src={site.logoUrl}
              alt={site.name}
              className="h-20 w-20 object-contain transition-transform duration-300 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-(--primary)/10 text-lg font-bold text-(--primary)">
              {site.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom details & badges */}
      <div className="flex flex-col border-t border-(--border-color) px-3 py-2.5 gap-2">
        <div>
          <div className="mb-0.5 flex items-center justify-between gap-1.5">
            <span className="font-heading text-sm font-bold text-(--text-primary) truncate">
              {site.name}
            </span>

            {site.verified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
                Checked
              </span>
            )}
          </div>

          <p className="truncate text-xs text-(--text-secondary)/60">
            {getDomain(site.url)}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {site.ads === "none" && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              No Ads
            </span>
          )}
          {site.ads === "low" && (
            <span className="inline-flex items-center rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
              Few Ads
            </span>
          )}
          {site.ads === "high" && (
            <span className="inline-flex items-center rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
              Ad-Heavy
            </span>
          )}

          {site.quality && (
            <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300 border border-cyan-500/20">
              <Tv className="h-2.5 w-2.5" />
              {site.quality}
            </span>
          )}

          {site.requiresLogin === false && (
            <span className="inline-flex items-center rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-500/20">
              No Login
            </span>
          )}
          {site.requiresLogin === true && (
            <span className="inline-flex items-center gap-1 rounded bg-zinc-500/15 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-500/20">
              <Lock className="h-2.5 w-2.5" />
              Login Req
            </span>
          )}

          {site.tags &&
            site.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-(--text-secondary) border border-white/5"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
    </a>
  );
}
