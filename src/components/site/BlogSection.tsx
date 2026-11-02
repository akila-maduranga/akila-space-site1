"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, PenLine, Tag } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { Markdown } from "@/lib/markdown";

const GRADIENTS = [
  "from-[#6331FB] via-[#8b6bff] to-[#2a1470]",
  "from-[#88F9C0] via-[#6331FB] to-[#01010D]",
  "from-[#8b6bff] via-[#6331FB] to-[#88F9C0]",
  "from-[#1a0b4d] via-[#6331FB] to-[#8b6bff]",
  "from-[#6331FB] via-[#88F9C0] to-[#0e2a22]",
];

function formatDate(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function readMinutes(text: string): number {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function PostCover({ post, tall }: { post: BlogPost; tall?: boolean }) {
  const gradient = GRADIENTS[(post.title.length + post.slug.length) % GRADIENTS.length];
  if (post.cover_image_url) {
    return (
      <img
        src={post.cover_image_url}
        alt=""
        aria-hidden
        className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.05] ${
          tall ? "h-52 sm:h-64" : "h-36"
        }`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${gradient} transition-transform duration-700 group-hover:scale-[1.05] ${
        tall ? "h-52 sm:h-64" : "h-36"
      }`}
    >
      <div className="bg-dots absolute inset-0 opacity-60 mix-blend-overlay" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute inset-0 grid place-items-center">
        <PenLine className="h-8 w-8 text-white/70 drop-shadow-[0_4px_16px_rgba(1,1,13,0.6)]" aria-hidden />
      </div>
    </div>
  );
}

function PostCard({ post, onOpen, index }: { post: BlogPost; onOpen: () => void; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="glass card-hover glow-border group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Read post: ${post.title}`}
    >
      <div className="overflow-hidden">
        <PostCover post={post} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3 text-indigo-soft" />
            {formatDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-indigo-soft" />
            {readMinutes(post.content)} min read
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-starlight transition-colors group-hover:text-mint">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        {post.tags.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border border-indigo/20 bg-indigo/[0.08] px-2 py-0.5 font-mono text-[10px] text-indigo-soft"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-mint transition-all group-hover:gap-3">
          read it <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.article>
  );
}

function PostOverlay({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  // lock body scroll + close on Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[80] overflow-y-auto bg-onyx/97 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={`Blog post: ${post.title}`}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(99,49,251,0.18),transparent_60%)]" />

      {/* top bar */}
      <div className="sticky top-0 z-10 border-b border-indigo/15 bg-onyx/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={onClose}
            className="mint-glow-btn group inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/[0.05] px-4 py-2 font-mono text-xs text-mint transition-all hover:bg-mint/10"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            all posts
          </button>
          <p className="hidden font-mono text-[10px] tracking-[0.25em] text-muted-foreground sm:block">
            {post.slug}
          </p>
        </div>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14"
      >
        {post.cover_image_url ? (
          <div className="glow-border mb-8 overflow-hidden rounded-2xl shadow-[0_30px_90px_-30px_rgba(99,49,251,0.55)]">
            <img src={post.cover_image_url} alt="" className="max-h-[420px] w-full object-cover" />
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-mint">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-soft" />
            {readMinutes(post.content)} min read
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-starlight sm:text-4xl md:text-5xl">
          {post.title}
        </h1>

        {post.tags.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo/25 bg-indigo/[0.08] px-3 py-1 font-mono text-[11px] text-indigo-soft"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-indigo to-mint shadow-[0_0_16px_rgba(99,49,251,0.6)]" />

        <div className="mt-10">
          <Markdown text={post.content} />
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-indigo/15 pt-8">
          <p className="font-mono text-[11px] text-muted-foreground">
            thanks for reading — say hi on any of my links
          </p>
          <button
            onClick={onClose}
            className="mint-glow-btn group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo to-indigo/70 px-5 py-2.5 font-display text-sm font-semibold text-white shadow-[0_10px_36px_-10px_rgba(99,49,251,0.8)]"
          >
            close
            <ArrowLeft className="h-3.5 w-3.5 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

export default function BlogSection({ posts }: { posts: BlogPost[] }) {
  const [expanded, setExpanded] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // hash routing — #/blog/<slug> opens a post, so posts are shareable
  useEffect(() => {
    const parse = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/blog/")) {
        const slug = decodeURIComponent(hash.slice(7));
        if (posts.some((p) => p.slug === slug)) {
          setActiveSlug(slug);
          return;
        }
      }
      setActiveSlug((current) => (current === null ? current : null));
    };
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, [posts]);

  const openPost = (slug: string) => {
    setActiveSlug(slug);
    // pushState instead of assigning location.hash — creates a history entry
    // (so the back button closes the post) without a full navigation
    window.history.pushState(null, "", `#/blog/${encodeURIComponent(slug)}`);
  };

  const closePost = () => {
    setActiveSlug(null);
    if (window.location.hash.startsWith("#/blog/")) {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
  };
  const activePost = useMemo(
    () => (activeSlug ? posts.find((p) => p.slug === activeSlug) ?? null : null),
    [activeSlug, posts]
  );

  const shown = expanded ? posts : posts.slice(0, 3);

  if (!posts.length) {
    return (
      <div className="glass rounded-2xl px-8 py-12 text-center">
        <PenLine className="mx-auto h-8 w-8 text-indigo-soft" aria-hidden />
        <p className="font-display mt-4 text-lg font-semibold text-starlight">
          Nothing written yet
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          new posts will land here the moment I do something worth writing about
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} onOpen={() => openPost(post.slug)} />
        ))}
      </div>

      {posts.length > 3 ? (
        <div className="mt-10 text-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mint-glow-btn inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/[0.05] px-6 py-2.5 font-mono text-xs text-mint transition-all hover:bg-mint/10"
          >
            {expanded ? (
              <>
                show fewer posts <ArrowLeft className="h-3.5 w-3.5 rotate-90" />
              </>
            ) : (
              <>
                read the older stuff too ({posts.length - 3} more){" "}
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {activePost ? <PostOverlay post={activePost} onClose={closePost} /> : null}
      </AnimatePresence>
    </div>
  );
}
