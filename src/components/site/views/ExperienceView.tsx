"use client";

import { useSite } from "@/lib/site-context";
import PageShell from "../PageShell";
import Experience from "../Experience";

/** /experience — the timeline gets room to grow on its own page */
export default function ExperienceView() {
  const { experiences } = useSite();
  const visible = experiences.filter((e) => e.visible !== false);

  return (
    <PageShell pageKey="experience">
      {visible.length ? (
        <Experience experiences={visible} />
      ) : (
        <div className="glass rounded-2xl px-8 py-12 text-center">
          <p className="font-display text-lg font-semibold text-starlight">
            The timeline starts soon
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            chapters will appear here as they happen
          </p>
        </div>
      )}
    </PageShell>
  );
}
