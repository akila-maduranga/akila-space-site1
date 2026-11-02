"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10 md:mb-14"
    >
      <p className="font-mono text-sm text-mint/80 tracking-wider">
        <span className="text-indigo-soft">{"//"}</span> {index}
        <span className="terminal-caret" />
      </p>
      <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-starlight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      ) : null}
      <div className="mt-5 h-[3px] w-24 rounded-full bg-gradient-to-r from-indigo to-mint shadow-[0_0_16px_rgba(99,49,251,0.6)]" />
    </motion.div>
  );
}
