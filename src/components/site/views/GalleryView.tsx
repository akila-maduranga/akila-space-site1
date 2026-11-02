"use client";

import { useSite } from "@/lib/site-context";
import PageShell from "../PageShell";
import Gallery from "../Gallery";

/** /gallery — the whole wall of photos, filters and lightbox included */
export default function GalleryView() {
  const { photos } = useSite();
  const visible = photos.filter((p) => p.visible !== false);

  return (
    <PageShell pageKey="gallery" wide>
      {visible.length ? (
        <Gallery photos={visible} />
      ) : (
        <div className="glass rounded-2xl px-8 py-12 text-center">
          <p className="font-display text-lg font-semibold text-starlight">
            No photos published yet
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            the memory card is still full — give it a minute
          </p>
        </div>
      )}
    </PageShell>
  );
}
