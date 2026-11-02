"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Eye,
  Globe,
  Link2,
  Loader2,
  Monitor,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { Analytics, ServerStatus } from "@/lib/types";
import { getStore } from "@/lib/store";
import { useSite } from "@/lib/site-context";
import { PlatformIcon } from "@/lib/icons";

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(7,7,22,0.95)",
  border: "1px solid rgba(139,107,255,0.3)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e8e6f5",
  boxShadow: "0 10px 40px rgba(99,49,251,0.35)",
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delay,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  hint: string;
  delay: number;
}) {
  return (
    <div
      className="glass card-hover glow-border rounded-2xl p-5"
      style={{ animation: `rise 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s both` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="font-display mt-2 text-3xl font-bold text-starlight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="mt-1 font-mono text-[10px] text-mint/70">{hint}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo/25 to-mint/10 text-mint shadow-[0_0_20px_rgba(99,49,251,0.25)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function flagFor(code: string): string {
  if (!/^[a-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  );
}

export default function OverviewTab() {
  const { mode, readError } = useSite();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStore().getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // server config health — tells you exactly WHY edits wouldn't save
  const loadStatus = async () => {
    try {
      const token =
        typeof window !== "undefined" ? sessionStorage.getItem("cosmosfolio_admin_token") : null;
      const res = await fetch("/api/admin/status", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setStatus((await res.json()) as ServerStatus);
    } catch {
      /* status is advisory only */
    }
  };

  useEffect(() => {
    load();
    loadStatus();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="grid h-64 place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-mint" />
          <p className="font-mono text-xs text-muted-foreground">scanning deep space telemetry...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="font-mono text-sm text-[#ff5d7a]">✗ {error}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Make sure supabase/schema.sql was run and env vars are set.
        </p>
        <Button onClick={load} size="sm" className="mt-4 bg-indigo font-mono text-xs hover:bg-indigo/80">
          <RefreshCw className="h-3.5 w-3.5" /> retry
        </Button>
      </div>
    );
  }

  if (!analytics) return null;

  const deviceIcons: Record<string, typeof Monitor> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
  };

  const totalDevices = analytics.deviceBreakdown.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-starlight">Telemetry Dashboard</h2>
          <p className="font-mono text-xs text-muted-foreground">
            visitors · page views · link clicks — last 30 cycles
          </p>
        </div>
        <Button
          onClick={load}
          size="sm"
          variant="outline"
          className="border-indigo/25 font-mono text-xs text-muted-foreground hover:border-mint/40 hover:text-mint"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          refresh
        </Button>
      </div>

      {/* system status — surfaces exactly why edits would (not) save,
          why the public site wouldn't update, or why the dashboard itself
          is falling back to demo content */}
      {mode === "local" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#e8b84a]/30 bg-[#e8b84a]/[0.06] p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#e8b84a]" />
          <div>
            <p className="font-display text-sm font-semibold text-starlight">
              Demo mode — edits save to this browser only
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              The site is running without Supabase env vars, so content lives in localStorage on
              this device. To persist edits for every visitor, set the four variables from{" "}
              <code className="text-mint">.env.example</code> in Vercel → Settings → Environment
              Variables and redeploy.
            </p>
          </div>
        </div>
      ) : status && (!status.serviceConfigured || !status.dbReachable || !status.tablesPresent || !status.writeProbeOk || status.serviceKeyRole === "anon") ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#ff5d7a]/30 bg-[#ff5d7a]/[0.06] p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5d7a]" />
          <div>
            <p className="font-display text-sm font-semibold text-starlight">
              Edits are NOT saving —{" "}
              {!status.serviceConfigured
                ? "server env vars missing"
                : status.serviceKeyRole === "anon"
                  ? "wrong key in SUPABASE_SERVICE_ROLE_KEY"
                  : !status.dbReachable
                    ? "can't reach the database"
                    : !status.tablesPresent
                      ? "database not set up (run supabase/schema.sql)"
                      : "the service key can't write"}
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {status.detail}
            </p>
          </div>
        </div>
      ) : status && status.anonReadable === false ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#e8b84a]/30 bg-[#e8b84a]/[0.06] p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#e8b84a]" />
          <div>
            <p className="font-display text-sm font-semibold text-starlight">
              The public site can&apos;t read your database
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {status.detail}
            </p>
          </div>
        </div>
      ) : readError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#e8b84a]/30 bg-[#e8b84a]/[0.06] p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#e8b84a]" />
          <div>
            <p className="font-display text-sm font-semibold text-starlight">
              This browser can&apos;t read the database — demo content shown
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Server-side checks passed, but reads from the browser failed: {readError}. If this
              persists, make sure NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY were
              set before the last deploy (NEXT_PUBLIC_* values are baked in at build time), and
              re-run supabase/schema.sql to restore the read policies.
            </p>
          </div>
        </div>
      ) : mode === "supabase" && status ? (
        <div className="flex items-start gap-3 rounded-2xl border border-mint/25 bg-mint/[0.05] p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
          <div>
            <p className="font-display text-sm font-semibold text-starlight">
              Systems nominal — Supabase connected
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {status.detail}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="unique visitors" value={analytics.totalVisitors} hint="signals detected" delay={0} />
        <StatCard icon={Eye} label="page views" value={analytics.totalPageViews} hint="total observations" delay={0.06} />
        <StatCard icon={Link2} label="link clicks" value={analytics.totalClicks} hint="outbound transmissions" delay={0.12} />
        <StatCard icon={Activity} label="tracked links" value={analytics.clicksByLink.length} hint="active channels" delay={0.18} />
      </div>

      <div className="glass glow-border rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-starlight">
            Visitor Orbit — last 30 days
          </h3>
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_8px_rgba(136,249,192,0.8)]" />
              visitors
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-soft" />
              views
            </span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.visitorsByDay} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#88F9C0" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#88F9C0" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6331FB" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6331FB" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(139,107,255,0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8a88a8", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(139,107,255,0.2)" }}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#8a88a8", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(136,249,192,0.3)" }} />
              <Area type="monotone" dataKey="views" stroke="#6331FB" strokeWidth={2} fill="url(#gViews)" />
              <Area type="monotone" dataKey="visitors" stroke="#88F9C0" strokeWidth={2} fill="url(#gVisitors)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="glass glow-border rounded-2xl p-5">
          <h3 className="font-display mb-4 text-sm font-semibold text-starlight">
            Click Signals by Channel
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.clicksByLink}
                margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid stroke="rgba(139,107,255,0.1)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#8a88a8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={110}
                  tick={{ fill: "#8a88a8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(99,49,251,0.12)" }} />
                <Bar dataKey="clicks" radius={[0, 8, 8, 0]} barSize={18}>
                  {analytics.clicksByLink.map((entry, i) => (
                    <Cell
                      key={entry.platform}
                      fill={i % 2 === 0 ? "#6331FB" : "#88F9C0"}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass glow-border rounded-2xl p-5">
            <h3 className="font-display mb-4 text-sm font-semibold text-starlight">
              Origin Systems
            </h3>
            <div className="space-y-3">
              {analytics.topReferrers.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">no referrer data yet</p>
              ) : (
                analytics.topReferrers.map((ref) => {
                  const max = analytics.topReferrers[0].count || 1;
                  return (
                    <div key={ref.referrer}>
                      <div className="mb-1 flex justify-between font-mono text-[11px]">
                        <span className="text-starlight/90">{ref.referrer}</span>
                        <span className="text-muted-foreground">{ref.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo to-mint"
                          style={{ width: `${(ref.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass glow-border rounded-2xl p-5">
            <h3 className="font-display mb-4 flex items-center gap-2 text-sm font-semibold text-starlight">
              <Globe className="h-3.5 w-3.5 text-mint" />
              Signal Origins
            </h3>
            <div className="space-y-3">
              {analytics.topCountries?.length ? (
                analytics.topCountries.map((c) => {
                  const max = analytics.topCountries[0].count || 1;
                  const flag = flagFor(c.country);
                  return (
                    <div key={c.country}>
                      <div className="mb-1 flex justify-between font-mono text-[11px]">
                        <span className="flex items-center gap-1.5 text-starlight/90">
                          {flag ? (
                            <span aria-hidden>{flag}</span>
                          ) : (
                            <Globe className="h-3 w-3 text-muted-foreground" />
                          )}
                          {c.country === "unknown" ? "unidentified" : c.country.toUpperCase()}
                        </span>
                        <span className="text-muted-foreground">{c.count} click{c.count === 1 ? "" : "s"}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo to-mint"
                          style={{ width: `${(c.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="font-mono text-xs text-muted-foreground">
                  no country data yet — it appears after the first tracked clicks
                </p>
              )}
            </div>
          </div>

          <div className="glass glow-border rounded-2xl p-5">
            <h3 className="font-display mb-4 text-sm font-semibold text-starlight">Vessels</h3>
            <div className="flex gap-3">
              {analytics.deviceBreakdown.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">no device data yet</p>
              ) : (
                analytics.deviceBreakdown.map((d) => {
                  const Icon = deviceIcons[d.device] || Monitor;
                  const pct = Math.round((d.count / totalDevices) * 100);
                  return (
                    <div
                      key={d.device}
                      className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-indigo/15 bg-white/[0.03] p-3"
                    >
                      <Icon className="h-5 w-5 text-indigo-soft" />
                      <span className="font-display text-lg font-bold text-starlight">{pct}%</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{d.device}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass glow-border rounded-2xl p-5">
            <h3 className="font-display mb-4 text-sm font-semibold text-starlight">
              Recent Transmissions
            </h3>
            <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {analytics.recentClicks.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">no clicks recorded yet</p>
              ) : (
                analytics.recentClicks.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-indigo/10 bg-white/[0.02] px-3 py-2 font-mono text-[11px]"
                  >
                    <span className="flex items-center gap-2 text-starlight/90">
                      <PlatformIcon platform={c.platform} className="h-3.5 w-3.5 text-mint" />
                      {c.platform}
                      {c.country ? (
                        <span
                          className="rounded border border-indigo/20 bg-indigo/[0.08] px-1 py-px text-[9px] uppercase text-indigo-soft"
                          title={`origin: ${c.country}`}
                        >
                          {flagFor(c.country) || "??"} {c.country}
                        </span>
                      ) : null}
                    </span>
                    <time className="text-muted-foreground">
                      {new Date(c.clicked_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
