"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ShieldAlert } from "lucide-react";

const WarnBar = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="relative mx-auto flex w-full items-center gap-3 rounded px-7 py-3 mb-7 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(135deg, rgba(74, 222, 128, 0.16) 0%, rgba(34, 197, 94, 0.10) 100%)",
        border: "1px solid rgba(74, 222, 128, 0.28)",
        boxShadow:
          "0 0 0 1px rgba(74, 222, 128, 0.08) inset, 0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <ShieldAlert className="h-5 w-5 shrink-0" style={{ color: "#4ade80" }} />

      <p className="flex-1 text-sm leading-snug text-(--text-primary)">
        These third-party sites carry ads. We recommend{" "}
        <a
          href="https://brave.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4ade80" }}
          className="inline-flex items-center gap-1 font-medium underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current"
        >
          <Image
            src="/brave.png"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
            unoptimized
          />
          Brave
        </a>{" "}
        or{" "}
        <a
          href="https://ublockorigin.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4ade80" }}
          className="inline-flex items-center gap-1 font-medium underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current"
        >
          <Image
            src="/adblocker.png"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
            unoptimized
          />
          uBlock Origin
        </a>{" "}
        to block intrusive ads and popups.
      </p>

      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss warning"
        className="shrink-0 rounded-md p-1 text-(--text-secondary) transition-colors "
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default WarnBar;
