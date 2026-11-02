"use client";

import { ArrowUp } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="relative mt-auto border-t border-indigo/15 bg-[rgba(1,1,13,0.7)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-1.5 md:items-start">
          <p className="font-display text-sm font-semibold text-starlight">
            {profile.name}
            <span className="text-mint">.space</span>
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} {profile.name}
          </p>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="mint-glow-btn group inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/[0.05] px-4 py-2 font-mono text-xs text-mint transition-all hover:bg-mint/10"
        >
          back to orbit
          <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  );
}
