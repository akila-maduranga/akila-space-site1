-- ═══════════════════════════════════════════════════════════════════
--  AKILA'S CORNER OF THE INTERNET — Supabase schema
--  Space-themed personal portfolio with visitor & click tracking,
--  a blog, and per-section page visibility.
--
--  HOW TO USE:
--  1. Create a project at https://supabase.com (free tier works)
--  2. Open SQL Editor → New query → paste this entire file → Run
--  3. Copy the Project URL + anon key + service_role key into your
--     .env.local / Vercel environment variables (see README.md)
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────
--  CONTENT TABLES (edited via the admin dashboard at /admin)
-- ───────────────────────────────────────────────

create table if not exists public.profile (
  id               text primary key default 'profile-1',
  name             text not null default 'Your Name',
  title            text not null default 'Tech Enthusiast',
  tagline          text not null default '',
  roles            text[] not null default '{}',
  bio              text not null default '',
  bio_short        text not null default '',
  location         text not null default '',
  email            text not null default '',
  avatar_url       text not null default '',
  resume_url       text not null default '',
  available        boolean not null default true,
  years_experience int not null default 0,
  r2_base_url      text not null default ''
);

-- add columns when upgrading an existing database
alter table public.profile add column if not exists r2_base_url text not null default '';

create table if not exists public.projects (
  id          text primary key,
  title       text not null,
  description text not null default '',
  image_url   text not null default '',
  gradient    int not null default 0,
  tech        text[] not null default '{}',
  live_url    text not null default '',
  repo_url    text not null default '',
  featured    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.projects add column if not exists visible boolean not null default true;

create table if not exists public.social_links (
  id         text primary key,
  platform   text not null default 'website',
  label      text not null,
  url        text not null,
  sort_order int not null default 0,
  clicks     int not null default 0
);
alter table public.social_links add column if not exists visible boolean not null default true;

create table if not exists public.skills (
  id         text primary key,
  name       text not null,
  category   text not null default 'Other',
  level      int not null default 50 check (level between 0 and 100),
  sort_order int not null default 0
);
alter table public.skills add column if not exists visible boolean not null default true;

-- photo gallery (images usually served from Cloudflare R2)
create table if not exists public.photos (
  id         text primary key,
  title      text not null,
  caption    text not null default '',
  category   text not null default 'Landscape',
  image_url  text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.photos add column if not exists visible boolean not null default true;

create table if not exists public.experiences (
  id          text primary key,
  role        text not null,
  company     text not null,
  description text not null default '',
  start_date  text not null default '',
  end_date    text not null default '',
  current     boolean not null default false,
  sort_order  int not null default 0
);
alter table public.experiences add column if not exists visible boolean not null default true;

-- blog posts (markdown-ish content, edited from the admin dashboard)
create table if not exists public.posts (
  id             text primary key,
  title          text not null,
  slug           text not null,
  excerpt        text not null default '',
  content        text not null default '',
  cover_image_url text not null default '',
  tags           text[] not null default '{}',
  published_at   text not null default '',
  created_at     timestamptz not null default now(),
  visible        boolean not null default true
);
-- upgrade path: older databases may predate the visible flag; the seed
-- inserts below reference it, so make sure it exists first.
alter table public.posts add column if not exists visible boolean not null default true;
create index if not exists posts_published_idx on public.posts (published_at desc);

-- page sections — toggle each part of the home page on/off from admin
create table if not exists public.page_sections (
  key         text primary key,
  label       text not null,
  description text not null default '',
  visible     boolean not null default true,
  sort_order  int not null default 0
);

-- about-page badges ("currently into", "cameras owned", ...) — edited
-- from the admin dashboard's Badges tab (v2.3)
create table if not exists public.facts (
  id         text primary key,
  icon       text not null default 'sparkles',
  label      text not null,
  value      text not null default '',
  sort_order int not null default 0,
  visible    boolean not null default true
);

-- hero terminal window lines ("$ whoami", "$ cat about.txt", ...) —
-- edited from the admin dashboard's Terminal tab (v2.4)
create table if not exists public.terminal_lines (
  id         text primary key,
  command    text not null,
  output     text not null default '',
  color      text not null default 'starlight',
  sort_order int not null default 0,
  visible    boolean not null default true
);

-- ───────────────────────────────────────────────
--  ANALYTICS TABLES (written via RPCs only)
-- ───────────────────────────────────────────────

create table if not exists public.visitors (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  text not null unique,
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  page_views  int not null default 1,
  referrer    text not null default 'direct',
  device      text not null default 'desktop',
  country     text not null default 'unknown'
);
-- UPGRADE PATH (databases set up before country tracking): on an existing
-- database `create table if not exists` above is a no-op, so the country
-- column must be added HERE — before any index or function below touches
-- it. (Creating the index first is exactly what made re-running this file
-- fail with 42703 "column \"country\" does not exist".)
alter table public.visitors add column if not exists country text not null default 'unknown';
create index if not exists visitors_last_seen_idx on public.visitors (last_seen desc);
create index if not exists visitors_referrer_idx on public.visitors (referrer);

create table if not exists public.pageviews (
  id          uuid primary key default gen_random_uuid(),
  viewed_at   timestamptz not null default now(),
  visitor_id  text not null default '',
  -- plain column with a UTC default. (A GENERATED column can't be used here:
  -- casting timestamptz -> date depends on the session timezone, so Postgres
  -- rejects it with "generation expression is not immutable" (42P17).
  -- A DEFAULT is allowed to be timezone-dependent, so this is the safe form.)
  view_date   date not null default ((now() at time zone 'UTC')::date)
);
create index if not exists pageviews_date_idx on public.pageviews (view_date);

create table if not exists public.link_clicks (
  id         uuid primary key default gen_random_uuid(),
  link_id    text not null default '',
  platform   text not null default 'other',
  clicked_at timestamptz not null default now(),
  visitor_id text not null default '',
  country    text not null default 'unknown'
);
-- UPGRADE PATH: same guard — the column must exist before the country
-- index below is created on a pre-country database.
alter table public.link_clicks add column if not exists country text not null default 'unknown';
create index if not exists link_clicks_clicked_at_idx on public.link_clicks (clicked_at desc);
create index if not exists link_clicks_platform_idx on public.link_clicks (platform);
create index if not exists link_clicks_country_idx on public.link_clicks (country);

-- admin login brute-force protection (v2.2): 3 failed passwords → 24h lock.
-- only the service role touches this table (no RLS policies for anon);
-- it stores a salted SHA-256 hash of the IP, never the IP itself.
create table if not exists public.admin_auth_attempts (
  ip_hash      text primary key,
  failed_count int not null default 0,
  locked_until timestamptz,
  last_attempt_at timestamptz not null default now()
);
alter table public.admin_auth_attempts enable row level security;
revoke all on public.admin_auth_attempts from anon, authenticated;

-- (the country upgrade ALTERs now live directly after each analytics
--  table's CREATE — before the indexes and functions that reference the
--  column; that ordering is what makes re-runs on older databases work)

-- ───────────────────────────────────────────────
--  ROW LEVEL SECURITY
--  • everyone can READ content (anon key — the public site needs it)
--  • nobody can WRITE content directly (admin writes go through
--    Next.js API routes using the service_role key, which bypasses RLS)
--  • analytics tables are only touched through the RPCs below
-- ───────────────────────────────────────────────

alter table public.profile        enable row level security;
alter table public.projects       enable row level security;
alter table public.social_links   enable row level security;
alter table public.skills         enable row level security;
alter table public.experiences    enable row level security;
alter table public.photos         enable row level security;
alter table public.posts          enable row level security;
alter table public.page_sections  enable row level security;
alter table public.facts          enable row level security;
alter table public.terminal_lines enable row level security;
alter table public.visitors       enable row level security;
alter table public.pageviews      enable row level security;
alter table public.link_clicks    enable row level security;

drop policy if exists "public read profile"       on public.profile;
drop policy if exists "public read projects"      on public.projects;
drop policy if exists "public read social_links"  on public.social_links;
drop policy if exists "public read skills"        on public.skills;
drop policy if exists "public read experiences"   on public.experiences;
drop policy if exists "public read photos"        on public.photos;
drop policy if exists "public read posts"         on public.posts;
drop policy if exists "public read page_sections" on public.page_sections;
drop policy if exists "public read facts"         on public.facts;
drop policy if exists "public read terminal_lines" on public.terminal_lines;

create policy "public read profile"       on public.profile       for select to anon, authenticated using (true);
create policy "public read projects"      on public.projects      for select to anon, authenticated using (true);
create policy "public read social_links"  on public.social_links  for select to anon, authenticated using (true);
create policy "public read skills"        on public.skills        for select to anon, authenticated using (true);
create policy "public read experiences"   on public.experiences   for select to anon, authenticated using (true);
create policy "public read photos"        on public.photos        for select to anon, authenticated using (true);
create policy "public read posts"         on public.posts         for select to anon, authenticated using (true);
create policy "public read page_sections" on public.page_sections for select to anon, authenticated using (true);
create policy "public read facts"         on public.facts         for select to anon, authenticated using (true);
create policy "public read terminal_lines" on public.terminal_lines for select to anon, authenticated using (true);

-- ───────────────────────────────────────────────
--  TRACKING RPCs (callable with the anon key)
--  security definer → they bypass RLS safely with fixed logic
-- ───────────────────────────────────────────────

create or replace function public.track_visit(p_visitor_id text, p_referrer text, p_device text, p_country text default 'unknown')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor_id is null or p_visitor_id = '' then
    return;
  end if;

  insert into public.visitors (visitor_id, referrer, device, page_views, country)
  values (p_visitor_id, coalesce(nullif(p_referrer, ''), 'direct'), coalesce(nullif(p_device, ''), 'desktop'), 1, coalesce(nullif(p_country, ''), 'unknown'))
  on conflict (visitor_id) do update
    set last_seen  = now(),
        page_views = public.visitors.page_views + 1,
        country    = case when public.visitors.country = 'unknown'
                          then coalesce(nullif(p_country, ''), 'unknown')
                          else public.visitors.country end;

  insert into public.pageviews (visitor_id) values (p_visitor_id);
end;
$$;

-- (re)create with the country parameter — drop the old 3-arg forms
-- first so only one version of each function exists.
drop function if exists public.track_visit(text, text, text);
drop function if exists public.track_link_click(text, text, text);
create or replace function public.track_link_click(p_link_id text, p_platform text, p_visitor_id text, p_country text default 'unknown')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.link_clicks (link_id, platform, visitor_id, country)
  values (coalesce(p_link_id, ''), coalesce(nullif(p_platform, ''), 'other'), coalesce(p_visitor_id, ''), coalesce(nullif(p_country, ''), 'unknown'));

  if p_link_id is not null and p_link_id <> '' then
    update public.social_links
    set clicks = clicks + 1
    where id = p_link_id;
  end if;
end;
$$;

-- ───────────────────────────────────────────────
--  ANALYTICS RPCs (used by the admin dashboard
--  via Next.js API routes with the service_role key)
-- ───────────────────────────────────────────────

create or replace function public.visitors_by_day(p_days int default 30)
returns table (date date, visitors bigint, views bigint)
language sql
stable
security definer
set search_path = public
as $$
  select gs::date as date,
         (select count(distinct pv.visitor_id) from public.pageviews pv
           where pv.view_date = gs::date)::bigint as visitors,
         (select count(*) from public.pageviews pv
           where pv.view_date = gs::date)::bigint as views
  -- series is anchored on UTC midnight so the days line up with view_date
  -- (and with the dashboard's UTC date keys) whatever the session timezone
  from generate_series(
    (now() at time zone 'UTC')::date - (greatest(coalesce(p_days, 30), 1) - 1),
    (now() at time zone 'UTC')::date,
    interval '1 day'
  ) gs
$$;

create or replace function public.clicks_by_link(p_days int default 30)
returns table (platform text, clicks bigint)
language sql
stable
security definer
set search_path = public
as $$
  select platform, count(*)::bigint as clicks
  from public.link_clicks
  where clicked_at >= now() - (greatest(coalesce(p_days, 30), 1) || ' days')::interval
  group by platform
  order by clicks desc
$$;

create or replace function public.top_referrers(p_days int default 30, p_limit int default 6)
returns table (referrer text, count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select referrer, count(*)::bigint as count
  from public.visitors
  where first_seen >= now() - (greatest(coalesce(p_days, 30), 1) || ' days')::interval
  group by referrer
  order by count desc
  limit greatest(coalesce(p_limit, 6), 1)
$$;

create or replace function public.device_breakdown(p_days int default 30)
returns table (device text, count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select device, count(*)::bigint as count
  from public.visitors
  where first_seen >= now() - (greatest(coalesce(p_days, 30), 1) || ' days')::interval
  group by device
  order by count desc
$$;

-- clicks by country (anonymous, ISO-3166 alpha-2 lowercase or 'unknown')
create or replace function public.top_countries(p_days int default 30, p_limit int default 8)
returns table (country text, count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select country, count(*)::bigint as count
  from public.link_clicks
  where clicked_at >= now() - (greatest(coalesce(p_days, 30), 1) || ' days')::interval
  group by country
  order by count desc
  limit greatest(coalesce(p_limit, 8), 1)
$$;

-- allow anonymous visitors to run the tracking RPCs (4-arg signatures;
-- country defaults to 'unknown' when a client omits it)
grant execute on function public.track_visit(text, text, text, text)      to anon, authenticated;
grant execute on function public.track_link_click(text, text, text, text) to anon, authenticated;

-- ───────────────────────────────────────────────
--  SEED CONTENT (safe to re-run — skips existing rows)
-- ───────────────────────────────────────────────

insert into public.profile (id, name, title, tagline, roles, bio, bio_short, location, email, avatar_url, resume_url, available, years_experience, r2_base_url)
values (
  'profile-1',
  'Akila Maduranga',
  'Tech Enthusiast & Hobbyist Photographer',
  'I build things for fun, take photos because I can''t help it, and write about whatever I''m into lately.',
  array['tech enthusiast','hobbyist photographer','weekend builder','terminal dweller','tea drinker'],
  'I''m Akila — and no, I''m not a professional developer or a professional photographer. I''m just someone who genuinely likes making things.' || chr(10) || chr(10) || 'By night I''m usually in a terminal somewhere: little web experiments, scripts that fix problems only I have, and a home server that stays up most of the time. On weekends I carry a camera around Sri Lanka — hills, coast, streets, the occasional night sky — and I''ve stopped pretending I''ll ever sort the photo library properly.' || chr(10) || chr(10) || 'This site is one of my favourite experiments so far. I built the whole thing myself: the animations, the admin panel where I edit everything, even the words you''re reading right now. It broke many times along the way. That''s kind of the fun part.',
  'Enthusiast, not professional. I code for fun, photograph everything else, and built this whole site myself — from Sri Lanka, with a lot of tea.',
  'Sri Lanka',
  'hello@akilamaduranga.dev',
  '',
  '',
  true,
  5,
  ''
)
on conflict (id) do nothing;

insert into public.projects (id, title, description, image_url, gradient, tech, live_url, repo_url, featured, sort_order, visible)
values
  ('proj-this-site', 'This Very Website', 'The site you''re looking at, actually. Next.js underneath, an animated starfield drawn on a canvas, and an admin panel so I can edit every word and photo without touching code. It took a few weekends, several rewrites of this exact paragraph, and one unfortunate incident where I deleted the whole thing at 2 AM.', '', 0, array['Next.js','TypeScript','Tailwind CSS','Supabase'], '', '', true,  0, true),
  ('proj-photo-pipeline', 'SD Card Rescue Script', 'A small pipeline that grabs photos off my SD cards, sorts them by date and place, backs them up, and pushes the keepers to cloud storage. Built it because doing this by hand got old around trip number three. It has saved roughly 40 GB of holiday memories so far.', '', 1, array['Python','Cloudflare R2','Bash'], '', '', false, 1, true),
  ('proj-home-server', 'The Immortal Home Server', 'An old PC that refused to die, so now it runs my files, my backups and a couple of self-hosted apps. Current uptime record: 47 days. Current record after I tripped over the power cable: 0 minutes. Learning Docker one broken container at a time.', '', 2, array['Linux','Docker','Self-hosting'], '', '', false, 2, true)
on conflict (id) do nothing;

insert into public.social_links (id, platform, label, url, sort_order, clicks, visible)
values
  ('link-github',    'github',    'GitHub',      'https://github.com/akilamaduranga',     0, 0, true),
  ('link-linkedin',  'linkedin',  'LinkedIn',    'https://linkedin.com/in/akilamaduranga', 1, 0, true),
  ('link-instagram', 'instagram', 'Instagram',   'https://instagram.com/akila.frames',     2, 0, true),
  ('link-x',         'x',         'X / Twitter', 'https://x.com/akilamaduranga',           3, 0, true),
  ('link-youtube',   'youtube',   'YouTube',     'https://youtube.com/@akilamaduranga',    4, 0, true),
  ('link-whatsapp',  'whatsapp',  'WhatsApp',    'https://wa.me/94700000000',             5, 0, true),
  ('link-email',     'email',     'Email',       'mailto:hello@akilamaduranga.dev',        6, 0, true)
on conflict (id) do nothing;

insert into public.skills (id, name, category, level, sort_order, visible)
values
  ('skill-html',      'HTML & CSS',    'Frontend', 72, 0,  true),
  ('skill-js',        'JavaScript',    'Frontend', 62, 1,  true),
  ('skill-react',     'React',         'Frontend', 55, 2,  true),
  ('skill-tw',        'Tailwind CSS',  'Frontend', 68, 3,  true),
  ('skill-node',      'Node.js',       'Backend',  45, 4,  true),
  ('skill-sb',        'Supabase',      'Backend',  52, 5,  true),
  ('skill-pg',        'PostgreSQL',    'Backend',  38, 6,  true),
  ('skill-py',        'Python',        'Backend',  48, 7,  true),
  ('skill-git',       'Git',           'Tools',    60, 8,  true),
  ('skill-vscode',    'VS Code',       'Tools',    92, 9,  true),
  ('skill-linux',     'Linux',         'Tools',    50, 10, true),
  ('skill-docker',    'Docker',        'Tools',    32, 11, true),
  ('skill-lightroom', 'Lightroom',     'Tools',    65, 12, true)
on conflict (id) do nothing;

insert into public.experiences (id, role, company, description, start_date, end_date, current, sort_order, visible)
values
  ('exp-1', 'A computer I could take apart',  'where the curiosity started', 'It was slow, it was loud, and I took it apart more times than anyone appreciated. That''s roughly when I learned that breaking things is just learning with extra steps.', '2010', '',     false, 0, true),
  ('exp-2', 'First proper camera',            'the photography bug',         'A hand-me-down with one working lens and a shutter that stuck sometimes. I shot terrible photos of everything for months. Some of them are still my favourites.',                   '2018', '',     false, 1, true),
  ('exp-3', 'Started building for the web',   'one index.html at a time',    'My first page was a disaster of marquee tags and broken images, and I was ridiculously proud of it. Still get that exact feeling every time something I build actually works.',    '2021', '',     false, 2, true),
  ('exp-4', 'Built this whole site',          'current obsession',           'Designed it, animated it, wired the database, wrote the words. Somewhere along the way it stopped being a project and became the place I put things I make.',                        '2025', '',     true,  3, true)
on conflict (id) do nothing;

-- starter photo gallery (local sample images that ship with the site;
-- replace them with your Cloudflare R2 URLs from the admin dashboard)
insert into public.photos (id, title, caption, category, image_url, sort_order, visible)
values
  ('photo-astro-1',  'Milky Way, 3 AM',            'Pointed the camera up on a clear night and got lucky. Worth losing the sleep.',                          'Night Sky', '/samples/astro-milkyway.jpg',   0,  true),
  ('photo-astro-2',  'Galaxy Hunting',             'Not an astrophotographer by any stretch — I just really like pointing at things in the sky.',            'Night Sky', '/samples/astro-galaxy.jpg',    1,  true),
  ('photo-astro-3',  'Stars Over Nowhere',         'Drove out past the last street light and waited for my eyes to adjust.',                                  'Night Sky', '/samples/astro-stellar.jpg',   2,  true),
  ('photo-land-1',   'Tea Country Mornings',       'Fog rolling through the hills like a slow tide. Stood there until the tea got cold.',                    'Landscape', '/samples/srilanka-tea.jpg',    3,  true),
  ('photo-land-2',   'Layers of Green',            'Somewhere on the road to the peaks, pulled over for the fifth time in an hour.',                         'Landscape', '/samples/srilanka-hills.jpg',  4,  true),
  ('photo-land-3',   'Southern Coast, Golden Hour','Salt air, warm light and absolutely no rush to be anywhere.',                                            'Landscape', '/samples/srilanka-coast.jpg',  5,  true),
  ('photo-port-1',   'The Muse',                   'Natural light, quiet expression, one patient friend.',                                                    'Portrait',  '/samples/portrait-muse.jpg',    6,  true),
  ('photo-port-2',   'Last Ten Minutes of Light',  'The most honest light of the day — if you can catch it.',                                                 'Portrait',  '/samples/portrait-golden.jpg', 7,  true),
  ('photo-port-3',   'Studio Session',             'One light, one shadow, one story. Mostly improvised.',                                                    'Portrait',  '/samples/portrait-studio.jpg', 8,  true),
  ('photo-street-1', 'Neon District',              'The city writes its own captions at night — I just carry the camera.',                                    'Street',    '/samples/street-neon.jpg',     9,  true),
  ('photo-street-2', 'After the Rain',             'For a few minutes after the rain stops, every street gets a second copy of itself.',                      'Street',    '/samples/street-rain.jpg',     10, true),
  ('photo-street-2b','City Pulse',                 'Long exposure traffic trails. The heartbeat of a city that never fully sleeps.',                          'Street',    '/samples/street-nightcity.jpg', 11, true)
on conflict (id) do nothing;

-- starter blog posts (edit or delete them from the admin dashboard)
insert into public.posts (id, title, slug, excerpt, content, cover_image_url, tags, published_at, visible)
values
  (
    'post-hello-internet',
    'Hello, internet',
    'hello-internet',
    'First post. Why this site exists, what I''ll be posting about, and a small promise to my future self.',
    'So I finally did the thing.' || chr(10) || chr(10) || 'For years my "website" was a half-finished `index.html` sitting in a folder called `new_website_FINAL_v3`. You know the one. Every few months I''d open it, sigh at it, and close it again.' || chr(10) || chr(10) || 'This time I actually shipped.' || chr(10) || chr(10) || '## Why bother with a website?' || chr(10) || chr(10) || 'Honestly? Because it''s mine. Social feeds come and go, algorithms change, and half my photos are trapped in an app I no longer open. A personal site is a small corner of the internet that answers to nobody but me. I wanted a place to put:' || chr(10) || chr(10) || '- little projects I''m tinkering with' || chr(10) || '- photos I''m genuinely happy with' || chr(10) || '- notes like this one, about whatever I''m currently obsessed with' || chr(10) || chr(10) || '## What you can expect' || chr(10) || chr(10) || 'No schedule, no theme, no growth strategy. I''ll write when there''s something worth writing — a project that worked, a project that spectacularly didn''t, a photo trip worth retelling, or a thing I learned the hard way so you don''t have to.' || chr(10) || chr(10) || '> Fair warning: I''m an enthusiast, not an expert. Take everything here as "stuff that worked for me", not gospel.' || chr(10) || chr(10) || '## A note to future me' || chr(10) || chr(10) || 'If you''re reading this years later and cringing — good. That means I kept learning.' || chr(10) || chr(10) || 'See you around,' || chr(10) || '**Akila**',
    '',
    array['meta','first post'],
    (current_date - 3)::text,
    true
  ),
  (
    'post-built-this-site',
    'I built this site from scratch (and you can poke around)',
    'built-this-site-from-scratch',
    'The story of this website — the stack, the mistakes, the 2 AM deletion incident, and why the admin panel is my favourite part.',
    'This site is my favourite project so far, which is funny because it''s also the project where I made the most mistakes.' || chr(10) || chr(10) || '## The short version' || chr(10) || chr(10) || 'It''s built with **Next.js**, styled with **Tailwind**, animated with more enthusiasm than restraint, and backed by **Supabase** — which quietly counts visitors and link clicks in the background. (Only I can see those numbers, so click freely.)' || chr(10) || chr(10) || 'The animated starfield you see behind everything? That''s a `<canvas>` and about 200 lines of JavaScript pretending to be a galaxy:' || chr(10) || chr(10) || '```js' || chr(10) || '// the whole trick is smaller than it looks' || chr(10) || 'for (const star of stars) {' || chr(10) || '  const alpha = star.baseAlpha * (0.55 + 0.45 * Math.sin(t + star.phase));' || chr(10) || '  ctx.fillStyle = `rgba(136, 249, 192, ${alpha})`; // mint, obviously' || chr(10) || '  ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);' || chr(10) || '}' || chr(10) || '```' || chr(10) || chr(10) || '## The colours were decided before anything else' || chr(10) || chr(10) || 'Onyx black `#01010D`, electric indigo `#6331FB`, tropical mint `#88F9C0`. Once those three were locked in, every other decision basically made itself. Dark background, mint for anything alive, indigo for anything structural.' || chr(10) || chr(10) || '## The admin panel is the best part' || chr(10) || chr(10) || 'There''s a hidden dashboard at `/admin` where I can rewrite every paragraph, add photos, reorder sections, toggle pages on and off, and publish these very posts — all without redeploying. Writing blog posts in a form beats fighting a CMS any day of the week.' || chr(10) || chr(10) || '## The 2 AM incident' || chr(10) || chr(10) || 'At one point I ran a cleanup command that was slightly too confident, and the entire project folder went to the big /dev/null in the sky. An evening of panic, a lesson about backups, and — eventually — a rebuild that came out better than the original. The photo backup script you''ll see in my projects list? That exists *because* of this night.' || chr(10) || chr(10) || 'Anyway — poke around, click things, and if something looks broken, it probably is. Tell me about it and I''ll fix it live, like a proper hobbyist.' || chr(10) || chr(10) || '— **A.**',
    '',
    array['site','next.js','behind the scenes'],
    (current_date - 1)::text,
    true
  )
on conflict (id) do nothing;

-- page sections: toggle each part of the home page on/off from admin
insert into public.page_sections (key, label, description, visible, sort_order)
values
  ('about',      'About',      'Who I am, in slightly too many words',            true, 0),
  ('projects',   'Projects',   'Things I''ve built — some useful, some just fun',  true, 1),
  ('gallery',    'Gallery',    'Photos I''m happy with',                        true, 2),
  ('blog',       'Blog',       'Notes and updates on new stuff I''m doing',        true, 3),
  ('skills',     'Skills',     'Stuff I use — no certificates, just curiosity',   true, 4),
  ('experience', 'Journey',    'How I ended up here — a short timeline',           true, 5),
  ('connect',    'Connect',    'Where to find me online',                         true, 6)
on conflict (key) do nothing;

-- starter about-page badges (edit them from the admin dashboard → Badges)
insert into public.facts (id, icon, label, value, sort_order, visible)
values
  ('fact-1', 'laptop',   'currently into', 'next.js, self-hosting & old lenses',    0, true),
  ('fact-2', 'camera',   'cameras owned',  'more than I need, fewer than I want',   1, true),
  ('fact-3', 'moonstar', 'weekend status', 'out shooting somewhere in the hills',  2, true),
  ('fact-4', 'coffee',   'fuel of choice', 'plain tea, three sugars',               3, true)
on conflict (id) do nothing;

-- starter hero terminal lines (edit them from the admin dashboard → Terminal;
-- {{photos}} and friends are replaced with live numbers on the site)
insert into public.terminal_lines (id, command, output, color, sort_order, visible)
values
  ('term-1', 'whoami',                  'enthusiast · tinkerer · guy with a camera',        'starlight', 0, true),
  ('term-2', 'cat about.txt',           '"not a pro — just really into this stuff"',      'indigo',    1, true),
  ('term-3', 'ls ./current_obsessions', 'nextjs/  cameras/  selfhosting/  tea/',            'starlight', 2, true),
  ('term-4', 'ls ./gallery | wc -l',    '✦ {{photos}} photos and counting ✦',             'mint',      3, true)
on conflict (id) do nothing;

-- UPGRADE PATH (databases set up before v2.4): the terminal window title
-- is a new optional profile column — add it before the app writes to it.
alter table public.profile add column if not exists terminal_title text not null default '';

-- ═════════════════════════════════════════════════════════════
--  one-time migration (only for databases set up before the
--  section was renamed) — flips the old "photography" key
--  to "gallery" so the site keeps showing the section
-- ═══════════════════════════════════════════════════════════
-- guarded: when the seed above already inserted a "gallery" row (any
-- database set up after the rename), a plain UPDATE would crash into
-- the primary key — so rename only while "gallery" is still free, and
-- drop the stale "photography" row otherwise.
update public.page_sections
   set key = 'gallery',
       label = case when label = 'Photography' then 'Gallery' else label end
 where key = 'photography'
   and not exists (select 1 from public.page_sections where key = 'gallery');
delete from public.page_sections where key = 'photography';

-- ═══════════════════════════════════════════════════════════════════
--  DONE! Tables, security, tracking functions and starter content
--  are ready. Next step: set the env vars listed in .env.example.
-- ═══════════════════════════════════════════════════════════════════
