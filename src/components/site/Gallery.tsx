"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Expand, Aperture } from "lucide-react";
import type { Photo } from "@/lib/types";

function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const photo = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col bg-onyx/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer — ${photo.title}`}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-semibold text-starlight sm:text-base">
            {photo.title}
          </p>
          <p className="font-mono text-[10px] text-mint/80">
            {photo.category} · {index + 1} / {photos.length}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close photo viewer"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-indigo/25 bg-white/[0.04] text-muted-foreground transition-all hover:border-mint/50 hover:text-mint"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* image */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-full max-w-full items-center justify-center"
          >
            { }
            <img
              src={photo.image_url}
              alt={photo.title}
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-[0_30px_90px_-20px_rgba(99,49,251,0.55)] ring-1 ring-indigo/25"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* prev / next */}
        {photos.length > 1 ? (
          <>
            <button
              onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
              aria-label="Previous photo"
              className="glass-strong absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-starlight transition-all hover:scale-110 hover:text-mint sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate((index + 1) % photos.length)}
              aria-label="Next photo"
              className="glass-strong absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-starlight transition-all hover:scale-110 hover:text-mint sm:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {/* caption */}
      <div className="px-4 pb-6 pt-3 text-center sm:px-8">
        <p className="mx-auto max-w-xl font-mono text-xs leading-relaxed text-muted-foreground">
          {photo.caption}
        </p>
      </div>
    </motion.div>
  );
}

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [filter, setFilter] = useState<string>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => p.category && set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [photos]);

  const visible = useMemo(
    () => (filter === "All" ? photos : photos.filter((p) => p.category === filter)),
    [photos, filter]
  );

  const navigate = useCallback(
    (next: number) => setLightbox(next),
    []
  );

  if (!photos.length) return null;

  return (
    <div className="relative">
      {/* filter chips */}
      <div className="mb-8 flex flex-wrap items-center gap-2.5">
        <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Aperture className="h-3.5 w-3.5 text-indigo-soft" />
          filter:
        </span>
        {categories.map((cat) => {
          const active = filter === cat;
          const count = cat === "All" ? photos.length : photos.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              aria-pressed={active}
              className={`relative rounded-full px-4 py-1.5 font-mono text-xs transition-all duration-300 ${
                active
                  ? "text-onyx"
                  : "border border-indigo/25 bg-white/[0.03] text-muted-foreground hover:border-mint/40 hover:text-starlight"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="photo-filter-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-mint to-mint-soft shadow-[0_6px_24px_rgba(136,249,192,0.35)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative">
                {cat}
                <span className={active ? "ml-1.5 text-onyx/70" : "ml-1.5 text-muted-foreground/60"}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* masonry grid */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {visible.map((photo, i) => (
          <motion.figure
            key={photo.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="glow-border glass group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl"
          >
            <button
              onClick={() => setLightbox(i)}
              className="block w-full text-left"
              aria-label={`View ${photo.title} in full screen`}
            >
              <div className="relative overflow-hidden">
                { }
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  draggable={false}
                />
                {/* hover overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-onyx/95 via-onyx/25 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-4 transition-transform duration-500 group-hover:translate-y-0">
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-mint/30 bg-onyx/70 px-2.5 py-1 font-mono text-[10px] text-mint backdrop-blur-sm">
                    <Camera className="h-3 w-3" />
                    {photo.category}
                  </span>
                  <p className="font-display text-base font-bold text-starlight drop-shadow">
                    {photo.title}
                  </p>
                  <p className="mt-1 max-w-md font-mono text-[11px] leading-relaxed text-starlight/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100 line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
                {/* expand affordance */}
                <span className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 scale-75 place-items-center rounded-full border border-mint/40 bg-onyx/70 text-mint opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                  <Expand className="h-4 w-4" />
                </span>
              </div>
            </button>
          </motion.figure>
        ))}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox !== null && visible[lightbox] ? (
          <Lightbox
            photos={visible}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onNavigate={navigate}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
