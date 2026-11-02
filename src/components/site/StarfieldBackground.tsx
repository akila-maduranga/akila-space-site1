"use client";

import { useEffect, useRef } from "react";
import VantaBackground from "./VantaBackground";

type Star = {
  x: number;
  y: number;
  size: number;
  layer: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: 0 | 1 | 2; // 0 white, 1 mint, 2 indigo
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
};

/** hue index -> rgb triplet used for both sprite baking and streaks */
const HUE_RGB: readonly [number, number, number][] = [
  [232, 230, 245], // starlight white
  [136, 249, 192], // mint
  [139, 107, 255], // indigo soft
];

const TARGET_FRAME_MS = 33; // ~30fps — plenty for slow twinkles, half the cost
const DPR_CAP = 1.5; // background only; text is unaffected and stays crisp

/**
 * Bake a radial-gradient sprite per hue once, then blit it with drawImage()
 * for every star. drawImage is GPU-friendly and skips the per-star
 * beginPath/arc/fill + fillStyle churn of the naive loop (which meant
 * ~340 state changes per frame). The glow is baked into the sprite too,
 * so the old second "glow pass" disappears entirely.
 */
function bakeSprites(): HTMLCanvasElement[] {
  const SIZE = 64; // generous resolution so glows stay smooth when scaled
  return HUE_RGB.map(([r, g, b]) => {
    const c = document.createElement("canvas");
    c.width = SIZE;
    c.height = SIZE;
    const cx = SIZE / 2;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    // hot core, short shoulder, long faint halo — one sprite does core+glow
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.18, `rgba(${r},${g},${b},0.85)`);
    grad.addColorStop(0.38, `rgba(${r},${g},${b},0.28)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
    return c;
  });
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let stars: Star[] = [];
    let shooting: ShootingStar[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let lastFrame = 0;
    let nextShootingAt = performance.now() + 2500;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const sprites = bakeSprites();

    const buildStars = () => {
      const count = Math.min(Math.floor((width * height) / 8000), 280);
      stars = Array.from({ length: count }, () => {
        const layer = Math.floor(Math.random() * 3);
        const hueRoll = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: layer === 2 ? Math.random() * 1.6 + 0.8 : Math.random() * 1.1 + 0.3,
          layer,
          baseAlpha: layer === 2 ? 0.85 : 0.5,
          twinkleSpeed: 0.4 + Math.random() * 1.4,
          twinklePhase: Math.random() * Math.PI * 2,
          hue: hueRoll > 0.92 ? 1 : hueRoll > 0.84 ? 2 : 0,
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    };

    // debounce rebuilds while the window is being dragged around
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };

    // store raw coords; normalized in the draw loop instead of per event
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const draw = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);

      // frame cap — skip work (but keep the rAF chain alive)
      if (t - lastFrame < TARGET_FRAME_MS) return;
      const dt = Math.min(t - lastFrame, 64); // clamped delta, ms
      lastFrame = t;
      const step = dt / 16.67; // 1 == one 60fps frame

      ctx.clearRect(0, 0, width, height);

      // ease parallax toward target (dt-scaled so speed is fps-independent)
      const tx = (mouseX / width - 0.5) * 2;
      const ty = (mouseY / height - 0.5) * 2;
      parallaxX += (tx - parallaxX) * Math.min(0.03 * step, 1);
      parallaxY += (ty - parallaxY) * Math.min(0.03 * step, 1);

      // sprite blit per star — glow included, zero path ops
      for (const s of stars) {
        const depth = (s.layer + 1) / 3; // 0.33 .. 1
        const px = s.x + parallaxX * depth * 14;
        const py = s.y + parallaxY * depth * 14;

        let alpha = s.baseAlpha;
        if (!reduced) {
          alpha =
            s.baseAlpha *
            (0.55 + 0.45 * Math.sin(t * 0.001 * s.twinkleSpeed + s.twinklePhase));
        }

        // bright top-layer stars draw their glow, the rest just the core
        const glow = s.layer === 2 && s.size > 1.4;
        const r = glow ? s.size * 3.2 : s.size * 2.6;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(sprites[s.hue], px - r, py - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      // shooting stars
      if (!reduced) {
        if (t > nextShootingAt) {
          nextShootingAt = t + 3500 + Math.random() * 6000;
          const fromLeft = Math.random() > 0.5;
          const sx = fromLeft ? Math.random() * width * 0.4 : width * (0.6 + Math.random() * 0.4);
          const sy = Math.random() * height * 0.35;
          const speed = 7 + Math.random() * 5;
          const angle = (Math.PI / 180) * (fromLeft ? 18 + Math.random() * 14 : 160 + Math.random() * 14);
          shooting.push({
            x: sx,
            y: sy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 60 + Math.random() * 30,
            len: 90 + Math.random() * 90,
          });
        }

        shooting = shooting.filter(
          (sh) => sh.life < sh.maxLife && sh.x > -200 && sh.x < width + 200
        );
        for (const sh of shooting) {
          sh.x += sh.vx * step;
          sh.y += sh.vy * step;
          sh.life += step;
          const fade = Math.sin((sh.life / sh.maxLife) * Math.PI);
          const tailX = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * sh.len;
          const tailY = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * sh.len;
          const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
          grad.addColorStop(0, `rgba(182, 255, 217, ${0.85 * fade})`);
          grad.addColorStop(0.35, `rgba(136, 249, 192, ${0.4 * fade})`);
          grad.addColorStop(1, "rgba(99, 49, 251, 0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sh.x, sh.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(230, 255, 240, ${0.9 * fade})`;
          ctx.fill();
        }
      }
    };

    // stop burning cycles when the tab is hidden (some browsers keep rAF warm)
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        lastFrame = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-onyx">
      {/* deep space gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,49,251,0.22),transparent_60%),radial-gradient(ellipse_80%_60%_at_80%_110%,rgba(136,249,192,0.07),transparent_55%)]" />

      {/* Vanta.js animated network — the living base layer */}
      <VantaBackground />

      {/* nebula blobs */}
      <div className="absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(99,49,251,0.28),transparent_65%)] blur-3xl animate-drift" />
      <div className="absolute top-1/3 -right-48 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(136,249,192,0.12),transparent_65%)] blur-3xl animate-drift-2" />
      <div className="absolute bottom-[-12rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(99,49,251,0.16),transparent_65%)] blur-3xl animate-drift" />

      {/* tech grid overlay — softened a touch for readability */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* twinkling accent dots */}
      <div className="absolute inset-0 bg-dots opacity-20" />

      {/* star canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* vignette + noise */}
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/*
        The readability veil — kept INSIDE the background stack so it can't
        be forgotten when the background is mounted. z-index -5 paints it
        above everything here (the stack root is -10) but below all real
        page content, dimming the animation just enough to read comfortably
        while keeping it alive behind the text. Try removing it and the
        paragraph text over the network lines gets noticeably harder.
      */}
      <div className="readability-veil" />
    </div>
  );
}
