"use client";

import { motion } from "framer-motion";
import { Cpu, Layers, Server, Wrench } from "lucide-react";
import type { Skill } from "@/lib/types";

const CATEGORY_ICONS: Record<string, typeof Cpu> = {
  Frontend: Layers,
  Backend: Server,
  Tools: Wrench,
  "DevOps & Tools": Wrench,
};

const TICKER_ITEMS = [
  "HTML & CSS",
  "JavaScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "Supabase",
  "PostgreSQL",
  "Python",
  "Git",
  "Linux",
  "Docker",
  "VS Code",
  "Lightroom",
  "Figma",
  "Vim",
];

/** honestly-worded familiarity instead of a fake percentage */
function levelLabel(level: number): string {
  if (level < 35) return "just started";
  if (level < 55) return "getting there";
  if (level < 75) return "pretty decent";
  if (level < 90) return "fairly confident";
  return "dangerously confident";
}

function SkillBar({ skill, delay }: { skill: Skill; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-starlight">{skill.name}</span>
        <span className="font-mono text-[11px] text-mint">{levelLabel(skill.level)}</span>
      </div>
      <div className="h-[7px] overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, delay: delay + 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-indigo to-mint shadow-[0_0_12px_rgba(99,49,251,0.55)]"
        />
      </div>
    </motion.div>
  );
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <div className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat, ci) => {
            const Icon = CATEGORY_ICONS[cat] || Cpu;
            const items = skills.filter((s) => s.category === cat);
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: ci * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="glass glow-border card-hover rounded-2xl p-6"
              >
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo/30 to-mint/15 text-mint shadow-[0_0_20px_rgba(99,49,251,0.3)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-starlight">{cat}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {items.length} in the rotation
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {items.map((skill, si) => (
                    <SkillBar key={skill.id} skill={skill} delay={si * 0.05} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* tech ticker marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass relative mt-14 overflow-hidden rounded-2xl py-4"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-onyx to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-onyx to-transparent" />
          <div className="flex w-max animate-marquee gap-3 pr-3">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-indigo/20 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_8px_rgba(136,249,192,0.8)]" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
