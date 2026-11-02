# 🌌 Cosmosfolio — Space-Themed Personal Portfolio

A stunning, animated personal portfolio for **Akila Maduranga** with a hidden **admin dashboard**, a **blog**, a **photo gallery served from Cloudflare R2**, and **Supabase-powered analytics** that track visitors and every social link click.

> **You are on v2.1** — quick check: `package.json` says `"version": "2.1.0"` and its `devDependencies` include `@types/node`. v2.1 fixes the Vercel build error "Please install @types/node"; v2.0 fixed a `.gitignore` bug that silently kept `local-store.ts` out of Git pushes and a Supabase `42P17` error in `schema.sql`.

![theme](https://img.shields.io/badge/theme-deep%20space-6331FB) ![stack](https://img.shields.io/badge/stack-Next.js%2016%20%C2%B7%20Supabase%20%C2%B7%20Tailwind%204-88F9C0)

## ✨ What's inside

**Public site** (single page, fully animated):
- 🕸️ **Vanta.js animated network** ([vantajs.com](https://www.vantajs.com/)) — a living constellation of indigo points and lines drifting behind everything, reacting to your mouse
- 🌠 Parallax **starfield canvas** with twinkling stars & shooting stars layered on top
- 🪐 Floating planet with orbiting satellite + animated nebula glows
- 🖥️ Self-typing **terminal card** in the hero
- ⌨️ Typewriter headline that cycles through your roles
- 🎨 Your exact palette: Onyx Black `#01010D` · Electric Indigo `#6331FB` · Tropical Mint `#88F9C0`
- 💫 Custom glowing cursor, scroll-reveal animations, tech-grid overlay, glassmorphism cards
- 📸 **Gallery section** — masonry photo gallery with category filters, hover reveals and a keyboard-navigable lightbox (`←` `→` `Esc`)
- 📝 **Blog** — write posts in markdown from the dashboard (headings, code blocks, quotes, images); every post gets a shareable `#/blog/<slug>` link
- 🧭 **Per-page visibility** — flip any section on or off and reorder it right from the dashboard; the public site (and its navbar) update instantly
- 🎨 **Full-colour brand icons** for social links, bundled from [dheereshag/coloured-icons](https://github.com/dheereshag/coloured-icons) into `public/icons/` (22 platforms: GitHub, LinkedIn, Instagram, X, YouTube, WhatsApp, Telegram, Discord, TikTok, Reddit, Bluesky, Twitch, Behance, Dribbble, Pinterest, ArtStation, Figma and more)
- Sections: Hero · About · Featured + grid Projects · Gallery · Blog · Skills (animated bars + marquee) · Experience timeline · Social links · Footer — **each one can be hidden or reordered from the admin**

**Mission Control** (admin dashboard — visit **`/admin`** directly; there is deliberately **no button or link to it anywhere** on the site, and search engines are told to stay away):
- 🔐 Password login (default `admin123` — change it!)
- 🧭 **Pages** — toggle each section visible/hidden and drag-order them; the public site updates instantly
- 📝 **Blog** — write, edit, hide or delete posts (markdown editor with live preview)
- 📊 **Telemetry**: unique visitors, page views, clicks, 30-day visitor chart, clicks per channel, top referrers, device breakdown, recent activity
- ✏️ Full CRUD for **everything**: profile & hero, projects, **gallery**, social links, skills, experience

**Tracking (Supabase)**:
- Every visit is recorded (unique visitor + page views + referrer + device)
- Every social link click is recorded and attributed to a link
- Analytics write through secure Postgres RPCs; content writes only via server-side API routes with the service-role key

## 🚀 Quick start (local)

```bash
npm install        # or: bun install / pnpm install
npm run dev
```

Open http://localhost:3000 — the site runs in **demo mode** (content & analytics stored in your browser's localStorage) so you can explore everything without any setup.

**Admin**: open **http://localhost:3000/admin** (not linked anywhere on purpose) → password `admin123`.

## ☁️ Gallery + Cloudflare R2

The gallery ships with 12 starter photos in `public/samples/`. To serve your own work from R2:

1. **Create a bucket** in the Cloudflare dashboard → R2 → Create bucket (e.g. `akila-photos`)
2. **Enable public access**: bucket → *Settings* → *Public access* → enable the `r2.dev` subdomain (fine for testing) or connect a custom domain (better for production)
3. **Upload your photos** (dashboard drag & drop, `wrangler r2 object put`, or any S3-compatible tool)
4. In the site's admin → **Gallery** tab → paste your base URL (e.g. `https://pub-xxxx.r2.dev`) into the **Cloudflare R2 base URL** field and save
5. Add frames — now you only need the **filename** (`milkyway.jpg`); full URLs work anywhere too

Full URLs always work as well, so you can mix R2, local `/samples/…` files and any other public host.

## 🛠 Connect Supabase (production mode)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql), press **Run**
   - creates all tables (incl. `posts` + `page_sections`), row-level security, tracking functions and starter content
   - the script is **idempotent** — if an earlier run failed halfway, just run it again; existing rows are skipped
   - **fixed in v2.0**: the `pageviews.view_date` column no longer uses a generated expression (Postgres rejected it with `42P17: generation expression is not immutable`); it is now a plain column with a UTC default
3. Copy `.env.example` → `.env.local` and fill in, from **Supabase Dashboard → Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Set a strong `ADMIN_PASSWORD`
5. `npm run dev` — the site now reads/writes Supabase and tracking is live

## ▲ Deploy to Vercel

**Before you start — make sure you are deploying THIS version.** Unzip this archive into a **fresh folder** (don't reuse the folder from an older download; both have the same file names and mixing them brings back old bugs). Two-second sanity check: `package.json` says `"version": "2.1.0"`.

**Option A — CLI**

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

**Option B — Git**

1. Push this folder to a GitHub repo
2. [vercel.com/new](https://vercel.com/new) → import the repo
3. Framework preset: **Next.js** (auto-detected, zero config needed)
4. Add the 4 environment variables from `.env.example`
5. Deploy 🚀

**If you already pushed an older copy of this project to GitHub** — the old `.gitignore` contained a `local-*` rule that silently excluded `src/lib/store/local-store.ts` from commits (that's what caused Vercel's `Module not found: Can't resolve './local-store'`). Delete the old repo (or replace its contents with this fresh folder — `git rm -r --cached .` first if reusing the same clone), re-commit, push, and redeploy. After committing, verify with:

```bash
git ls-files | grep local-store
# must print: src/lib/store/local-store.ts
```

Then open your site, head to **`/admin`**, log in with your `ADMIN_PASSWORD`, and replace the demo persona with your own name, links, projects, photos and posts — all edits save straight to Supabase.

## 🔐 Security model

| What | Who | How |
|---|---|---|
| Read site content | everyone | anon key + RLS `select` policies |
| Record visits / clicks | everyone | RPCs (`security definer`, fixed logic) |
| Edit content / read analytics | admin only | Next.js API routes + `ADMIN_PASSWORD` session token + service-role key |

The service-role key never reaches the browser. Tracking RPCs accept only the values they need and cannot fabricate content changes.

## 🧭 Project structure

```
src/
  app/                    # Next.js App Router
    page.tsx              # the public portfolio
    admin/page.tsx        # hidden admin route — unlinked, noindex
    api/admin/            # login / content CRUD / analytics (server-side)
  components/
    site/                 # StarfieldBackground (atmosphere stack: Vanta net +
                          # nebulas + starfield), VantaBackground, Hero, About,
                          # Projects, Gallery (masonry + lightbox), Blog
                          # (markdown + hash routes), Skills, Experience,
                          # SocialLinks, Navbar, Footer...
    admin/                # AdminApp (login + shell) + tabs/
                          #   Overview (charts), Pages (visibility + order), Profile,
                          #   Blog (markdown editor), Projects, Photos, Links,
                          #   Skills, Experience
  lib/
    store/                # dual data layer: local-store (demo) + supabase-store (prod)
    types.ts, seed.ts     # types & default content (Akila's starter persona)
    icons.tsx             # coloured brand icons registry (22 platforms)
    markdown.tsx          # dependency-free markdown renderer for blog posts
    site-context.tsx      # loads data, tracks the visit once per session
public/
  icons/                  # coloured brand SVGs (from dheereshag/coloured-icons)
  samples/                # 12 starter gallery images
supabase/schema.sql       # one-shot database setup
```

## ⚙️ Notes

- **Demo mode** (no env vars): content & analytics live in `localStorage` — perfect for trying the admin dashboard locally. Real mode activates automatically once Supabase env vars exist.
- The public site is a single route (`/`); the admin dashboard lives at `/admin` and is deliberately unlinked. Both deploy to Vercel as-is.
- Re-running `supabase/schema.sql` is safe — inserts use `on conflict do nothing`.
- To reset demo data: browser DevTools → Application → Local Storage → delete `cosmosfolio_*` keys.
- Placeholder content you'll want to personalise (all editable in the admin): the social URLs (`github.com/akilamaduranga`, `wa.me/94700000000`, …), the email address, and the demo projects/skills/experience entries.

---

Made with 💜 among the stars · **Onyx `#01010D` · Indigo `#6331FB` · Mint `#88F9C0`**
