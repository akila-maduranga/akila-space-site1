"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { Experience } from "@/lib/types";

export default function Experience({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative">
          {/* the timeline spine */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo via-mint/60 to-transparent md:left-1/2" />

          <div className="space-y-12 md:space-y-16">
            {experiences.map((exp, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative grid gap-4 pl-14 md:grid-cols-2 md:gap-0 md:pl-0 ${
                    left ? "" : ""
                  }`}
                >
                  {/* node */}
                  <span
                    className={`absolute left-[11px] top-6 z-10 grid h-[18px] w-[18px] place-items-center md:left-1/2 md:-translate-x-1/2 ${
                      exp.current ? "" : ""
                    }`}
                  >
                    <span
                      className={`absolute h-full w-full rounded-full ${
                        exp.current
                          ? "animate-pulse-dot bg-mint"
                          : "bg-indigo"
                      }`}
                    />
                    <span
                      className={`relative h-[8px] w-[8px] rounded-full ${
                        exp.current ? "bg-mint" : "bg-indigo-soft"
                      }`}
                    />
                  </span>

                  {/* card */}
                  <div
                    className={`md:flex md:items-center ${
                      left ? "md:col-span-1 md:pr-12" : "md:col-start-2 md:pl-12"
                    }`}
                  >
                    <article
                      className={`glass card-hover glow-border w-full rounded-2xl p-6 ${
                        left ? "md:text-right" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 ${
                          left ? "md:justify-end" : ""
                        }`}
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo/15 text-indigo-soft">
                          <Compass className="h-4 w-4" />
                        </span>
                        <p className="font-mono text-xs tracking-wider text-mint">
                          {exp.start_date} — {exp.current ? "Present" : exp.end_date}
                        </p>
                      </div>
                      <h3 className="font-display mt-3 text-xl font-bold text-starlight">
                        {exp.role}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-indigo-soft">{exp.company}</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {exp.description}
                      </p>
                      {exp.current ? (
                        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/[0.07] px-3 py-1 font-mono text-[10px] text-mint">
                          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
                          still going
                        </span>
                      ) : null}
                    </article>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
