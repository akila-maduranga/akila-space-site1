/**
 * Shared map from the admin-managed page "key" (about / projects / gallery
 * / blog / skills / experience / connect) to its dedicated route. The site
 * used to be one long page with #anchor sections — every section now owns
 * a full page, which gives each one room to grow (more projects, longer
 * posts, bigger galleries) without one endless scroll.
 */

export const ROUTE_BY_KEY: Record<string, string> = {
  about: "/about",
  projects: "/projects",
  gallery: "/gallery",
  blog: "/blog",
  skills: "/skills",
  experience: "/experience",
  connect: "/connect",
};

/** Fallback labels when a page isn't in the owner's `pages` config yet */
export const LABEL_BY_KEY: Record<string, string> = {
  about: "About",
  projects: "Projects",
  gallery: "Gallery",
  blog: "Blog",
  skills: "Skills",
  experience: "Experience",
  connect: "Connect",
};

/** Fallback section blurbs, matching the built-in demo content tone */
export const DESCRIPTION_BY_KEY: Record<string, string> = {
  about: "Who I am, in slightly too many words",
  projects: "Things I've built — some useful, some just fun",
  gallery: "Photos I'm happy with",
  blog: "Notes and updates on new stuff I'm doing",
  skills: "The toolbox, honestly rated",
  experience: "Where I've been and what I picked up along the way",
  connect: "Inboxes open, no pitch required",
};

export function routeForKey(key: string): string | null {
  return ROUTE_BY_KEY[key] ?? null;
}
