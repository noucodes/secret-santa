"use client";

import { useState } from "react";
import { ghostButtonClass } from "@/shared/components/page-shell";

export function CopyLine({ label, path }: { label: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-lift px-4 py-3">
      <p className="min-w-0 text-sm">
        <span className="text-mute">{label} </span>
        <span className="break-all">{path}</span>
      </p>
      <button type="button" onClick={() => void copyPath()} className={ghostButtonClass}>
        <span className={`transition-colors duration-150 ${copied ? "text-success" : ""}`}>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
