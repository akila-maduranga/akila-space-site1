"use client";

import { useSite } from "@/lib/site-context";
import PageShell from "../PageShell";
import Skills from "../Skills";

/** /skills — the toolbox, honestly rated */
export default function SkillsView() {
  const { skills } = useSite();
  const visible = skills.filter((s) => s.visible !== false);

  return (
    <PageShell pageKey="skills">
      {visible.length ? (
        <Skills skills={visible} />
      ) : (
        <div className="glass rounded-2xl px-8 py-12 text-center">
          <p className="font-display text-lg font-semibold text-starlight">
            Toolbox under construction
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            tools will appear once I&apos;ve rated them honestly enough
          </p>
        </div>
      )}
    </PageShell>
  );
}
