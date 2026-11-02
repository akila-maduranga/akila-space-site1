"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Tag } from "lucide-react";
import { useSite } from "@/lib/site-context";
import { Markdown } from "@/lib/markdown";
import type { BlogPost } from "@/lib/types";

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

/**
 * /blog/[slug] — a post is a real page now, not an overlay: shareable URL,
 * browser refresh works, back button behaves, and long posts get all the
 * vertical room they need. Body sits on the readable `.page-panel` so the
 * animated background stays visible (softly, behind the blur) while the
 * text stays crisp.
 */
export default function BlogPostView({ slug }: { slug: string }) {
  const { posts, loading } = useSite();
  const decoded = decodeURIComponent(slug);

  const visible = posts
    .filter((p) => p.visible !== false)
    .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));
  const post: BlogPost | undefined = visible.find((p) => p.slug === decoded);
  const idx = post ? visible.findIndex((p) => p.slug === decoded) : -1;
  const newer = idx > 0 ? visible[idx - 1] : null;
  const older = idx >= 0 && idx < visible.length - 1 ? visible[idx + 1] : null;

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
        <div className="page-panel h-[60vh] animate-pulse" />
      </section>
    );
  }

  if (!post) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-36 text-center sm:px-6">
        <p className="font-mono text-sm text-mint">404 · lost in space</p>
        <h1 className="font-display mt-4 text-3xl font-bold text-starlight">
          That post isn&apos;t on board
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          It may have been renamed, hidden, or never existed.
        </p>
        <Link
          href="/blog"
          className="mint-glow-btn mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo to-indigo/70 px-6 py-3 font-display text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          back to all posts
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 md:pt-32">
      {/* top bar */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/blog"
          className="mint-glow-btn group inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/[0.05] px-4 py-2 font-mono text-xs text-mint transition-all hover:bg-mint/10"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          all posts
        </Link>
        <p className="hidden font-mono text-[10px] tracking-[0.25em] text-muted-foreground sm:block">
          {post.slug}
        </p>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="page-panel p-6 sm:p-10"
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

        <div className="mt-14 border-t border-indigo/15 pt-8">
          <p className="font-mono text-[11px] text-muted-foreground">
            thanks for reading — say hi on any of my links
          </p>
          <div className="mt-4">
            <Link
              href="/connect"
              className="mint-glow-btn group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo to-indigo/70 px-5 py-2.5 font-display text-sm font-semibold text-white shadow-[0_10px_36px_-10px_rgba(99,49,251,0.8)]"
            >
              get in touch
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.article>

      {/* prev / next */}
      {(newer || older) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {newer ? (
            <Link
              href={`/blog/${encodeURIComponent(newer.slug)}`}
              className="glass card-hover group rounded-2xl p-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                ← newer post
              </p>
              <p className="font-display mt-2 text-sm font-semibold leading-snug text-starlight transition-colors group-hover:text-mint">
                {newer.title}
              </p>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {older ? (
            <Link
              href={`/blog/${encodeURIComponent(older.slug)}`}
              className="glass card-hover group rounded-2xl p-5 sm:text-right"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                older post →
              </p>
              <p className="font-display mt-2 text-sm font-semibold leading-snug text-starlight transition-colors group-hover:text-mint">
                {older.title}
              </p>
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}
