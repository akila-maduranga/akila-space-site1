"use client";

import { type ReactNode } from "react";
import { useSite } from "@/lib/site-context";
import { DESCRIPTION_BY_KEY, LABEL_BY_KEY } from "@/lib/routes";
import SectionHeading from "./SectionHeading";

/**
 * Shared scaffold for the dedicated content pages. Renders the numbered
 * section heading (label + description come from the owner's `pages`
 * config when available) and optionally wraps the body in a frosted
 * `.page-panel` — the translucent reading slab that keeps the animated
 * background visible behind a soft blur while text stays crisp.
 *
 * Pages that are built entirely from glass cards (projects, gallery,
 * skills, experience) skip the panel; text-dense pages (about, blog
 * posts, connect) turn it on.
 */
export default function PageShell({
  pageKey,
  children,
  panel = false,
  panelClassName = "",
  wide = false,
}: {
  pageKey: string;
  children: ReactNode;
  panel?: boolean;
  panelClassName?: string;
  wide?: boolean;
}) {
  const { pages } = useSite();
  const page = pages.find((p) => p.key === pageKey);
  const label = page?.label || LABEL_BY_KEY[pageKey] || pageKey;
  const subtitle = page?.description || DESCRIPTION_BY_KEY[pageKey] || "";

  // page number = position in the owner's configured page order (home is 00)
  const ordered = [...pages]
    .filter((p) => p.visible !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const position = ordered.findIndex((p) => p.key === pageKey);
  const index = String(position >= 0 ? position + 1 : 1).padStart(2, "0");

  return (
    <section className="relative pb-24 pt-28 md:pb-32 md:pt-36">
      <div className={`mx-auto px-4 sm:px-6 ${wide ? "max-w-7xl" : "max-w-6xl"}`}>
        <SectionHeading index={index} title={label} subtitle={subtitle} />
        {panel ? (
          <div className={`page-panel p-6 sm:p-10 ${panelClassName}`}>{children}</div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
