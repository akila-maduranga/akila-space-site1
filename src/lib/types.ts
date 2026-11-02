export interface Profile {
  id: string;
  name: string;
  title: string;
  tagline: string;
  roles: string[];
  bio: string;
  bio_short: string;
  location: string;
  email: string;
  avatar_url: string;
  resume_url: string;
  available: boolean;
  years_experience: number;
  /** Public base URL of your Cloudflare R2 bucket (e.g. https://pub-xxx.r2.dev
   *  or https://cdn.yourdomain.com) — lets you add photos by filename only. */
  r2_base_url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  gradient: number;
  tech: string[];
  live_url: string;
  repo_url: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  visible: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  sort_order: number;
  clicks: number;
  visible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  sort_order: number;
  visible: boolean;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  description: string;
  start_date: string;
  end_date: string;
  current: boolean;
  sort_order: number;
  visible: boolean;
}

export interface Photo {
  id: string;
  title: string;
  caption: string;
  category: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  visible: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Markdown-ish body — headings, lists, quotes, code, links and images */
  content: string;
  cover_image_url: string;
  tags: string[];
  /** Editable publish date — "YYYY-MM-DD" */
  published_at: string;
  created_at: string;
  visible: boolean;
}

export interface PageSection {
  /** section key — also the anchor id on the home page (e.g. "about") */
  key: string;
  label: string;
  description: string;
  visible: boolean;
  sort_order: number;
}

export interface VisitorRecord {
  id: string;
  visitor_id: string;
  first_seen: string;
  last_seen: string;
  page_views: number;
  referrer: string;
  device: string;
}

export interface LinkClickRecord {
  id: string;
  link_id: string;
  platform: string;
  clicked_at: string;
  visitor_id: string;
}

export interface DayStat {
  date: string;
  visitors: number;
  views: number;
}

export interface ClickStat {
  label: string;
  platform: string;
  clicks: number;
}

export interface ReferrerStat {
  referrer: string;
  count: number;
}

export interface Analytics {
  totalVisitors: number;
  totalPageViews: number;
  totalClicks: number;
  visitorsByDay: DayStat[];
  clicksByLink: ClickStat[];
  topReferrers: ReferrerStat[];
  topCountries: { country: string; count: number }[];
  recentClicks: { platform: string; clicked_at: string; country?: string }[];
  deviceBreakdown: { device: string; count: number }[];
}

export interface ServerStatus {
  ok: boolean;
  publicConfigured: boolean;
  serviceConfigured: boolean;
  dbReachable: boolean;
  detail: string;
}

export type StoreMode = "local" | "supabase";

export interface DataStore {
  mode: StoreMode;
  getProfile(): Promise<Profile>;
  getProjects(): Promise<Project[]>;
  getSocialLinks(): Promise<SocialLink[]>;
  getSkills(): Promise<Skill[]>;
  getExperiences(): Promise<Experience[]>;
  getPhotos(): Promise<Photo[]>;
  getPosts(): Promise<BlogPost[]>;
  getPages(): Promise<PageSection[]>;
  trackVisit(): Promise<void>;
  trackLinkClick(link: SocialLink): Promise<void>;
  saveProfile(profile: Profile): Promise<void>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  saveSocialLink(link: SocialLink): Promise<void>;
  deleteSocialLink(id: string): Promise<void>;
  saveSkill(skill: Skill): Promise<void>;
  deleteSkill(id: string): Promise<void>;
  saveExperience(experience: Experience): Promise<void>;
  deleteExperience(id: string): Promise<void>;
  savePhoto(photo: Photo): Promise<void>;
  deletePhoto(id: string): Promise<void>;
  savePost(post: BlogPost): Promise<void>;
  deletePost(id: string): Promise<void>;
  savePage(page: PageSection): Promise<void>;
  getAnalytics(): Promise<Analytics>;
  resetData(): Promise<void>;
}
