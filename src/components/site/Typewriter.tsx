"use client";

import { useEffect, useState } from "react";

type Phase = "typing" | "holding" | "deleting";

interface TyperState {
  wordIndex: number;
  text: string;
  phase: Phase;
}

export default function Typewriter({ words }: { words: string[] }) {
  const [state, setState] = useState<TyperState>({
    wordIndex: 0,
    text: "",
    phase: "typing",
  });

  useEffect(() => {
    if (!words.length) return;
    const current = words[state.wordIndex % words.length];
    const { phase, text } = state;

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(
          () => setState((s) => ({ ...s, text: current.slice(0, s.text.length + 1) })),
          70
        );
      } else {
        timeout = setTimeout(() => setState((s) => ({ ...s, phase: "holding" })), 1400);
      }
    } else if (phase === "holding") {
      timeout = setTimeout(() => setState((s) => ({ ...s, phase: "deleting" })), 900);
    } else {
      if (text.length > 0) {
        timeout = setTimeout(
          () => setState((s) => ({ ...s, text: current.slice(0, s.text.length - 1) })),
          38
        );
      } else {
        timeout = setTimeout(
          () =>
            setState((s) => ({
              wordIndex: (s.wordIndex + 1) % words.length,
              text: "",
              phase: "typing",
            })),
          250
        );
      }
    }
    return () => clearTimeout(timeout);
  }, [state, words]);

  return (
    <span className="gradient-text font-display font-bold">
      {state.text || "\u00A0"}
      <span className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.08em] animate-blink bg-mint shadow-[0_0_12px_rgba(136,249,192,0.9)]" />
    </span>
  );
}
