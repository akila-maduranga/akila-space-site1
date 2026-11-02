"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";
import type { SocialLink } from "@/lib/types";
import StarfieldBackground from "./StarfieldBackground";
import CustomCursor from "./CustomCursor";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Projects from "./Projects";
import Photography from "./Photography";
import Skills from "./Skills";
import Experience from "./Experience";
import SocialLinks from "./SocialLinks";
import BlogSection from "./BlogSection";
import Footer from "./Footer";
import SectionHeading from "./SectionHeading";

function openExternal(url: string) {
  if (!url) return;
  if (url.startsWith("mailto:") || url.startsWith("tel:")) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function PortfolioSite() {
  const { loading, profile, projects, photos, socialLinks, skills, experiences, posts, pages } =
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

  // ordered list of the sections the owner has switched on
  const activePages = [...pages]
    .filter((p) => p.visible !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    // sections with nothing to show are skipped entirely (and don't consume a number)
    .filter((page) => {
      switch (page.key) {
        case "projects":
          return visibleProjects.length > 0;
        case "photography":
          return visiblePhotos.length > 0;
        case "skills":
          return visibleSkills.length > 0;
        case "experience":
          return visibleExperiences.length > 0;
        default:
          return true;
      }
    });

  const sectionIndex = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col">
      <StarfieldBackground />
      <CustomCursor />

      <AnimatePresence>
        {loading ? (
          <motion.div
            key="boot"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-onyx"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 animate-spin-slower rounded-full border-2 border-dashed border-indigo/40" />
                <div className="absolute inset-3 grid place-items-center rounded-full bg-gradient-to-br from-indigo to-[#2a1470] font-display text-xl font-bold text-white shadow-[0_0_40px_rgba(99,49,251,0.6)]">
                  {profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
              </div>
              <p className="font-mono text-xs tracking-[0.3em] text-mint/80">
                one sec — warming things up
                <span className="animate-blink">...</span>
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Navbar name={profile.name} pages={pages} />

      <main className="flex-1">
        <Hero profile={profile} socialLinks={visibleLinks} onLinkClick={handleLinkClick} />

        {activePages.map((page, pageIndex) => {
          switch (page.key) {
            case "about":
              return (
                <section id="about" key={page.key} className="py-24 md:py-32">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <SectionHeading index={sectionIndex(pageIndex)} title={page.label} subtitle={page.description} />
                    <About profile={profile} />
                  </div>
                </section>
              );

            case "projects":
              return (
                <section id="projects" key={page.key} className="py-24 md:py-32">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <SectionHeading index={sectionIndex(pageIndex)} title={page.label} subtitle={page.description} />
                    <Projects projects={visibleProjects} />
                  </div>
                </section>
              );

            case "photography":
              return (
                <section id="photography" key={page.key} className="py-24 md:py-32">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <SectionHeading index={sectionIndex(pageIndex)} title={page.label} subtitle={page.description} />
                    <Photography photos={visiblePhotos} />
                  </div>
                </section>
              );

            case "blog":
              return (
                <section id="blog" key={page.key} className="py-24 md:py-32">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <SectionHeading index={sectionIndex(pageIndex)} title={page.label} subtitle={page.description} />
                    <BlogSection posts={visiblePosts} />
                  </div>
                </section>
              );

            case "skills":
              return (
                <section id="skills" key={page.key} className="py-24 md:py-32">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <SectionHeading index={sectionIndex(pageIndex)} title={page.label} subtitle={page.description} />
                    <Skills skills={visibleSkills} />
                  </div>
                </section>
              );

            case "experience":
              return (
                <section id="experience" key={page.key} className="py-24 md:py-32">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <SectionHeading index={sectionIndex(pageIndex)} title={page.label} subtitle={page.description} />
                    <Experience experiences={visibleExperiences} />
                  </div>
                </section>
              );

            case "connect":
              return (
                <section id="connect" key={page.key} className="py-24 md:py-32">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <SectionHeading index={sectionIndex(pageIndex)} title={page.label} subtitle={page.description} />
                    <SocialLinks profile={profile} socialLinks={visibleLinks} onLinkClick={handleLinkClick} />
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      <Footer profile={profile} />
    </div>
  );
}
