"use client";

import { motion } from "framer-motion";
import type { Profile } from "@/lib/types";
import { useSite } from "@/lib/site-context";
import { FactIcon } from "@/lib/icons";

export default function About({ profile }: { profile: Profile }) {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const paragraphs = profile.bio.split("\n").filter(Boolean);
  const { facts } = useSite();
  const visibleFacts = facts.filter((f) => f.visible !== false);

  return (
    <div className="relative">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* avatar card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-fit"
          >
            <div className="relative">
              {/* rotating dashed ring */}
              <div className="absolute -inset-6 animate-spin-slower rounded-full border-2 border-dashed border-indigo/30" />
              {/* glow */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-indigo/40 to-mint/25 blur-2xl opacity-60" />
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${profile.name} avatar`}
                  width={280}
                  height={280}
                  className="relative h-56 w-56 rounded-3xl object-cover sm:h-64 sm:w-64"
                />
              ) : (
                <div className="glow-border glass relative grid h-56 w-56 place-items-center overflow-hidden rounded-3xl sm:h-64 sm:w-64">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(136,249,192,0.22),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(99,49,251,0.35),transparent_60%)]" />
                  <div className="bg-dots absolute inset-0 opacity-40" />
                  <span className="font-display relative text-7xl font-bold">
                    <span className="gradient-text">{initials}</span>
                  </span>
                  <span className="absolute bottom-4 font-mono text-[10px] tracking-[0.3em] text-mint/70">
                    AROUND SINCE {new Date().getFullYear() - profile.years_experience}
                  </span>
                </div>
              )}
              {/* floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass-strong absolute -bottom-5 -right-8 rounded-2xl px-4 py-2.5 shadow-[0_10px_36px_rgba(99,49,251,0.4)]"
              >
                <p className="font-mono text-[10px] text-muted-foreground">tinkering for</p>
                <p className="font-display text-xl font-bold text-mint text-glow-mint">
                  {profile.years_experience}+ yrs
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* bio */}
          <div>
            {paragraphs.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {i === 0 ? (
                  <>
                    <span className="font-display text-lg font-semibold text-starlight sm:text-xl">
                      Hey, I&apos;m {profile.name.split(" ")[0]}.{" "}
                    </span>
                    {para}
                  </>
                ) : (
                  para
                )}
              </motion.p>
            ))}

            {visibleFacts.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {visibleFacts.map((fact, i) => (
                  <motion.div
                    key={fact.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                    className="glass card-hover flex items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo/15 text-indigo-soft">
                      <FactIcon icon={fact.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {fact.label}
                      </p>
                      <p className="truncate text-xs font-medium text-starlight sm:text-sm">{fact.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
    </div>
  );
}
