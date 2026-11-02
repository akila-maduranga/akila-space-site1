"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket } from "lucide-react";
import type { PageSection } from "@/lib/types";
import { routeForKey } from "@/lib/routes";

const NAV_FALLBACK = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/connect", label: "Connect" },
];

export default function Navbar({ name, pages }: { name: string; pages: PageSection[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = pages.length
    ? pages
        .filter((p) => p.visible !== false)
        .map((p) => ({
          href: routeForKey(p.key) ?? `/${p.key}`,
          label: p.label,
        }))
    : NAV_FALLBACK;

  // close the mobile menu whenever a navigation lands somewhere new
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-[0_8px_40px_-12px_rgba(99,49,251,0.35)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="Back to home">
          <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo to-indigo/60 font-display text-sm font-bold text-white shadow-[0_0_18px_rgba(99,49,251,0.5)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            {initials || "AM"}
            <span className="absolute inset-0 bg-gradient-to-t from-mint/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </span>
          <span className="font-display hidden text-sm font-semibold tracking-wide text-starlight sm:block">
            {name}
            <span className="text-mint">.space</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navItems.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`link-underline font-mono text-[13px] tracking-wide transition-colors ${
                  isActive(item.href)
                    ? "text-mint"
                    : "text-muted-foreground hover:text-starlight"
                }`}
              >
                <span className="mr-1.5 text-indigo-soft/70">0{i + 1}.</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {navItems.some((n) => n.href === "/projects") ? (
            <Link
              href="/projects"
              className="mint-glow-btn hidden items-center gap-2 rounded-full bg-gradient-to-r from-indigo to-indigo/80 px-4 py-2 font-mono text-xs font-medium text-white transition sm:flex"
            >
              <Rocket className="h-3.5 w-3.5" />
              my work
            </Link>
          ) : null}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="grid h-9 w-9 place-items-center rounded-full border border-indigo/25 text-muted-foreground md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              {mobileOpen ? (
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {mobileOpen ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-strong overflow-hidden border-t border-indigo/15 md:hidden"
        >
          <ul className="space-y-1 px-6 py-4">
            {navItems.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-colors hover:bg-indigo/10 hover:text-mint ${
                    isActive(item.href) ? "text-mint" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-indigo-soft/70">0{i + 1}.</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}
    </motion.header>
  );
}
