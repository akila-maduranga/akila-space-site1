"use client";

import { getSupabaseClient } from "../supabase";
import { getCountry } from "../geo";
import { SEED_FACTS, SEED_TERMINAL_LINES } from "../seed";
import type {
  Analytics,
  BlogPost,
  DataStore,
  Experience,
  Fact,
  PageSection,
  Photo,
  Profile,
  Project,
  Skill,
  SocialLink,
  TerminalLine,
} from "../types";

function detectDevice(): string {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "cosmosfolio_visitor_id";
  let vid = window.localStorage.getItem(KEY);
  if (!vid) {
    vid = uid();
    try {
      window.localStorage.setItem(KEY, vid);
    } catch {
      /* ignore */
    }
  }
  return vid;
}

function getReferrer(): string {
  if (typeof document === "undefined" || !document.referrer) return "direct";
  try {
    return new URL(document.referrer).hostname || "direct";
  } catch {
    return "direct";
  }
}

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("cosmosfolio_admin_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(path, { ...options, headers });
}

/**
 * Supabase-backed store.
 * - Public reads & tracking go through the anon client + RLS policies / RPCs.
 * - Admin writes & analytics go through Next.js API routes using the
 *   service-role key (server-side only, never exposed to the browser).
 */
export class SupabaseStore implements DataStore {
  mode = "supabase" as const;

  async getProfile(): Promise<Profile> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb.from("profile").select("*").limit(1);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Profile not found — run supabase/schema.sql");
    return {
      ...data[0],
      roles: Array.isArray(data[0].roles) ? data[0].roles : String(data[0].roles || "").split(",").filter(Boolean),
    } as Profile;
  }

  async getProjects(): Promise<Project[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []).map((p) => ({
      ...p,
      tech: Array.isArray(p.tech) ? p.tech : String(p.tech || "").split(",").filter(Boolean),
    })) as Project[];
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("social_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as SocialLink[];
  }

  async getSkills(): Promise<Skill[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as Skill[];
  }

  async getExperiences(): Promise<Experience[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as Experience[];
  }

  async getPhotos(): Promise<Photo[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("photos")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as Photo[];
  }

  async getPosts(): Promise<BlogPost[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb.from("posts").select("*");
    if (error) throw error;
    return (data || [])
      .map((p) => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : String(p.tags || "").split(",").filter(Boolean),
      }))
      .sort((a: { published_at?: string }, b: { published_at?: string }) =>
        (b.published_at || "").localeCompare(a.published_at || "")
      ) as BlogPost[];
  }

  async getPages(): Promise<PageSection[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("page_sections")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as PageSection[];
  }

  async getFacts(): Promise<Fact[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("facts")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      // Pre-v2.3 database: the facts table hasn't been created yet.
      // Fall back to the built-in badges instead of failing the whole
      // read (which would knock the site back to demo content).
      if (/PGRST205|does not exist|Could not find the table/i.test(error.message)) {
        return SEED_FACTS;
      }
      throw error;
    }
    return (data || []) as Fact[];
  }

  async getTerminalLines(): Promise<TerminalLine[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("terminal_lines")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      // same upgrade path as facts — table added in v2.4 of the schema
      if (/PGRST205|does not exist|Could not find the table/i.test(error.message)) {
        return SEED_TERMINAL_LINES;
      }
      throw error;
    }
    return (data || []) as TerminalLine[];
  }

  async trackVisit(): Promise<void> {
    const sb = getSupabaseClient();
    if (!sb) return;
    const [country] = await Promise.all([getCountry()]);
    await sb.rpc("track_visit", {
      p_visitor_id: getVisitorId(),
      p_referrer: getReferrer(),
      p_device: detectDevice(),
      p_country: country,
    });
  }

  async trackLinkClick(link: SocialLink): Promise<void> {
    const sb = getSupabaseClient();
    if (!sb) return;
    const country = await getCountry();
    await sb.rpc("track_link_click", {
      p_link_id: link.id,
      p_platform: link.platform,
      p_visitor_id: getVisitorId(),
      p_country: country,
    });
  }

  private async mutate(action: string, payload: unknown): Promise<void> {
    const res = await adminFetch("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({ action, payload }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
  }

  async saveProfile(profile: Profile): Promise<void> {
    await this.mutate("save_profile", profile);
  }

  async saveProject(project: Project): Promise<void> {
    await this.mutate("save_project", { ...project, tech: project.tech });
  }

  async deleteProject(id: string): Promise<void> {
    await this.mutate("delete_project", { id });
  }

  async saveSocialLink(link: SocialLink): Promise<void> {
    await this.mutate("save_link", link);
  }

  async deleteSocialLink(id: string): Promise<void> {
    await this.mutate("delete_link", { id });
  }

  async saveSkill(skill: Skill): Promise<void> {
    await this.mutate("save_skill", skill);
  }

  async deleteSkill(id: string): Promise<void> {
    await this.mutate("delete_skill", { id });
  }

  async saveExperience(experience: Experience): Promise<void> {
    await this.mutate("save_experience", experience);
  }

  async deleteExperience(id: string): Promise<void> {
    await this.mutate("delete_experience", { id });
  }

  async savePhoto(photo: Photo): Promise<void> {
    await this.mutate("save_photo", photo);
  }

  async deletePhoto(id: string): Promise<void> {
    await this.mutate("delete_photo", { id });
  }

  async savePost(post: BlogPost): Promise<void> {
    await this.mutate("save_post", { ...post, tags: post.tags });
  }

  async deletePost(id: string): Promise<void> {
    await this.mutate("delete_post", { id });
  }

  async savePage(page: PageSection): Promise<void> {
    await this.mutate("save_page", page);
  }

  async saveFact(fact: Fact): Promise<void> {
    await this.mutate("save_fact", fact);
  }

  async deleteFact(id: string): Promise<void> {
    await this.mutate("delete_fact", { id });
  }

  async saveTerminalLine(line: TerminalLine): Promise<void> {
    await this.mutate("save_terminal_line", line);
  }

  async deleteTerminalLine(id: string): Promise<void> {
    await this.mutate("delete_terminal_line", { id });
  }

  async getAnalytics(): Promise<Analytics> {
    const res = await adminFetch("/api/admin/analytics", { method: "GET" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return (await res.json()) as Analytics;
  }

  async resetData(): Promise<void> {
    await this.mutate("reset_data", {});
  }
}
