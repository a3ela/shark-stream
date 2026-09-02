"use client";

import { ArrowUpRight } from "lucide-react";

export default function ExploreLink() {
  return (
    <button
      onClick={() =>
        document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })
      }
      className="group inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200"
      style={{ color: "var(--secondary)" }}
    >
      Explore the index
      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
}
