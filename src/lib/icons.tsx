"use client";

import { Globe, Mail, Link as LinkIcon, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Bike,
  Bird,
  Book,
  Briefcase,
  Camera,
  Car,
  Cat,
  Code2,
  Coffee,
  Cpu,
  Dog,
  Film,
  Gamepad2,
  GraduationCap,
  Guitar,
  Headphones,
  Heart,
  Laptop,
  Leaf,
  Map,
  MoonStar,
  Mountain,
  Music,
  Palette,
  Plane,
  Rocket,
  Server,
  Smartphone,
  Star,
  Sun,
  Telescope,
  Terminal,
  Wrench,
  Zap,
} from "lucide-react";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Brand icons are the full-colour SVGs from the coloured-icons library
 * (github.com/dheereshag/coloured-icons), bundled locally in /public/icons
 * so the site has no runtime dependency on any CDN.
 * Generic links (email / website / cv / custom) use Lucide glyphs.
 */

interface PlatformMeta {
  label: string;
  /** brand colour — used for hover glows */
  color: string;
  /** true when the icon renders as a full-colour <img> */
  coloured?: boolean;
}

const COLOURED: Record<string, PlatformMeta> = {
  github: { label: "GitHub", color: "#ffffff", coloured: true },
  x: { label: "X / Twitter", color: "#e7e9ea", coloured: true },
  twitter: { label: "X / Twitter", color: "#e7e9ea", coloured: true },
  linkedin: { label: "LinkedIn", color: "#0A66C2", coloured: true },
  instagram: { label: "Instagram", color: "#E4405F", coloured: true },
  youtube: { label: "YouTube", color: "#FF0000", coloured: true },
  discord: { label: "Discord", color: "#5865F2", coloured: true },
  whatsapp: { label: "WhatsApp", color: "#25D366", coloured: true },
  telegram: { label: "Telegram", color: "#229ED9", coloured: true },
  tiktok: { label: "TikTok", color: "#FE2C55", coloured: true },
  reddit: { label: "Reddit", color: "#FF4500", coloured: true },
  bluesky: { label: "Bluesky", color: "#0285ff", coloured: true },
  twitch: { label: "Twitch", color: "#9146FF", coloured: true },
  snapchat: { label: "Snapchat", color: "#FFFC00", coloured: true },
  mastodon: { label: "Mastodon", color: "#6364ff", coloured: true },
  facebook: { label: "Facebook", color: "#1877F2", coloured: true },
  behance: { label: "Behance", color: "#1769FF", coloured: true },
  dribbble: { label: "Dribbble", color: "#EA4C89", coloured: true },
  pinterest: { label: "Pinterest", color: "#BD081C", coloured: true },
  artstation: { label: "ArtStation", color: "#13AFF0", coloured: true },
  letterboxd: { label: "Letterboxd", color: "#00E054", coloured: true },
  figma: { label: "Figma", color: "#F24E1E", coloured: true },
  spotify: { label: "Spotify", color: "#1DB954", coloured: true },
  lastfm: { label: "Last.fm", color: "#D51007", coloured: true },
  soundcloud: { label: "SoundCloud", color: "#FF5500", coloured: true },
  steam: { label: "Steam", color: "#66c0f4", coloured: true },
  devto: { label: "dev.to", color: "#ffffff", coloured: true },
  medium: { label: "Medium", color: "#ffffff", coloured: true },
  threads: { label: "Threads", color: "#ffffff", coloured: true },
};

const GENERIC: Record<string, PlatformMeta> = {
  email: { label: "Email", color: "#88F9C0" },
  website: { label: "Website", color: "#6331FB" },
  blog: { label: "Blog", color: "#6331FB" },
  cv: { label: "CV / Resume", color: "#88F9C0" },
  other: { label: "Custom Link", color: "#8b6bff" },
};

export const PLATFORM_META: Record<string, PlatformMeta> = {
  ...COLOURED,
  ...GENERIC,
};

export const PLATFORM_KEYS = Object.keys(PLATFORM_META);

/**
 * Icon picker for the About-page badges (editable from admin → Badges).
 * Keys are stored in the `facts.icon` column, so adding more here later
 * just works — unknown keys fall back to a sparkle.
 */
export const FACT_ICONS: Record<string, LucideIcon> = {
  laptop: Laptop,
  code: Code2,
  terminal: Terminal,
  server: Server,
  cpu: Cpu,
  smartphone: Smartphone,
  camera: Camera,
  film: Film,
  telescope: Telescope,
  rocket: Rocket,
  coffee: Coffee,
  zap: Zap,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  moonstar: MoonStar,
  sun: Sun,
  map: Map,
  mountain: Mountain,
  plane: Plane,
  bicycle: Bike,
  car: Car,
  gamepad: Gamepad2,
  music: Music,
  headphones: Headphones,
  guitar: Guitar,
  book: Book,
  palette: Palette,
  wrench: Wrench,
  briefcase: Briefcase,
  gradcap: GraduationCap,
  bird: Bird,
  cat: Cat,
  dog: Dog,
  leaf: Leaf,
  badgecheck: BadgeCheck,
};

export const FACT_ICON_KEYS = Object.keys(FACT_ICONS);

export function FactIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Cmp = FACT_ICONS[icon] || Sparkles;
  return <Cmp className={className} aria-hidden />;
}

export function isColouredPlatform(platform: string): boolean {
  return Boolean(PLATFORM_META[platform]?.coloured);
}

export function PlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const meta = PLATFORM_META[platform] || PLATFORM_META.other;

  if (meta.coloured) {
    return (
       
      <img
        src={`/icons/${platform}.svg`}
        alt=""
        aria-hidden
        className={className}
        draggable={false}
      />
    );
  }

  switch (platform) {
    case "email":
      return <Mail className={className} aria-hidden />;
    case "website":
    case "blog":
      return <Globe className={className} aria-hidden />;
    default:
      return <LinkIcon className={className} aria-hidden />;
  }
}
