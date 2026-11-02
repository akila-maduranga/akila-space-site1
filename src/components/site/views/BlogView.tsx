"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, PenLine, Tag } from "lucide-react";
import { useSite } from "@/lib/site-context";
import PageShell from "../PageShell";
import type { BlogPost } from "@/lib/types";

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

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={`/blog/${encodeURIComponent(post.slug)}`}
        aria-label={`Read post: ${post.title}`}
        className="glass card-hover glow-border group relative flex h-full flex-col overflow-hidden rounded-2xl"
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
      </Link>
    </motion.div>
  );
}

/** /blog — every post gets a card; each card opens its own page */
export default function BlogView() {
  const { posts, loading } = useSite();
  const visible = posts
    .filter((p) => p.visible !== false)
    .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));

  return (
    <PageShell pageKey="blog">
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass h-72 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : visible.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl px-8 py-12 text-center">
          <PenLine className="mx-auto h-8 w-8 text-indigo-soft" aria-hidden />
          <p className="font-display mt-4 text-lg font-semibold text-starlight">
            Nothing written yet
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            new posts will land here the moment I do something worth writing about
          </p>
        </div>
      )}
    </PageShell>
  );
}
