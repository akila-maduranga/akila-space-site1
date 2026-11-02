"use client";

import { useSite } from "@/lib/site-context";
import PageShell from "../PageShell";
import About from "../About";

/** /about — the bio gets a whole page (and a readable panel) to itself */
export default function AboutView() {
  const { profile } = useSite();
  return (
    <PageShell pageKey="about" panel>
      <About profile={profile} />
    </PageShell>
  );
}
