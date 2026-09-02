"use client";

import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface BannerProps {
  siteCount: number;
}

const Banner = ({ siteCount }: BannerProps) => {
  return (
    <section className="relative z-10 flex flex-wrap items-center justify-evenly gap-8 px-6 py-5 md:px-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.svg"
            alt="Shark Stream logo"
            width={120}
            height={120}
            className="h-20 w-20 shrink-0 object-contain md:h-20 md:w-20"
          />
          <h1 className="text-shimmer font-unbounded text-5xl font-extrabold leading-none tracking-tight md:text-6xl">
            Shark Stream
          </h1>
        </div>
        <p className="ml-1 text-lg text-(--text-secondary) md:ml-1.5 md:text-xl">
          Discover streaming sites, all in one place.
        </p>
      </div>

      <div
        className="relative flex items-center justify-center"
        style={{ width: 340, height: 300 }}
      >
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 260,
            height: 260,
            border: "1.5px dashed rgba(255,255,255,0.07)",
          }}
        />
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 340,
            height: 340,
            border: "1.5px dashed rgba(255,255,255,0.04)",
          }}
        />

        <div
          className="relative w-72 select-none rounded p-6"
          style={{
            transform: "rotate(-4deg)",
            background: "linear-gradient(145deg, #0e2030 0%, #0b1a25 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderTopColor: "rgba(255,255,255,0.18)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 60px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.5)",
          }}
        >
          <span
            className="mb-3 block text-[14px] font-bold uppercase tracking-[0.2em] italic"
            style={{ color: "var(--primary)" }}
          >
            Tonight&apos;s Pick
          </span>

          <h2 className="mb-3 font-heading text-[1.65rem] font-extrabold leading-tight text-white">
            Find your next
            <br />
            obsession.
          </h2>

          <p
            className="mb-5 text-sm leading-relaxed"
            style={{ color: "rgba(180,195,210,0.7)" }}
          >
            One directory, every genre covered.
          </p>

          <button
            onClick={() =>
              document
                .getElementById("explore")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200"
            style={{ color: "var(--secondary)" }}
          >
            Explore the index
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Floating badge */}
        <div
          className="absolute bottom-2 -right-20 flex items-center gap-2.5 rounded px-3.5 py-2.5"
          style={{
            transform: "rotate(4deg)",
            background: "linear-gradient(135deg, #0b1e2c 0%, #091520 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderTopColor: "rgba(255,255,255,0.16)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <Sparkles
            className="h-5 w-5 shrink-0"
            style={{ color: "var(--secondary)" }}
          />
          <div className="leading-tight">
            <p
              className="text-[12px]"
              style={{ color: "rgba(180,195,210,0.65)" }}
            >
              {siteCount} sites
            </p>
            <p className="text-[18px] font-bold text-white">to explore</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Banner;
