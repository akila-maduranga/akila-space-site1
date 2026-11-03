# 🌌 Cosmosfolio — Space-Themed Personal Portfolio

A stunning, animated personal portfolio for **Akila Maduranga** with a hidden **admin dashboard**, a **blog**, a **photo gallery served from Cloudflare R2**, and **Supabase-powered analytics** that track visitors and every social link click.

> **You are on v2.6.3** — quick check: `package.json` says `"version": "2.6.3"`. v2.6.3 fixes mobile rendering: a CSS-grid blowout made `/connect` (and parts of `/about`) render wider than the screen on phones — text got cut off and the page could scroll sideways. Grid columns now clamp properly at every phone width, and the page blocks sideways scrolling site-wide; verified on 320–430 px phones and tablets. v2.6.1 made the `/connect` contact form **appear on demand**: a "Send me a message" button card reveals the editable mail form (✕ hides it again, typed text is kept). v2.6 added **real email**: a contact form on `/connect` (`/api/contact` → Resend) plus automatic **inbound forwarding** — mail sent to `anything@akila.space` is received by Resend and forwarded straight to your private Gmail (`/api/email-forward` webhook). It also made the **hero terminal window fully editable** (admin → Terminal tab: commands, outputs, colours, order, visibility, `{{photos}}`-style live placeholders) and expanded the social-link platform picker to **34 platforms** (Spotify, Last.fm, SoundCloud, Steam, Threads, dev.to, …). v2.5 added the editable About-page **Badges** tab and simplified the footer. v2.4 split the site into proper per-section routes (`/about`, `/projects`, `/gallery`, `/blog`, `/skills`, `/experience`, `/connect`). v2.3 fixed the "admin edits don't update anything" class of bug with the admin status panel; v2.2.1 fixed the `42703` schema upgrade error; v2.2 fixed the invisible animated background, login lockout and country tracking; v2.1 fixed the missing `@types/node` build error; v2.0 fixed the `.gitignore`/`local-store.ts` deploy bug and the Supabase `42P17` schema error.

![theme](https://img.shields.io/badge/theme-deep%20space-6331FB) ![stack](https://img.shields.io/badge/stack-Next.js%2016%20%C2%B7%20Supabase%20%C2%B7%20Tailwind%204-88F9C0)

## ✨ What's inside

**Public site** (multi-page, fully animated — each section also has its own route: `/about`, `/projects`, `/gallery`, `/blog`, `/skills`, `/experience`, `/connect`):
- 🕸️ **Vanta.js animated network** ([vantajs.com](https://www.vantajs.com/)) — a living constellation of indigo points and lines drifting behind everything, reacting to your mouse
- 🌠 Parallax **starfield canvas** with twinkling stars & shooting stars layered on top
- 🪐 Floating planet with orbiting satellite + animated nebula glows
- 🖥️ Self-typing **terminal card** in the hero — every command, output, colour and order is editable from the dashboard's **Terminal** tab, with live placeholders like `{{photos}}` and `{{years}}` that stay honest automatically
- ⌨️ Typewriter headline that cycles through your roles
- 🎨 Your exact palette: Onyx Black `#01010D` · Electric Indigo `#6331FB` · Tropical Mint `#88F9C0`
- 💫 Custom glowing cursor, scroll-reveal animations, tech-grid overlay, glassmorphism cards
- 📸 **Gallery section** — masonry photo gallery with category filters, hover reveals and a keyboard-navigable lightbox (`←` `→` `Esc`)
- 📝 **Blog** — write posts in markdown from the dashboard (headings, code blocks, quotes, images); every post gets a shareable `#/blog/<slug>` link
- 🧭 **Per-page visibility** — flip any section on or off and reorder it right from the dashboard; the public site (and its navbar) update instantly
- 🎨 **Full-colour brand icons** for social links, bundled from [dheereshag/coloured-icons](https://github.com/dheereshag/coloured-icons) into `public/icons/` (**34 platforms**: GitHub, LinkedIn, Instagram, X, YouTube, WhatsApp, Telegram, Discord, TikTok, Reddit, Bluesky, Twitch, Behance, Dribbble, Pinterest, ArtStation, Figma, **Spotify, Last.fm, SoundCloud, Steam, Threads, dev.to, Medium, Mastodon, Snapchat, Letterboxd** and more)
- 📬 **Working contact form** on `/connect` — posts to `/api/contact` and lands in your private inbox via [Resend](https://resend.com), with spam protection (honeypot + rate limit) and a graceful `mailto:` fallback when email isn't configured. See **Email setup** below for the full picture, including receiving mail at `contact@akila.space`
- Sections: Hero · About · Featured + grid Projects · Gallery · Blog · Skills (animated bars + marquee) · Experience timeline · Social links · Footer — **each one can be hidden or reordered from the admin**

**Mission Control** (admin dashboard — visit **`/admin`** directly; there is deliberately **no button or link to it anywhere** on the site, and search engines are told to stay away):
- 🔐 Password login (default `admin123` — change it!) — **3 wrong passwords locks that device out for 24 hours**
- 🩺 **System status panel** — the dashboard tells you if it's running in demo mode, whether the server can reach Supabase, and exactly which env var to fix if edits aren't saving
- 🧭 **Pages** — toggle each section visible/hidden and drag-order them; the public site updates instantly
- 📝 **Blog** — write, edit, hide or delete posts (markdown editor with live preview)
- 📊 **Telemetry**: unique visitors, page views, clicks, 30-day visitor chart, clicks per channel, **clicks per country (Signal Origins)**, top referrers, device breakdown, recent activity
- ✏️ Full CRUD for **everything**: profile & hero, **terminal window**, projects, **gallery**, social links, skills, experience, **About badges**

**Tracking (Supabase)**:
- Every visit is recorded (unique visitor + page views + referrer + device + country)
- Every social link click is recorded and attributed to a link **and a country** (from the Vercel/Cloudflare edge header — no IP address is ever stored; the dashboard's *Signal Origins* card shows clicks per country with flags)
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

## 📬 Email — contact form + receiving at `contact@akila.space` (Resend, free)

The site ships with two email endpoints (both disabled harmlessly until you add `RESEND_API_KEY`):

- **`/api/contact`** — the form on `/connect` sends visitor messages from `contact@akila.space` straight to your private inbox, with `Reply-To` set to the visitor so one click in Gmail answers them.
- **`/api/email-forward`** — a Resend webhook that receives mail sent to **any address `@akila.space`** (Resend holds the MX record) and forwards it to your private Gmail automatically.

### Setup in 4 steps

1. **Resend** — create a free account at [resend.com](https://resend.com) → **Domains → Add domain** → `akila.space` → add the shown SPF/DKIM/TXT records at your DNS host → wait for *Verified*. On the domain page, also toggle **Enable Receiving** and add the shown **MX record**.
2. **API key** — Resend → **API Keys → Create API key** (full access).
3. **Vercel** — Project → Settings → Environment Variables → add `RESEND_API_KEY` (the optional `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` / `CONTACT_FORWARD_TO` / `CONTACT_DOMAIN` vars are documented in `.env.example`; the defaults already point at `contact@akila.space` → your Gmail). **Redeploy**.
4. **Webhook** — Resend → **Webhooks → Create Webhook** → endpoint `https://akila.space/api/email-forward` → select the **`email.received`** event → save.

**Test**: send yourself a mail at `contact@akila.space` from Gmail — it should arrive in your private inbox ~10s later (mark it *Not spam* once). Fill in the `/connect` form — the message lands in the same inbox with the visitor's address in `Reply-To`.

Free plan limits: 100 mails/day, 3,000/month, 3 custom domains, 3 inboxes — inbound mail counts toward the monthly quota. The dashboard's *Receiving* tab keeps 30 days of history; your Gmail is the real archive. Want to **reply as `contact@akila.space` from inside Gmail**? Add it under Gmail → Settings → Accounts → *Send mail as* using Resend's SMTP (`smtp.resend.com`, port 587, user `resend`, password = your API key).

## 🛠 Connect Supabase (production mode)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql), press **Run**
   - creates all tables (incl. `posts` + `page_sections`), row-level security, tracking functions and starter content
   - the script is **idempotent** — if an earlier run failed halfway, just run it again; existing rows are skipped
   - **Upgrading from an earlier version?** re-run the whole file — it is idempotent. v2.2 adds the `country` column on `visitors`/`link_clicks`, the `admin_auth_attempts` table (login lockout), and the `top_countries()` RPC. v2.2.1 fixes the upgrade itself: on databases set up before v2.2 the run used to stop with `42703: column "country" does not exist` — if you ever saw that error, just run this file again and it completes (your existing rows are kept; old analytics rows get `country = 'unknown'`)
3. Copy `.env.example` → `.env.local` and fill in, from **Supabase Dashboard → Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Set a strong `ADMIN_PASSWORD`
5. `npm run dev` — the site now reads/writes Supabase and tracking is live

## ▲ Deploy to Vercel

**Before you start — make sure you are deploying THIS version.** Unzip this archive into a **fresh folder** (don't reuse the folder from an older download; both have the same file names and mixing them brings back old bugs). Two-second sanity check: `package.json` says `"version": "2.6.3"`.

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
4. Add the environment variables from `.env.example` (Supabase ×3, `ADMIN_PASSWORD`, and `RESEND_API_KEY` if you want email)
5. Deploy 🚀

**If you already pushed an older copy of this project to GitHub** — the old `.gitignore` contained a `local-*` rule that silently excluded `src/lib/store/local-store.ts` from commits (that's what caused Vercel's `Module not found: Can't resolve './local-store'`). Delete the old repo (or replace its contents with this fresh folder — `git rm -r --cached .` first if reusing the same clone), re-commit, push, and redeploy. After committing, verify with:

```bash
git ls-files | grep local-store
# must print: src/lib/store/local-store.ts
```

Then open your site, head to **`/admin`**, log in with your `ADMIN_PASSWORD`, and replace the demo persona with your own name, links, projects, photos and posts — all edits save straight to Supabase.

**“My edits don't show up / don't save”?** The admin dashboard now diagnoses this for you — open **Mission Control** (the first admin tab) and read the system status panel, which walks the exact path an edit takes (env vars → service key → tables → write permission → public reads) and names the first broken step. A red banner also appears on every admin tab if the dashboard itself is falling back to demo content. The usual causes, in order of likelihood:

| What the status panel says | Fix |
| --- | --- |
| “database not set up — run supabase/schema.sql” / “tables don't exist” | Open the Supabase **SQL Editor**, paste the **whole** `supabase/schema.sql` and Run. A failed run rolls back completely, so if your first attempt errored (e.g. the v2.2 `42703` bug fixed in v2.2.1), the tables were never created — just run the fixed file. |
| “wrong key in SUPABASE_SERVICE_ROLE_KEY” | You pasted the anon (publishable) key into the service slot. Copy the `service_role` **secret** from Supabase → Settings → API, update the env var, **redeploy**. |
| “The public site can't read your database” or “anon key sees 0 rows” | Wrong `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or the RLS read policies are missing — re-run `supabase/schema.sql`. Either way the site silently shows demo content, which is exactly why edits look like they don't stick. |
| “server env vars missing” | Add the three Supabase vars in Vercel → Settings → Environment Variables, then **redeploy** — `NEXT_PUBLIC_*` values are baked in at build time, so setting them without a new build changes nothing. |
| “This browser can't read the database — demo content shown” (amber) | Server checks pass but the browser can't reach Supabase. Almost always env vars set after the last build — redeploy. |
| Locked out of `/admin` ("Too many failed attempts") | You get 3 tries, then a 24h lock per device. To unlock early, run `delete from public.admin_auth_attempts;` in the SQL editor (or use a different network). |

## 🔐 Security model

| What | Who | How |
|---|---|---|
| Read site content | everyone | anon key + RLS `select` policies |
| Record visits / clicks | everyone | RPCs (`security definer`, fixed logic) |
| Edit content / read analytics | admin only | Next.js API routes + `ADMIN_PASSWORD` session token + service-role key |
| Brute-force the admin password | blocked | 3 failures → 24h lockout per device (DB-backed, salted IP hash) |

The service-role key never reaches the browser. Tracking RPCs accept only the values they need and cannot fabricate content changes. Every response ships with `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS and a tuned `Content-Security-Policy`; `/admin` additionally sends `X-Robots-Tag: noindex` and is excluded in `robots.txt`.

## 🧭 Project structure

```
src/
  app/                    # Next.js App Router
    (site)/                # public routes: /, /about, /projects, /gallery,
                          # /blog, /skills, /experience, /connect
    admin/page.tsx        # hidden admin route — unlinked, noindex
    api/admin/            # login / content CRUD / analytics (server-side)
    api/contact/          # contact form → Resend → your inbox
    api/email-forward/    # Resend inbound webhook → forward to Gmail
  components/
    site/                 # StarfieldBackground (atmosphere stack: Vanta net +
                          # nebulas + starfield), VantaBackground, Hero, About,
                          # Projects, Gallery (masonry + lightbox), Blog
                          # (markdown + hash routes), Skills, Experience,
                          # SocialLinks, ContactForm, Navbar, Footer...
    admin/                # AdminApp (login + shell) + tabs/
                          #   Overview (charts), Pages (visibility + order), Profile,
                          #   Badges (About cards), Terminal (hero window), Blog
                          #   (markdown editor), Projects, Photos, Links,
                          #   Skills, Experience
  lib/
    store/                # dual data layer: local-store (demo) + supabase-store (prod)
    types.ts, seed.ts     # types & default content (Akila's starter persona)
    icons.tsx             # coloured brand icons registry (34 platforms)
    markdown.tsx          # dependency-free markdown renderer for blog posts
    site-context.tsx      # loads data, tracks the visit once per session
public/
  icons/                  # coloured brand SVGs (from dheereshag/coloured-icons)
  samples/                # 12 starter gallery images
supabase/schema.sql       # one-shot database setup
```

## ⚙️ Notes

- **Demo mode** (no env vars): content & analytics live in `localStorage` — perfect for trying the admin dashboard locally. Real mode activates automatically once Supabase env vars exist. Same for email: without `RESEND_API_KEY` the contact form shows a friendly "email me directly" fallback instead of failing silently.
- The public site spans `/` plus one route per section; the admin dashboard lives at `/admin` and is deliberately unlinked. Both deploy to Vercel as-is.
- Re-running `supabase/schema.sql` is safe — inserts use `on conflict do nothing`.
- To reset demo data: browser DevTools → Application → Local Storage → delete `cosmosfolio_*` keys.
- Placeholder content you'll want to personalise (all editable in the admin): the social URLs (`github.com/akilamaduranga`, `wa.me/94700000000`, …), the email address, and the demo projects/skills/experience entries.

---

Made with 💜 among the stars · **Onyx `#01010D` · Indigo `#6331FB` · Mint `#88F9C0`**
