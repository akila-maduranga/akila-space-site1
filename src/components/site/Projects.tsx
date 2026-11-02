"use client";

import { motion } from "framer-motion";
import { ExternalLink, Folder, Github, Star } from "lucide-react";
import type { Project } from "@/lib/types";

const GRADIENTS = [
  "from-[#6331FB] via-[#8b6bff] to-[#2a1470]",
  "from-[#88F9C0] via-[#6331FB] to-[#01010D]",
  "from-[#8b6bff] via-[#6331FB] to-[#88F9C0]",
  "from-[#1a0b4d] via-[#6331FB] to-[#8b6bff]",
  "from-[#6331FB] via-[#88F9C0] to-[#0e2a22]",
];

function ProjectCover({ project, big }: { project: Project; big?: boolean }) {
  const gradient = GRADIENTS[(project.gradient || 0) % GRADIENTS.length];
  const initials = project.title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (project.image_url) {
    return (
      <img
        src={project.image_url}
        alt={`${project.title} preview`}
        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] ${
          big ? "" : ""
        }`}
      />
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${gradient} transition-transform duration-700 group-hover:scale-[1.06]`}
    >
      {/* star dots */}
      <div className="bg-dots absolute inset-0 opacity-70 mix-blend-overlay" />
      {/* diagonal shine */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.14)_45%,transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-onyx/40 blur-2xl" />
      {/* planet-ish core */}
      <div className="absolute right-6 top-6 h-10 w-10 rounded-full bg-white/15 shadow-[inset_-6px_-6px_14px_rgba(1,1,13,0.5)]" />
      {/* title mark */}
      <div className="absolute inset-0 grid place-items-center">
        <span
          className={`font-display font-bold text-white/90 drop-shadow-[0_4px_24px_rgba(1,1,13,0.6)] ${
            big ? "text-7xl md:text-8xl" : "text-5xl"
          }`}
        >
          {initials}
        </span>
      </div>
      {project.featured ? (
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-onyx/60 px-3 py-1 font-mono text-[10px] font-medium text-mint backdrop-blur-sm">
          <Star className="h-3 w-3 fill-mint" />
          featured
        </span>
      ) : null}
    </div>
  );
}

function FeaturedProject({ project, flip }: { project: Project; flip: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={`group grid gap-6 md:grid-cols-12 md:gap-0`}
    >
      {/* cover */}
      <div
        className={`glow-border relative overflow-hidden rounded-2xl shadow-[0_20px_60px_-18px_rgba(99,49,251,0.5)] md:col-span-7 ${
          flip ? "md:order-2 md:translate-x-6" : "md:translate-x-0"
        } aspect-[16/10] md:aspect-auto md:min-h-[320px]`}
      >
        <ProjectCover project={project} big />
      </div>

      {/* info */}
      <div
        className={`relative flex flex-col justify-center md:col-span-5 ${
          flip ? "md:order-1 md:-translate-x-6 md:text-right md:items-end" : "md:translate-x-6"
        } z-10 -mt-6 md:mt-0 md:bg-transparent`}
      >
        <p className="font-mono text-xs tracking-[0.25em] text-mint">
          {String(project.sort_order + 1).padStart(2, "0")} · favourite
        </p>
        <h3 className="font-display mt-2 text-2xl font-bold text-starlight transition-colors group-hover:text-mint sm:text-3xl">
          {project.title}
        </h3>
        <div className="glass mt-4 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground shadow-lg md:bg-[rgba(10,10,28,0.85)] md:backdrop-blur-xl">
          {project.description}
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-md border border-indigo/20 bg-indigo/[0.08] px-2.5 py-1 font-mono text-[11px] text-indigo-soft"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className={`mt-5 flex items-center gap-4 ${flip ? "md:justify-end" : ""}`}>
          {project.repo_url ? (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code`}
              className="text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-starlight"
            >
              <Github className="h-5 w-5" />
            </a>
          ) : null}
          {project.live_url ? (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-mint transition-all hover:gap-2.5 hover:text-mint-soft"
            >
              take a look <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function CompactProject({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="glass card-hover glow-border group relative flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <ProjectCover project={project} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo/15 text-indigo-soft transition-colors group-hover:bg-mint/15 group-hover:text-mint">
            <Folder className="h-4 w-4" />
          </span>
          <div className="flex items-center gap-3">
            {project.repo_url ? (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} source code`}
                className="text-muted-foreground transition-colors hover:text-starlight"
              >
                <Github className="h-[18px] w-[18px]" />
              </a>
            ) : null}
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live site`}
                className="text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-mint"
              >
                <ExternalLink className="h-[18px] w-[18px]" />
              </a>
            ) : null}
          </div>
        </div>
        <h3 className="font-display text-lg font-semibold text-starlight transition-colors group-hover:text-mint">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
          {project.tech.slice(0, 5).map((t) => (
            <li key={t} className="font-mono text-[11px] text-indigo-soft/90">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="space-y-16 md:space-y-24">
          {featured.map((p, i) => (
            <FeaturedProject key={p.id} project={p} flip={i % 2 === 1} />
          ))}
        </div>

        {rest.length > 0 ? (
          <div className="mt-20 md:mt-28">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8 font-mono text-sm tracking-wider text-muted-foreground"
            >
              <span className="text-mint">▸</span> more from the lab
            </motion.p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <CompactProject key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
