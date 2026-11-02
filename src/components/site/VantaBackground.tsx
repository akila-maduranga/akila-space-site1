"use client";

import { useEffect, useRef } from "react";

/**
 * Animated background layer powered by Vanta.js (https://www.vantajs.com/).
 *
 * Runs the NET effect — a slowly drifting constellation of points joined by
 * connecting lines, in the site palette: Electric Indigo `#6331FB` glowing
 * over Onyx Black `#01010D`. It gently follows the mouse, so the whole page
 * feels alive without shouting for attention. The layer sits *beneath* the
 * custom starfield (twinkling stars, shooting stars, nebulae), combining
 * into one deep-space atmosphere.
 *
 * Want a different effect? Import another bundle from vanta/dist —
 * `vanta.globe.min` (wireframe planet), `vanta.waves.min`, `vanta.rings.min`,
 * `vanta.dots.min`, `vanta.topology.min` — and adjust the options below;
 * the wiring stays identical. three.js r134 is pinned to match what
 * vantajs.com itself runs.
 */
export default function VantaBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    // respect visitors who ask the OS for less motion — the static nebula
    // and star layers remain, only the WebGL animation is skipped
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    (async () => {
      try {
        // dynamic imports keep three.js out of the first paint bundle
        const [THREE, vantaModule] = await Promise.all([
          import("three"),
          import("vanta/dist/vanta.net.min"),
        ]);
        const NET = vantaModule.default;
        if (cancelled || !hostRef.current) return;

        effectRef.current = NET({
          el: hostRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          // site palette — Electric Indigo lines & dots on Onyx Black
          color: 0x6331fb,
          backgroundColor: 0x01010d,
          // tuned to stay calm: a sparse net with short connect distances
          points: 14,
          maxDistance: 22,
          spacing: 17,
          showDots: true,
        });
      } catch (err) {
        // WebGL unavailable or blocked — the CSS space layers still carry the look
        console.warn("Vanta background unavailable:", err);
      }
    })();

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0" />;
}
