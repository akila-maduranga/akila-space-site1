"use client";

import { getCountry } from "../geo";
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
} from "../seed";

/**
 * Local demo store — keeps everything in the browser's localStorage.
 * Perfect for previewing the site and playing with the admin dashboard
 * before Supabase is connected.
 */

const CONTENT_KEY = "cosmosfolio_content_v2";
const ANALYTICS_KEY = "cosmosfolio_analytics_v1";
const VISITOR_KEY = "cosmosfolio_visitor_id";

interface Content {
  profile: Profile;
  projects: Project[];
  socialLinks: SocialLink[];
  skills: Skill[];
  experiences: Experience[];
  photos: Photo[];
  posts: BlogPost[];
  pages: PageSection[];
  facts: Fact[];
  terminalLines: TerminalLine[];
}

interface PageviewRow {
  viewed_at: string;
  visitor_id: string;
}

interface ClickRow {
  id: string;
  link_id: string;
  platform: string;
  clicked_at: string;
  visitor_id: string;
  country?: string;
}

interface VisitRow {
  visitor_id: string;
  first_seen: string;
  last_seen: string;
  page_views: number;
  referrer: string;
  device: string;
  country?: string;
}

interface AnalyticsData {
  visitors: VisitRow[];
  pageviews: PageviewRow[];
  link_clicks: ClickRow[];
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode — ignore */
  }
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let vid = window.localStorage.getItem(VISITOR_KEY);
  if (!vid) {
    vid = uid();
    try {
      window.localStorage.setItem(VISITOR_KEY, vid);
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

/** Seed some plausible demo analytics so charts are not empty on first run. */
function seedAnalytics(): AnalyticsData {
  const visitors: VisitRow[] = [];
  const pageviews: PageviewRow[] = [];
  const link_clicks: ClickRow[] = [];
  const platforms = ["github", "linkedin", "instagram", "x", "youtube", "whatsapp"];
  const referrers = ["direct", "google.com", "linkedin.com", "x.com", "news.ycombinator.com"];
  const devices = ["desktop", "mobile", "mobile", "desktop", "tablet"];
  let seed = 42;
  const rand = () => {
    // deterministic pseudo-random so the demo looks stable
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let d = 29; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    const visitorsToday = 1 + Math.floor(rand() * 4);
    for (let v = 0; v < visitorsToday; v++) {
      const vid = `seed-${d}-${v}`;
      const first = new Date(day);
      first.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60));
      visitors.push({
        visitor_id: vid,
        first_seen: first.toISOString(),
        last_seen: first.toISOString(),
        page_views: 1 + Math.floor(rand() * 3),
        referrer: referrers[Math.floor(rand() * referrers.length)],
        device: devices[Math.floor(rand() * devices.length)],
      });
      const views = 1 + Math.floor(rand() * 2);
      for (let pv = 0; pv < views; pv++) {
        pageviews.push({ viewed_at: first.toISOString(), visitor_id: vid });
      }
      if (rand() > 0.55) {
        const clickedAt = new Date(first);
        clickedAt.setMinutes(clickedAt.getMinutes() + Math.floor(rand() * 20));
        link_clicks.push({
          id: uid(),
          link_id: `seed-${Math.floor(rand() * 6)}`,
          platform: platforms[Math.floor(rand() * platforms.length)],
          clicked_at: clickedAt.toISOString(),
          visitor_id: vid,
        });
      }
    }
  }
  return { visitors, pageviews, link_clicks };
}

export class LocalStore implements DataStore {
  mode = "local" as const;

  private getContent(): Content {
    const content = readJSON<Content>(CONTENT_KEY, {
      profile: SEED_PROFILE,
      projects: SEED_PROJECTS,
      socialLinks: SEED_SOCIAL_LINKS,
      skills: SEED_SKILLS,
      experiences: SEED_EXPERIENCES,
      photos: SEED_PHOTOS,
      posts: SEED_POSTS,
      pages: SEED_PAGES,
      facts: SEED_FACTS,
      terminalLines: SEED_TERMINAL_LINES,
    });

    // one-time rename: browsers that saved an older seed call the photo
    // section "photography" — flip it to "gallery" (custom labels survive)
    if (content.pages.some((p) => p.key === "photography")) {
      content.pages = content.pages
        .map((p) =>
          p.key === "photography"
            ? { ...p, key: "gallery", label: p.label === "Photography" ? "Gallery" : p.label }
            : p
        )
        .filter((p, i, arr) => arr.findIndex((q) => q.key === p.key) === i);
      writeJSON(CONTENT_KEY, content);
    }

    return content;
  }

  private setContent(next: Content) {
    writeJSON(CONTENT_KEY, next);
  }

  private getAnalyticsData(): AnalyticsData {
    return readJSON<AnalyticsData>(ANALYTICS_KEY, seedAnalytics());
  }

  async getProfile(): Promise<Profile> {
    return this.getContent().profile;
  }

  async getProjects(): Promise<Project[]> {
    return [...this.getContent().projects].sort((a, b) => a.sort_order - b.sort_order);
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return [...this.getContent().socialLinks].sort((a, b) => a.sort_order - b.sort_order);
  }

  async getSkills(): Promise<Skill[]> {
    return [...this.getContent().skills].sort((a, b) => a.sort_order - b.sort_order);
  }

  async getExperiences(): Promise<Experience[]> {
    return [...this.getContent().experiences].sort((a, b) => a.sort_order - b.sort_order);
  }

  async getPhotos(): Promise<Photo[]> {
    return [...this.getContent().photos].sort((a, b) => a.sort_order - b.sort_order);
  }

  async getPosts(): Promise<BlogPost[]> {
    return [...this.getContent().posts].sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));
  }

  async getPages(): Promise<PageSection[]> {
    return [...this.getContent().pages].sort((a, b) => a.sort_order - b.sort_order);
  }

  async getFacts(): Promise<Fact[]> {
    return [...this.getContent().facts].sort((a, b) => a.sort_order - b.sort_order);
  }

  async getTerminalLines(): Promise<TerminalLine[]> {
    return [...this.getContent().terminalLines].sort((a, b) => a.sort_order - b.sort_order);
  }

  async trackVisit(): Promise<void> {
    const [data, country] = await Promise.all([Promise.resolve(this.getAnalyticsData()), getCountry()]);
    const vid = getVisitorId();
    const now = new Date().toISOString();
    const existing = data.visitors.find((v) => v.visitor_id === vid);
    if (existing) {
      existing.last_seen = now;
      existing.page_views += 1;
      // upgrade "unknown" to a real country if we learn it later
      if (!existing.country || existing.country === "unknown") {
        existing.country = country;
      }
    } else {
      data.visitors.push({
        visitor_id: vid,
        first_seen: now,
        last_seen: now,
        page_views: 1,
        referrer: getReferrer(),
        device: detectDevice(),
        country,
      });
    }
    data.pageviews.push({ viewed_at: now, visitor_id: vid });
    writeJSON(ANALYTICS_KEY, data);
  }

  async trackLinkClick(link: SocialLink): Promise<void> {
    const country = await getCountry();
    const data = this.getAnalyticsData();
    data.link_clicks.push({
      id: uid(),
      link_id: link.id,
      platform: link.platform,
      clicked_at: new Date().toISOString(),
      visitor_id: getVisitorId(),
      country,
    });
    writeJSON(ANALYTICS_KEY, data);

    // bump the stored counter on the link itself
    const content = this.getContent();
    const target = content.socialLinks.find((l) => l.id === link.id);
    if (target) {
      target.clicks = (target.clicks || 0) + 1;
      this.setContent(content);
    }
  }

  async saveProfile(profile: Profile): Promise<void> {
    const content = this.getContent();
    content.profile = profile;
    this.setContent(content);
  }

  async saveProject(project: Project): Promise<void> {
    const content = this.getContent();
    const idx = content.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) content.projects[idx] = project;
    else content.projects.push(project);
    this.setContent(content);
  }

  async deleteProject(id: string): Promise<void> {
    const content = this.getContent();
    content.projects = content.projects.filter((p) => p.id !== id);
    this.setContent(content);
  }

  async saveSocialLink(link: SocialLink): Promise<void> {
    const content = this.getContent();
    const idx = content.socialLinks.findIndex((l) => l.id === link.id);
    if (idx >= 0) content.socialLinks[idx] = link;
    else content.socialLinks.push(link);
    this.setContent(content);
  }

  async deleteSocialLink(id: string): Promise<void> {
    const content = this.getContent();
    content.socialLinks = content.socialLinks.filter((l) => l.id !== id);
    this.setContent(content);
  }

  async saveSkill(skill: Skill): Promise<void> {
    const content = this.getContent();
    const idx = content.skills.findIndex((s) => s.id === skill.id);
    if (idx >= 0) content.skills[idx] = skill;
    else content.skills.push(skill);
    this.setContent(content);
  }

  async deleteSkill(id: string): Promise<void> {
    const content = this.getContent();
    content.skills = content.skills.filter((s) => s.id !== id);
    this.setContent(content);
  }

  async saveExperience(experience: Experience): Promise<void> {
    const content = this.getContent();
    const idx = content.experiences.findIndex((e) => e.id === experience.id);
    if (idx >= 0) content.experiences[idx] = experience;
    else content.experiences.push(experience);
    this.setContent(content);
  }

  async deleteExperience(id: string): Promise<void> {
    const content = this.getContent();
    content.experiences = content.experiences.filter((e) => e.id !== id);
    this.setContent(content);
  }

  async savePhoto(photo: Photo): Promise<void> {
    const content = this.getContent();
    const idx = content.photos.findIndex((p) => p.id === photo.id);
    if (idx >= 0) content.photos[idx] = photo;
    else content.photos.push(photo);
    this.setContent(content);
  }

  async deletePhoto(id: string): Promise<void> {
    const content = this.getContent();
    content.photos = content.photos.filter((p) => p.id !== id);
    this.setContent(content);
  }

  async savePost(post: BlogPost): Promise<void> {
    const content = this.getContent();
    const idx = content.posts.findIndex((p) => p.id === post.id);
    if (idx >= 0) content.posts[idx] = post;
    else content.posts.push(post);
    this.setContent(content);
  }

  async deletePost(id: string): Promise<void> {
    const content = this.getContent();
    content.posts = content.posts.filter((p) => p.id !== id);
    this.setContent(content);
  }

  async savePage(page: PageSection): Promise<void> {
    const content = this.getContent();
    const idx = content.pages.findIndex((p) => p.key === page.key);
    if (idx >= 0) content.pages[idx] = page;
    else content.pages.push(page);
    this.setContent(content);
  }

  async saveFact(fact: Fact): Promise<void> {
    const content = this.getContent();
    const idx = content.facts.findIndex((f) => f.id === fact.id);
    if (idx >= 0) content.facts[idx] = fact;
    else content.facts.push(fact);
    this.setContent(content);
  }

  async deleteFact(id: string): Promise<void> {
    const content = this.getContent();
    content.facts = content.facts.filter((f) => f.id !== id);
    this.setContent(content);
  }

  async saveTerminalLine(line: TerminalLine): Promise<void> {
    const content = this.getContent();
    const idx = content.terminalLines.findIndex((l) => l.id === line.id);
    if (idx >= 0) content.terminalLines[idx] = line;
    else content.terminalLines.push(line);
    this.setContent(content);
  }

  async deleteTerminalLine(id: string): Promise<void> {
    const content = this.getContent();
    content.terminalLines = content.terminalLines.filter((l) => l.id !== id);
    this.setContent(content);
  }

  async getAnalytics(): Promise<Analytics> {
    const data = this.getAnalyticsData();
    const links = await this.getSocialLinks();

    // aggregate clicks per platform (event log + stored counters)
    const platformClicks = new Map<string, number>();
    for (const c of data.link_clicks) {
      platformClicks.set(c.platform, (platformClicks.get(c.platform) || 0) + 1);
    }
    for (const l of links) {
      platformClicks.set(l.platform, (platformClicks.get(l.platform) || 0) + (l.clicks || 0));
    }
    const clicksByLink = links
      .map((l) => ({
        label: l.label,
        platform: l.platform,
        clicks: platformClicks.get(l.platform) || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    // visitors by day (last 30 days)
    const dayMap = new Map<string, { visitors: Set<string>; views: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().slice(0, 10), { visitors: new Set(), views: 0 });
    }
    for (const pv of data.pageviews) {
      const key = pv.viewed_at.slice(0, 10);
      const entry = dayMap.get(key);
      if (entry) {
        entry.views += 1;
        if (pv.visitor_id) entry.visitors.add(pv.visitor_id);
      }
    }
    const visitorsByDay = Array.from(dayMap.entries()).map(([date, v]) => ({
      date: date.slice(5),
      visitors: v.visitors.size,
      views: v.views,
    }));

    // referrers + devices
    const refMap = new Map<string, number>();
    for (const v of data.visitors) {
      refMap.set(v.referrer || "direct", (refMap.get(v.referrer || "direct") || 0) + 1);
    }
    const topReferrers = Array.from(refMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const devMap = new Map<string, number>();
    for (const v of data.visitors) {
      devMap.set(v.device || "desktop", (devMap.get(v.device || "desktop") || 0) + 1);
    }
    const deviceBreakdown = Array.from(devMap.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // clicks by country (anonymous, from the /api/geo edge lookup)
    const countryMap = new Map<string, number>();
    for (const c of data.link_clicks) {
      const key = c.country || "unknown";
      countryMap.set(key, (countryMap.get(key) || 0) + 1);
    }
    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const recentClicks = [...data.link_clicks]
      .sort((a, b) => (a.clicked_at < b.clicked_at ? 1 : -1))
      .slice(0, 12)
      .map((c) => ({ platform: c.platform, clicked_at: c.clicked_at, country: c.country || "unknown" }));

    return {
      totalVisitors: data.visitors.length,
      totalPageViews: data.pageviews.length,
      totalClicks: data.link_clicks.length + links.reduce((s, l) => s + (l.clicks || 0), 0),
      visitorsByDay,
      clicksByLink,
      topReferrers,
      topCountries,
      recentClicks,
      deviceBreakdown,
    };
  }

  async resetData(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CONTENT_KEY);
    window.localStorage.removeItem(ANALYTICS_KEY);
  }
}
