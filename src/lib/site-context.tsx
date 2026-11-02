"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getStore } from "./store";
import {
  SEED_EXPERIENCES,
  SEED_FACTS,
  SEED_PAGES,
  SEED_PHOTOS,
  SEED_POSTS,
  SEED_PROFILE,
  SEED_PROJECTS,
  SEED_SKILLS,
  SEED_SOCIAL_LINKS,
  SEED_TERMINAL_LINES,
} from "./seed";
import type {
  BlogPost,
  Experience,
  Fact,
  PageSection,
  Photo,
  Profile,
  Project,
  Skill,
  SocialLink,
  TerminalLine,
} from "./types";

interface SiteStats {
  yearsExperience: number;
  projectCount: number;
  linkCount: number;
  photoCount: number;
  postCount: number;
}

interface SiteContextValue {
  loading: boolean;
  mode: "local" | "supabase";
  /**
   * Set when a Supabase read failed — the site (and the admin dashboard)
   * are then showing the BUILT-IN demo content, not database content.
   * Without this, a broken database looks like "nothing I edit ever
   * changes" instead of an actionable error.
   */
  readError: string | null;
  profile: Profile;
  projects: Project[];
  socialLinks: SocialLink[];
  skills: Skill[];
  experiences: Experience[];
  photos: Photo[];
  posts: BlogPost[];
  pages: PageSection[];
  /** About-page badges ("currently into", "cameras owned", ...) */
  facts: Fact[];
  /** Hero terminal window lines ("$ whoami" → output) */
  terminalLines: TerminalLine[];
  stats: SiteStats;
  refresh: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(SEED_PROFILE);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(SEED_SOCIAL_LINKS);
  const [skills, setSkills] = useState<Skill[]>(SEED_SKILLS);
  const [experiences, setExperiences] = useState<Experience[]>(SEED_EXPERIENCES);
  const [photos, setPhotos] = useState<Photo[]>(SEED_PHOTOS);
  const [posts, setPosts] = useState<BlogPost[]>(SEED_POSTS);
  const [pages, setPages] = useState<PageSection[]>(SEED_PAGES);
  const [facts, setFacts] = useState<Fact[]>(SEED_FACTS);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>(SEED_TERMINAL_LINES);
  const visitDone = useRef(false);

  const store = useMemo(() => getStore(), []);

  const refresh = useCallback(async () => {
    try {
      const [p, proj, links, sk, exp, ph, po, pg, fa, tl] = await Promise.all([
        store.getProfile(),
        store.getProjects(),
        store.getSocialLinks(),
        store.getSkills(),
        store.getExperiences(),
        store.getPhotos(),
        store.getPosts(),
        store.getPages(),
        store.getFacts(),
        store.getTerminalLines(),
      ]);
      setProfile(p);
      setProjects(proj);
      setSocialLinks(links);
      setSkills(sk);
      setExperiences(exp);
      setPhotos(ph);
      setPosts(po);
      setPages(pg);
      setFacts(fa);
      setTerminalLines(tl);
      setReadError(null);
    } catch (err) {
      console.error("Failed to load site data:", err);
      // Keep the previous (or seed) content so the site stays presentable,
      // but remember WHY — the admin dashboard shows this to the owner.
      setReadError(
        err instanceof Error
          ? err.message
          : "Could not read content from the database"
      );
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Track the visit once per browser session — silently, after the app is
  // interactive. Never tracked on the admin dashboard (that would just
  // pollute the numbers with my own page loads).
  useEffect(() => {
    if (visitDone.current) return;
    visitDone.current = true;
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return;
    const t = setTimeout(() => {
      store.trackVisit().catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [store]);

  // Keep the document title in sync with the current page and the editable
  // profile — but never on the admin dashboard, which keeps its own
  // unassuming "Admin" title. With the multi-page layout each route gets
  // its own title: "Projects · Akila Maduranga", "About · ..." etc.
  const pathname = usePathname();
  useEffect(() => {
    if (typeof document === "undefined" || !profile?.name) return;
    if (pathname.startsWith("/admin")) {
      document.title = "Admin — mission control";
      return;
    }
    const segment = pathname.split("/").filter(Boolean)[0];
    if (!segment) {
      document.title = `${profile.name} — ${profile.title || "Portfolio"}`;
      return;
    }
    const page = pages.find((p) => p.key === segment);
    const label = page?.label ?? segment;
    document.title = `${label} · ${profile.name}`;
  }, [profile?.name, profile?.title, pathname, pages]);

  const value: SiteContextValue = {
    loading,
    mode: store.mode,
    readError,
    profile,
    projects,
    socialLinks,
    skills,
    experiences,
    photos,
    posts,
    pages,
    facts,
    terminalLines,
    stats: {
      yearsExperience: profile.years_experience,
      projectCount: projects.filter((p) => p.visible !== false).length,
      linkCount: socialLinks.filter((l) => l.visible !== false).length,
      photoCount: photos.filter((p) => p.visible !== false).length,
      postCount: posts.filter((p) => p.visible !== false).length,
    },
    refresh,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
