"use client";

import { Globe, Mail, Link as LinkIcon } from "lucide-react";
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
