"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Profile, SocialLink } from "@/lib/types";
import { PlatformIcon } from "@/lib/icons";
import Typewriter from "./Typewriter";
import { useSite } from "@/lib/site-context";

function TerminalCard({ username, frames }: { username: string; frames: number }) {
  const lines: { text: string; color: string; delay: number }[] = [
    { text: "$ whoami", color: "text-mint", delay: 0.5 },
    { text: "enthusiast · tinkerer · guy with a camera", color: "text-starlight/90", delay: 0.9 },
    { text: "", color: "", delay: 1.2 },
    { text: "$ cat about.txt", color: "text-mint", delay: 1.5 },
    { text: '"not a pro — just really into this stuff"', color: "text-indigo-soft", delay: 1.9 },
    { text: "", color: "", delay: 2.2 },
    { text: "$ ls ./current_obsessions", color: "text-mint", delay: 2.5 },
    { text: "nextjs/  cameras/  selfhosting/  tea/", color: "text-starlight/90", delay: 2.9 },
    { text: "", color: "", delay: 3.6 },
    { text: "$ ls ./gallery | wc -l", color: "text-mint", delay: 3.9 },
    { text: `✦ ${frames} photos and counting ✦`, color: "text-mint", delay: 4.3 },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glow-border glass relative w-full max-w-md overflow-hidden rounded-2xl shadow-[0_24px_80px_-20px_rgba(99,49,251,0.45)]"
    >
      <div className="flex items-center gap-2 border-b border-indigo/15 bg-white/[0.02] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">{username}@cosmos: ~/portfolio</span>
      </div>
      <div className="relative p-5 font-mono text-[13px] leading-6">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: line.delay, duration: 0.25 }}
            className={line.color || ""}
          >
            {line.text || "\u00A0"}
          </motion.p>
        ))}
        <p className="text-mint">
          ${" "}
          <span className="inline-block h-4 w-2 translate-y-[3px] animate-blink bg-mint shadow-[0_0_10px_rgba(136,249,192,0.8)]" />
        </p>
        {/* scan line */}
        <div className="pointer-events-none absolute inset-x-0 h-16 animate-scan bg-gradient-to-b from-transparent via-mint/[0.06] to-transparent" />
      </div>
    </motion.div>
  );
}

function Planet() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute -right-10 -top-16 hidden h-40 w-40 lg:block"
      aria-hidden
    >
      {/* planet body */}
      <div className="animate-float-slow absolute inset-0">
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_30%_30%,#b6ffd9_0%,#88f9c0_18%,#6331fb_55%,#1a0b4d_100%)] shadow-[0_0_60px_rgba(99,49,251,0.65),inset_-18px_-14px_40px_rgba(1,1,13,0.8)]" />
        {/* surface bands */}
        <div className="absolute inset-0 overflow-hidden rounded-full opacity-40">
          <div className="absolute left-0 right-0 top-[38%] h-2 rotate-[-12deg] rounded-full bg-white/15 blur-[2px]" />
          <div className="absolute left-[10%] right-[5%] top-[55%] h-1.5 rotate-[-12deg] rounded-full bg-mint/25 blur-[2px]" />
        </div>
      </div>
      {/* orbit ring */}
      <div className="absolute inset-[-24px] animate-spin-slower">
        <div className="h-full w-full rotate-[-18deg]">
          <div className="absolute inset-0 rounded-[50%] border border-indigo/30" style={{ transform: "scaleY(0.42)" }} />
          {/* orbiting satellite */}
          <div
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-mint shadow-[0_0_12px_3px_rgba(136,249,192,0.75)]"
            style={{ transform: "rotate(0deg) translateX(102px) rotate(0deg)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero({
  profile,
  socialLinks,
  onLinkClick,
}: {
  profile: Profile;
  socialLinks: SocialLink[];
  onLinkClick: (link: SocialLink) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const rise = useTransform(scrollYProgress, [0, 0.7], [0, -90]);
  const { stats } = useSite();

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-16"
    >
      {/* local readability scrim — deepens the space behind the headline
          just enough that big text stays crisp over the moving network,
          without hiding the animation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_28%_45%,rgba(1,1,13,0.5),transparent_70%),radial-gradient(ellipse_45%_50%_at_78%_55%,rgba(1,1,13,0.35),transparent_70%)]"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <motion.div style={{ opacity: fade, y: rise }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-mint/30 bg-mint/[0.06] px-4 py-1.5"
          >
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-mint" />
            <span className="font-mono text-xs tracking-wide text-mint">
              {profile.available ? "open to collabs & side quests" : "heads-down building mode"}
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-mono text-sm text-indigo-soft"
          >
            <Sparkles className="mr-2 inline h-4 w-4" aria-hidden />
            hello world, I&apos;m
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="font-display mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-starlight sm:text-6xl lg:text-7xl"
          >
            {profile.name.split(" ")[0]}
            <br />
            <span className="gradient-text text-glow-indigo">{profile.name.split(" ").slice(1).join(" ")}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="font-display mt-5 text-xl font-semibold sm:text-2xl"
          >
            <Typewriter words={profile.roles.length ? profile.roles : [profile.title]} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {profile.bio_short}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/projects"
              className="mint-glow-btn group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo to-indigo/70 px-6 py-3 font-display text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(99,49,251,0.8)]"
            >
              see what I&apos;ve made
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-mint/35 bg-mint/[0.04] px-6 py-3 font-display text-sm font-semibold text-mint transition-all hover:bg-mint/10 hover:shadow-[0_0_28px_rgba(136,249,192,0.2)]"
            >
              <Mail className="h-4 w-4" />
              Get in Touch
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <span className="font-mono text-xs text-muted-foreground">find me online:</span>
            <div className="flex items-center gap-3">
              {socialLinks.slice(0, 6).map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  onClick={() => onLinkClick(link)}
                  aria-label={link.label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-indigo/20 bg-white/[0.03] text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-mint/50 hover:text-mint hover:shadow-[0_8px_24px_rgba(136,249,192,0.2)]"
                >
                  <PlatformIcon platform={link.platform} className="h-[18px] w-[18px]" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* quick facts — kept honest, nothing tracked here */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
          >
            <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-indigo-soft" />
              {profile.location}
            </span>
            {[
              { label: "years of tinkering", value: stats.yearsExperience },
              { label: "little projects", value: stats.projectCount },
              { label: "photos taken", value: stats.photoCount },
            ].map((s) => (
              <span key={s.label} className="font-mono text-xs text-muted-foreground">
                <span className="font-display text-sm font-bold text-mint text-glow-mint">{s.value}</span>{" "}
                {s.label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* right column */}
        <div className="relative flex justify-center lg:justify-end">
          <Planet />
          <TerminalCard
            username={profile.name.split(" ")[0].toLowerCase().replace(/\s+/g, "") || "dev"}
            frames={stats.photoCount}
          />
        </div>
      </div>

      {/* scroll indicator — points at the explore launchpad below */}
      <motion.a
        href="#explore"
        aria-label="Scroll to the explore section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{ opacity: fade }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <span className="flex h-11 w-7 items-start justify-center rounded-full border-2 border-indigo/40 p-1.5">
          <motion.span
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="block h-2 w-1 rounded-full bg-mint"
          />
        </span>
      </motion.a>
    </section>
  );
}
