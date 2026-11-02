"use client";

import { useSite } from "@/lib/site-context";
import PageShell from "../PageShell";
import Projects from "../Projects";

/** /projects — full page for the lab; featured builds + the rest */
export default function ProjectsView() {
  const { projects } = useSite();
  const visible = projects.filter((p) => p.visible !== false);

  return (
    <PageShell pageKey="projects" wide>
      {visible.length ? (
        <Projects projects={visible} />
      ) : (
        <div className="glass rounded-2xl px-8 py-12 text-center">
          <p className="font-display text-lg font-semibold text-starlight">
            The lab is a bit empty right now
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            finished builds will land here the moment they&apos;re worth showing
          </p>
        </div>
      )}
    </PageShell>
  );
}
