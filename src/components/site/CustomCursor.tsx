"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle space-themed cursor: a glowing indigo dot with a trailing mint ring.
 * Only activates on devices with a fine pointer and no reduced-motion pref.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let hovering = false;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      const target = e.target as HTMLElement | null;
      hovering = Boolean(
        target?.closest("a, button, [role='button'], input, textarea, select, [data-cursor]")
      );
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      const scale = hovering ? 1.9 : 1;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${scale})`;
      ring.style.borderColor = hovering
        ? "rgba(136, 249, 192, 0.8)"
        : "rgba(136, 249, 192, 0.35)";
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div
        ref={ringRef}
        className="absolute h-8 w-8 rounded-full border transition-[border-color] duration-200 will-change-transform"
        style={{ opacity: 0, borderColor: "rgba(136,249,192,0.35)" }}
      />
      <div
        ref={dotRef}
        className="absolute h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_2px_rgba(136,249,192,0.7)] will-change-transform"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
