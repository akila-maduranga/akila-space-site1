"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Profile, SocialLink } from "@/lib/types";
import { PLATFORM_META, PlatformIcon } from "@/lib/icons";
import ContactForm from "./ContactForm";

export default function SocialLinks({
  profile,
  socialLinks,
  onLinkClick,
}: {
  profile: Profile;
  socialLinks: SocialLink[];
  onLinkClick: (link: SocialLink) => void;
}) {
  return (
    <div className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* left — message
              min-w-0: grid items size their track from content by default;
              without it the truncated (nowrap) lines below force the track
              wider than the viewport on phones (horizontal-scroll bug). */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 flex-col justify-center"
          >
            <h3 className="font-display text-3xl font-bold leading-tight text-starlight sm:text-4xl">
              Say hi —
              <span className="gradient-text"> about anything</span>
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Want to talk cameras, code, self-hosting, or the best short-eats
              spot on the island? My inbox is open. No pitch required — nice
              strangers are welcome too.
            </p>
            <ContactForm profile={profile} />
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              <span className="text-mint">▸</span> usually replies within a day or two — no promises
            </p>
          </motion.div>

          {/* right — link cards (min-w-0 for the same grid-blowout reason) */}
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {socialLinks.map((link, i) => {
              const meta = PLATFORM_META[link.platform] || PLATFORM_META.other;
              let display = link.url;
              try {
                display = link.url.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "");
              } catch {
                /* keep raw */
              }
              return (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => onLinkClick(link)}
                  style={{ ["--p" as string]: meta.color }}
                  className="glass card-hover group relative flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl p-4 text-left sm:p-5"
                  aria-label={`Open ${link.label} profile`}
                >
                  {/* hover color wash */}
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_12%_50%,color-mix(in_srgb,var(--p)_16%,transparent),transparent_65%)]" />
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-indigo/20 bg-white/[0.04] text-muted-foreground transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:border-[color-mix(in_srgb,var(--p)_55%,transparent)] group-hover:text-[var(--p)] group-hover:shadow-[0_0_24px_color-mix(in_srgb,var(--p)_30%,transparent)]">
                    <PlatformIcon platform={link.platform} className="h-6 w-6" />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="font-display block truncate text-sm font-semibold text-starlight transition-colors group-hover:text-mint sm:text-base">
                      {link.label}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {display}
                    </span>
                  </span>
                  <ArrowUpRight className="relative h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-mint" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
