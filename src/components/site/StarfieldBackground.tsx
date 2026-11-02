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
  hue: "white" | "mint" | "indigo";
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

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let stars: Star[] = [];
    let shooting: ShootingStar[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let nextShootingAt = performance.now() + 2500;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const buildStars = () => {
      const count = Math.min(Math.floor((width * height) / 6500), 340);
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
          hue: hueRoll > 0.92 ? "mint" : hueRoll > 0.84 ? "indigo" : "white",
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

    const onMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width - 0.5) * 2;
      mouseY = (e.clientY / height - 0.5) * 2;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // ease parallax toward target
      parallaxX += (mouseX - parallaxX) * 0.03;
      parallaxY += (mouseY - parallaxY) * 0.03;

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

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        if (s.hue === "mint") ctx.fillStyle = `rgba(136, 249, 192, ${alpha})`;
        else if (s.hue === "indigo") ctx.fillStyle = `rgba(139, 107, 255, ${alpha})`;
        else ctx.fillStyle = `rgba(232, 230, 245, ${alpha})`;
        ctx.fill();

        // glow for bright layer
        if (s.layer === 2 && s.size > 1.4) {
          ctx.beginPath();
          ctx.arc(px, py, s.size * 3, 0, Math.PI * 2);
          ctx.fillStyle =
            s.hue === "mint"
              ? `rgba(136, 249, 192, ${alpha * 0.08})`
              : `rgba(139, 107, 255, ${alpha * 0.1})`;
          ctx.fill();
        }
      }

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

        shooting = shooting.filter((sh) => sh.life < sh.maxLife && sh.x > -200 && sh.x < width + 200);
        for (const sh of shooting) {
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.life += 1;
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

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
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

      {/* tech grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* twinkling accent dots */}
      <div className="absolute inset-0 bg-dots opacity-30" />

      {/* star canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* vignette + noise */}
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
    </div>
  );
}
