"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Compass,
  Cpu,
  PenLine,
  Rocket,
  Send,
  User,
  FolderGit2,
  type LucideIcon,
} from "lucide-react";
import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";
import { routeForKey } from "@/lib/routes";
import type { SocialLink } from "@/lib/types";
import Hero from "../Hero";
import SectionHeading from "../SectionHeading";

const ICON_BY_KEY: Record<string, LucideIcon> = {
  about: User,
  projects: FolderGit2,
  gallery: Camera,
  blog: PenLine,
  skills: Cpu,
  experience: Compass,
  connect: Send,
};

function openExternal(url: string) {
  if (!url) return;
  if (url.startsWith("mailto:") || url.startsWith("tel:")) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function HomeView() {
  const { profile, projects, photos, socialLinks, skills, experiences, posts, pages, stats } =
    useSite();

  const handleLinkClick = (link: SocialLink) => {
    getStore()
      .trackLinkClick(link)
      .catch(() => {});
    openExternal(link.url);
  };

  const visibleProjects = projects.filter((p) => p.visible !== false);
  const visiblePhotos = photos.filter((p) => p.visible !== false);
  const visibleLinks = socialLinks.filter((l) => l.visible !== false);
  const visibleSkills = skills.filter((s) => s.visible !== false);
  const visibleExperiences = experiences.filter((e) => e.visible !== false);
  const visiblePosts = posts.filter((p) => p.visible !== false);

  // the owner-configured sections, in their chosen order, skipping empty
  // ones — same rule the old one-pager used for which sections existed
  const activePages = [...pages]
    .filter((p) => p.visible !== false && routeForKey(p.key))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .filter((page) => {
      switch (page.key) {
        case "projects":
          return visibleProjects.length > 0;
        case "gallery":
          return visiblePhotos.length > 0;
        case "skills":
          return visibleSkills.length > 0;
        case "experience":
          return visibleExperiences.length > 0;
        default:
          return true;
      }
    });

  const metaForKey = (key: string): string => {
    switch (key) {
      case "projects":
        return `${visibleProjects.length} project${visibleProjects.length === 1 ? "" : "s"}`;
      case "gallery":
        return `${visiblePhotos.length} photo${visiblePhotos.length === 1 ? "" : "s"}`;
      case "blog":
        return visiblePosts.length
          ? `${visiblePosts.length} post${visiblePosts.length === 1 ? "" : "s"}`
          : "fresh ink soon";
      case "skills":
        return `${visibleSkills.length} tools in rotation`;
      case "experience":
        return `${stats.yearsExperience}+ yrs of tinkering`;
      case "connect":
        return `${visibleLinks.length} ways to say hi`;
      case "about":
        return "the person behind it all";
      default:
        return "";
    }
  };

  return (
    <>
      <Hero profile={profile} socialLinks={visibleLinks} onLinkClick={handleLinkClick} />

      {/* every section now has its own page — this is the launchpad */}
      <section id="explore" className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            index="00"
            title="explore the station"
            subtitle="Each wing of this site now has its own page — plenty of room for everything I keep adding to it."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activePages.map((page, i) => {
              const href = routeForKey(page.key)!;
              const Icon = ICON_BY_KEY[page.key] ?? Rocket;
              return (
                <motion.div
                  key={page.key}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={href}
                    className="glass card-hover glow-border group relative flex h-full flex-col overflow-hidden rounded-2xl p-6"
                  >
                    {/* corner glow on hover */}
                    <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo/30 to-mint/15 text-mint shadow-[0_0_20px_rgba(99,49,251,0.3)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs text-indigo-soft/70">
                        /{page.key}
                      </span>
                    </div>

                    <h3 className="font-display mt-5 text-lg font-semibold text-starlight transition-colors group-hover:text-mint">
                      {page.label}
                    </h3>
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                      {page.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-indigo/10 pt-4">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {metaForKey(page.key)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-mint transition-all group-hover:gap-3">
                        open <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
