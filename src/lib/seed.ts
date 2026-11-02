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

/**
 * Starter content — written in Akila's voice on purpose.
 * Everything here is editable from the admin dashboard (/admin),
 * so treat it as a friendly first draft, not the final word.
 */

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const SEED_PROFILE: Profile = {
  id: "profile-1",
  name: "Akila Maduranga",
  title: "Tech Enthusiast & Hobbyist Photographer",
  tagline: "I build things for fun, take photos because I can't help it, and write about whatever I'm into lately.",
  roles: [
    "tech enthusiast",
    "hobbyist photographer",
    "weekend builder",
    "terminal dweller",
    "tea drinker",
  ],
  bio: "I'm Akila — and no, I'm not a professional developer or a professional photographer. I'm just someone who genuinely likes making things.\n\nBy night I'm usually in a terminal somewhere: little web experiments, scripts that fix problems only I have, and a home server that stays up most of the time. On weekends I carry a camera around Sri Lanka — hills, coast, streets, the occasional night sky — and I've stopped pretending I'll ever sort the photo library properly.\n\nThis site is one of my favourite experiments so far. I built the whole thing myself: the animations, the admin panel where I edit everything, even the words you're reading right now. It broke many times along the way. That's kind of the fun part.",
  bio_short:
    "Enthusiast, not professional. I code for fun, photograph everything else, and built this whole site myself — from Sri Lanka, with a lot of tea.",
  location: "Sri Lanka",
  email: "hello@akilamaduranga.dev",
  avatar_url: "",
  resume_url: "",
  available: true,
  years_experience: 5,
  r2_base_url: "",
};

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj-this-site",
    title: "This Very Website",
    description:
      "The site you're looking at, actually. Next.js underneath, an animated starfield drawn on a canvas, and an admin panel so I can edit every word and photo without touching code. It took a few weekends, several rewrites of this exact paragraph, and one unfortunate incident where I deleted the whole thing at 2 AM.",
    image_url: "",
    gradient: 0,
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    live_url: "",
    repo_url: "",
    featured: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "proj-photo-pipeline",
    title: "SD Card Rescue Script",
    description:
      "A small pipeline that grabs photos off my SD cards, sorts them by date and place, backs them up, and pushes the keepers to cloud storage. Built it because doing this by hand got old around trip number three. It has saved roughly 40 GB of holiday memories so far.",
    image_url: "",
    gradient: 1,
    tech: ["Python", "Cloudflare R2", "Bash"],
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "proj-home-server",
    title: "The Immortal Home Server",
    description:
      "An old PC that refused to die, so now it runs my files, my backups and a couple of self-hosted apps. Current uptime record: 47 days. Current record after I tripped over the power cable: 0 minutes. Learning Docker one broken container at a time.",
    image_url: "",
    gradient: 2,
    tech: ["Linux", "Docker", "Self-hosting"],
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 2,
    created_at: new Date().toISOString(),
    visible: true,
  },
];

export const SEED_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "link-github",
    platform: "github",
    label: "GitHub",
    url: "https://github.com/akilamaduranga",
    sort_order: 0,
    clicks: 0,
    visible: true,
  },
  {
    id: "link-linkedin",
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://linkedin.com/in/akilamaduranga",
    sort_order: 1,
    clicks: 0,
    visible: true,
  },
  {
    id: "link-instagram",
    platform: "instagram",
    label: "Instagram",
    url: "https://instagram.com/akila.frames",
    sort_order: 2,
    clicks: 0,
    visible: true,
  },
  {
    id: "link-x",
    platform: "x",
    label: "X / Twitter",
    url: "https://x.com/akilamaduranga",
    sort_order: 3,
    clicks: 0,
    visible: true,
  },
  {
    id: "link-youtube",
    platform: "youtube",
    label: "YouTube",
    url: "https://youtube.com/@akilamaduranga",
    sort_order: 4,
    clicks: 0,
    visible: true,
  },
  {
    id: "link-whatsapp",
    platform: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/94700000000",
    sort_order: 5,
    clicks: 0,
    visible: true,
  },
  {
    id: "link-email",
    platform: "email",
    label: "Email",
    url: "mailto:hello@akilamaduranga.dev",
    sort_order: 6,
    clicks: 0,
    visible: true,
  },
];

export const SEED_SKILLS: Skill[] = [
  // deliberately honest numbers — this is a hobby, not a résumé
  { id: "skill-html", name: "HTML & CSS", category: "Frontend", level: 72, sort_order: 0, visible: true },
  { id: "skill-js", name: "JavaScript", category: "Frontend", level: 62, sort_order: 1, visible: true },
  { id: "skill-react", name: "React", category: "Frontend", level: 55, sort_order: 2, visible: true },
  { id: "skill-tw", name: "Tailwind CSS", category: "Frontend", level: 68, sort_order: 3, visible: true },
  { id: "skill-node", name: "Node.js", category: "Backend", level: 45, sort_order: 4, visible: true },
  { id: "skill-sb", name: "Supabase", category: "Backend", level: 52, sort_order: 5, visible: true },
  { id: "skill-pg", name: "PostgreSQL", category: "Backend", level: 38, sort_order: 6, visible: true },
  { id: "skill-py", name: "Python", category: "Backend", level: 48, sort_order: 7, visible: true },
  { id: "skill-git", name: "Git", category: "Tools", level: 60, sort_order: 8, visible: true },
  { id: "skill-vscode", name: "VS Code", category: "Tools", level: 92, sort_order: 9, visible: true },
  { id: "skill-linux", name: "Linux", category: "Tools", level: 50, sort_order: 10, visible: true },
  { id: "skill-docker", name: "Docker", category: "Tools", level: 32, sort_order: 11, visible: true },
  { id: "skill-lightroom", name: "Lightroom", category: "Tools", level: 65, sort_order: 12, visible: true },
];

export const SEED_EXPERIENCES: Experience[] = [
  {
    id: "exp-1",
    role: "A computer I could take apart",
    company: "where the curiosity started",
    description:
      "It was slow, it was loud, and I took it apart more times than anyone appreciated. That's roughly when I learned that breaking things is just learning with extra steps.",
    start_date: "2010",
    end_date: "",
    current: false,
    sort_order: 0,
    visible: true,
  },
  {
    id: "exp-2",
    role: "First proper camera",
    company: "the photography bug",
    description:
      "A hand-me-down with one working lens and a shutter that stuck sometimes. I shot terrible photos of everything for months. Some of them are still my favourites.",
    start_date: "2018",
    end_date: "",
    current: false,
    sort_order: 1,
    visible: true,
  },
  {
    id: "exp-3",
    role: "Started building for the web",
    company: "one index.html at a time",
    description:
      "My first page was a disaster of marquee tags and broken images, and I was ridiculously proud of it. Still get that exact feeling every time something I build actually works.",
    start_date: "2021",
    end_date: "",
    current: false,
    sort_order: 2,
    visible: true,
  },
  {
    id: "exp-4",
    role: "Built this whole site",
    company: "current obsession",
    description:
      "Designed it, animated it, wired the database, wrote the words. Somewhere along the way it stopped being a project and became the place I put things I make.",
    start_date: "2025",
    end_date: "",
    current: true,
    sort_order: 3,
    visible: true,
  },
];

/**
 * Starter photo gallery. Sample images ship with the site in
 * /public/samples — swap in your own Cloudflare R2 URLs from the admin
 * dashboard (Gallery tab) whenever you're ready.
 */
export const SEED_PHOTOS: Photo[] = [
  {
    id: "photo-astro-1",
    title: "Milky Way, 3 AM",
    caption: "Pointed the camera up on a clear night and got lucky. Worth losing the sleep.",
    category: "Night Sky",
    image_url: "/samples/astro-milkyway.jpg",
    sort_order: 0,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-astro-2",
    title: "Galaxy Hunting",
    caption: "Not an astrophotographer by any stretch — I just really like pointing at things in the sky.",
    category: "Night Sky",
    image_url: "/samples/astro-galaxy.jpg",
    sort_order: 1,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-astro-3",
    title: "Stars Over Nowhere",
    caption: "Drove out past the last street light and waited for my eyes to adjust.",
    category: "Night Sky",
    image_url: "/samples/astro-stellar.jpg",
    sort_order: 2,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-land-1",
    title: "Tea Country Mornings",
    caption: "Fog rolling through the hills like a slow tide. Stood there until the tea got cold.",
    category: "Landscape",
    image_url: "/samples/srilanka-tea.jpg",
    sort_order: 3,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-land-2",
    title: "Layers of Green",
    caption: "Somewhere on the road to the peaks, pulled over for the fifth time in an hour.",
    category: "Landscape",
    image_url: "/samples/srilanka-hills.jpg",
    sort_order: 4,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-land-3",
    title: "Southern Coast, Golden Hour",
    caption: "Salt air, warm light and absolutely no rush to be anywhere.",
    category: "Landscape",
    image_url: "/samples/srilanka-coast.jpg",
    sort_order: 5,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-port-1",
    title: "The Muse",
    caption: "Natural light, quiet expression, one patient friend.",
    category: "Portrait",
    image_url: "/samples/portrait-muse.jpg",
    sort_order: 6,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-port-2",
    title: "Last Ten Minutes of Light",
    caption: "The most honest light of the day — if you can catch it.",
    category: "Portrait",
    image_url: "/samples/portrait-golden.jpg",
    sort_order: 7,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-port-3",
    title: "Studio Session",
    caption: "One light, one shadow, one story. Mostly improvised.",
    category: "Portrait",
    image_url: "/samples/portrait-studio.jpg",
    sort_order: 8,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-street-1",
    title: "Neon District",
    caption: "The city writes its own captions at night — I just carry the camera.",
    category: "Street",
    image_url: "/samples/street-neon.jpg",
    sort_order: 9,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-street-2",
    title: "After the Rain",
    caption: "For a few minutes after the rain stops, every street gets a second copy of itself.",
    category: "Street",
    image_url: "/samples/street-rain.jpg",
    sort_order: 10,
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "photo-street-2b",
    title: "City Pulse",
    caption: "Long exposure traffic trails. The heartbeat of a city that never fully sleeps.",
    category: "Street",
    image_url: "/samples/street-nightcity.jpg",
    sort_order: 11,
    created_at: new Date().toISOString(),
    visible: true,
  },
];

export const SEED_POSTS: BlogPost[] = [
  {
    id: "post-hello-internet",
    title: "Hello, internet",
    slug: "hello-internet",
    excerpt:
      "First post. Why this site exists, what I'll be posting about, and a small promise to my future self.",
    content: `So I finally did the thing.

For years my "website" was a half-finished \`index.html\` sitting in a folder called \`new_website_FINAL_v3\`. You know the one. Every few months I'd open it, sigh at it, and close it again.

This time I actually shipped.

## Why bother with a website?

Honestly? Because it's mine. Social feeds come and go, algorithms change, and half my photos are trapped in an app I no longer open. A personal site is a small corner of the internet that answers to nobody but me. I wanted a place to put:

- little projects I'm tinkering with
- photos I'm genuinely happy with
- notes like this one, about whatever I'm currently obsessed with

## What you can expect

No schedule, no theme, no growth strategy. I'll write when there's something worth writing — a project that worked, a project that spectacularly didn't, a photo trip worth retelling, or a thing I learned the hard way so you don't have to.

> Fair warning: I'm an enthusiast, not an expert. Take everything here as "stuff that worked for me", not gospel.

## A note to future me

If you're reading this years later and cringing — good. That means I kept learning.

See you around,
**Akila**`,
    cover_image_url: "",
    tags: ["meta", "first post"],
    published_at: daysAgo(3),
    created_at: new Date().toISOString(),
    visible: true,
  },
  {
    id: "post-built-this-site",
    title: "I built this site from scratch (and you can poke around)",
    slug: "built-this-site-from-scratch",
    excerpt:
      "The story of this website — the stack, the mistakes, the 2 AM deletion incident, and why the admin panel is my favourite part.",
    content: `This site is my favourite project so far, which is funny because it's also the project where I made the most mistakes.

## The short version

It's built with **Next.js**, styled with **Tailwind**, animated with more enthusiasm than restraint, and backed by **Supabase** — which quietly counts visitors and link clicks in the background. (Only I can see those numbers, so click freely.)

The animated starfield you see behind everything? That's a \`<canvas>\` and about 200 lines of JavaScript pretending to be a galaxy:

\`\`\`js
// the whole trick is smaller than it looks
for (const star of stars) {
  const alpha = star.baseAlpha * (0.55 + 0.45 * Math.sin(t + star.phase));
  ctx.fillStyle = \`rgba(136, 249, 192, \${alpha})\`; // mint, obviously
  ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
}
\`\`\`

## The colours were decided before anything else

Onyx black \`#01010D\`, electric indigo \`#6331FB\`, tropical mint \`#88F9C0\`. Once those three were locked in, every other decision basically made itself. Dark background, mint for anything alive, indigo for anything structural.

## The admin panel is the best part

There's a hidden dashboard at \`/admin\` where I can rewrite every paragraph, add photos, reorder sections, toggle pages on and off, and publish these very posts — all without redeploying. Writing blog posts in a form beats fighting a CMS any day of the week.

## The 2 AM incident

At one point I ran a cleanup command that was slightly too confident, and the entire project folder went to the big /dev/null in the sky. An evening of panic, a lesson about backups, and — eventually — a rebuild that came out better than the original. The photo backup script you'll see in my projects list? That exists *because* of this night.

Anyway — poke around, click things, and if something looks broken, it probably is. Tell me about it and I'll fix it live, like a proper hobbyist.

— **A.**`,
    cover_image_url: "",
    tags: ["site", "next.js", "behind the scenes"],
    published_at: daysAgo(1),
    created_at: new Date().toISOString(),
    visible: true,
  },
];

/** Each section of the home page can be shown or hidden from the admin dashboard. */
export const SEED_PAGES: PageSection[] = [
  {
    key: "about",
    label: "About",
    description: "Who I am, in slightly too many words",
    visible: true,
    sort_order: 0,
  },
  {
    key: "projects",
    label: "Projects",
    description: "Things I've built — some useful, some just fun",
    visible: true,
    sort_order: 1,
  },
  {
    key: "gallery",
    label: "Gallery",
    description: "Photos I'm happy with",
    visible: true,
    sort_order: 2,
  },
  {
    key: "blog",
    label: "Blog",
    description: "Notes and updates on new stuff I'm doing",
    visible: true,
    sort_order: 3,
  },
  {
    key: "skills",
    label: "Skills",
    description: "Stuff I use — no certificates, just curiosity",
    visible: true,
    sort_order: 4,
  },
  {
    key: "experience",
    label: "Journey",
    description: "How I ended up here — a short timeline",
    visible: true,
    sort_order: 5,
  },
  {
    key: "connect",
    label: "Connect",
    description: "Where to find me online",
    visible: true,
    sort_order: 6,
  },
];
