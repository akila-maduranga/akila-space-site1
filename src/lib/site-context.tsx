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
import { getStore } from "./store";
import {
  SEED_EXPERIENCES,
  SEED_PAGES,
  SEED_PHOTOS,
  SEED_POSTS,
  SEED_PROFILE,
  SEED_PROJECTS,
  SEED_SKILLS,
  SEED_SOCIAL_LINKS,
} from "./seed";
import type {
  BlogPost,
  Experience,
  PageSection,
  Photo,
  Profile,
  Project,
  Skill,
  SocialLink,
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
  const visitDone = useRef(false);

  const store = useMemo(() => getStore(), []);

  const refresh = useCallback(async () => {
    try {
      const [p, proj, links, sk, exp, ph, po, pg] = await Promise.all([
        store.getProfile(),
        store.getProjects(),
        store.getSocialLinks(),
        store.getSkills(),
        store.getExperiences(),
        store.getPhotos(),
        store.getPosts(),
        store.getPages(),
      ]);
      setProfile(p);
      setProjects(proj);
      setSocialLinks(links);
      setSkills(sk);
      setExperiences(exp);
      setPhotos(ph);
      setPosts(po);
      setPages(pg);
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

  // Keep the document title in sync with the editable profile — but never on
  // the admin dashboard, which keeps its own unassuming "Admin" title.
  useEffect(() => {
    if (typeof document !== "undefined" && profile?.name) {
      if (window.location.pathname.startsWith("/admin")) return;
      document.title = `${profile.name} — ${profile.title || "Portfolio"}`;
    }
  }, [profile?.name, profile?.title]);

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
