"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import StarfieldBackground from "./StarfieldBackground";
import CustomCursor from "./CustomCursor";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * The persistent site shell — everything that should NOT re-mount when
 * visitors move between pages lives here:
 *
 *   - the animated background (Vanta inits once, starfield keeps its
 *     accumulated state instead of restarting on every navigation)
 *   - the readability veil (part of the background stack)
 *   - the custom cursor and the fixed navbar
 *   - the first-load boot overlay
 *
 * The page itself is rendered inside a keyed motion.div so each route
 * gets a soft entrance animation. No exit animation on purpose — the App
 * Router unmounts the old page before we could animate it out, and a
 * one-sided fade feels just as polished without fighting the router.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const { loading, profile, pages } = useSite();
  const pathname = usePathname();

  return (
    // NOTE: no background color here on purpose — an opaque bg on this
    // wrapper would paint OVER the fixed -z-10 starfield/Vanta layers
    // (non-positioned block backgrounds paint above negative z-index
    // elements), leaving the whole animated background invisible.
    // The base color comes from the body style in globals.css.
    <div className="relative flex min-h-screen flex-col">
      <StarfieldBackground />
      <CustomCursor />

      <AnimatePresence>
        {loading ? (
          <motion.div
            key="boot"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-onyx"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 animate-spin-slower rounded-full border-2 border-dashed border-indigo/40" />
                <div className="absolute inset-3 grid place-items-center rounded-full bg-gradient-to-br from-indigo to-[#2a1470] font-display text-xl font-bold text-white shadow-[0_0_40px_rgba(99,49,251,0.6)]">
                  {profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
              </div>
              <p className="font-mono text-xs tracking-[0.3em] text-mint/80">
                one sec — warming things up
                <span className="animate-blink">...</span>
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Navbar name={profile.name} pages={pages} />

      <main className="flex-1">
        {/* keyed by pathname — replays the entrance on every navigation */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <Footer profile={profile} />
    </div>
  );
}
