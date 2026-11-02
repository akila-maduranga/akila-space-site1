"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Camera,
  FolderGit2,
  Gauge,
  Home,
  LogOut,
  Orbit,
  PenLine,
  ShieldCheck,
  UserRound,
  Wrench,
  Briefcase,
  KeyRound,
  LayoutList,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/lib/site-context";
import OverviewTab from "./tabs/OverviewTab";
import ProfileTab from "./tabs/ProfileTab";
import ProjectsTab from "./tabs/ProjectsTab";
import LinksTab from "./tabs/LinksTab";
import PhotosTab from "./tabs/PhotosTab";
import SkillsTab from "./tabs/SkillsTab";
import ExperienceTab from "./tabs/ExperienceTab";
import BlogTab from "./tabs/BlogTab";
import PagesTab from "./tabs/PagesTab";

const TABS = [
  { id: "overview", label: "Mission Control", icon: Gauge },
  { id: "pages", label: "Pages", icon: LayoutList },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "blog", label: "Blog", icon: PenLine },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "photos", label: "Photography", icon: Camera },
  { id: "links", label: "Social Links", icon: BarChart3 },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "experience", label: "Journey", icon: Briefcase },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        sessionStorage.setItem("cosmosfolio_admin_token", data.token);
        toast({ title: "Access granted", description: "Welcome back, commander." });
        onLogin();
      } else {
        setError(data.error || "Access denied");
      }
    } catch {
      setError("Connection to mission control failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glow-border glass-strong w-full max-w-md rounded-3xl p-8"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-[#2a1470] shadow-[0_0_44px_rgba(99,49,251,0.65)]"
          >
            <Orbit className="h-8 w-8 text-mint" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-starlight">Mission Control</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            restricted sector · authorization required
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="font-mono text-xs text-mint">
              <KeyRound className="mr-1.5 inline h-3.5 w-3.5" />
              ACCESS CODE
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="border-indigo/30 bg-onyx/60 font-mono tracking-widest"
            />
            {error ? (
              <p className="font-mono text-xs text-[#ff5d7a]" role="alert">
                ✗ {error}
              </p>
            ) : (
              <p className="font-mono text-[11px] text-muted-foreground/70">
                default code: admin123 — change ADMIN_PASSWORD in your env
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={busy || !password}
            className="w-full bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_36px_-8px_rgba(99,49,251,0.8)] hover:shadow-[0_10px_44px_-6px_rgba(136,249,192,0.4)]"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {busy ? "Verifying..." : "Authorize"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return Boolean(sessionStorage.getItem("cosmosfolio_admin_token"));
  });
  const [tab, setTab] = useState<TabId>("overview");
  const { profile, mode } = useSite();

  const logout = useCallback(() => {
    sessionStorage.removeItem("cosmosfolio_admin_token");
    setAuthed(false);
  }, []);

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="glass-strong sticky top-0 z-40 border-b border-indigo/15">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo to-[#2a1470] shadow-[0_0_24px_rgba(99,49,251,0.55)]">
              <Orbit className="h-5 w-5 text-mint" />
            </span>
            <div className="hidden sm:block">
              <p className="font-display text-sm font-bold text-starlight">Mission Control</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {profile.name} · {mode === "supabase" ? "supabase connected" : "local demo mode"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-mint/35 bg-mint/[0.05] px-3 font-mono text-xs text-mint transition-colors hover:bg-mint/10 hover:text-mint-soft"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </a>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-indigo/25 font-mono text-xs text-muted-foreground hover:border-[#ff5d7a]/50 hover:text-[#ff5d7a]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* sidebar nav */}
        <nav className="glass rounded-2xl p-2 lg:w-60 lg:shrink-0" aria-label="Admin sections">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <li key={t.id} className="shrink-0 lg:shrink">
                  <button
                    onClick={() => setTab(t.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-mono text-xs transition-all ${
                      active
                        ? "bg-gradient-to-r from-indigo/25 to-mint/10 text-mint shadow-[inset_0_0_0_1px_rgba(136,249,192,0.25)]"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-starlight"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.label}
                    {active ? <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-mint lg:block" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* content */}
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "overview" ? <OverviewTab /> : null}
              {tab === "pages" ? <PagesTab /> : null}
              {tab === "profile" ? <ProfileTab /> : null}
              {tab === "blog" ? <BlogTab /> : null}
              {tab === "projects" ? <ProjectsTab /> : null}
              {tab === "photos" ? <PhotosTab /> : null}
              {tab === "links" ? <LinksTab /> : null}
              {tab === "skills" ? <SkillsTab /> : null}
              {tab === "experience" ? <ExperienceTab /> : null}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
