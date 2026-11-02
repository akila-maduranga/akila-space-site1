import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_PASSWORD = "admin123";

function authorize(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const expectedToken = createHash("sha256")
    .update(`${expected}::cosmosfolio::v1`)
    .digest("hex");
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken);
  return a.length === b.length && a.equals(b);
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 }
    );
  }
  const sb: SupabaseClient = createClient(url, key, { auth: { persistSession: false } });

  try {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    const sinceStr = since.toISOString().slice(0, 10);

    const [visitorsRes, clicksRes, linksRes, byDayRes, byLinkRes, referrersRes, recentRes, deviceRes] =
      await Promise.all([
        sb.from("visitors").select("visitor_id, page_views", { count: "exact" }),
        sb.from("link_clicks").select("id", { count: "exact", head: true }),
        sb.from("social_links").select("label, platform, clicks"),
        sb.rpc("visitors_by_day", { p_days: 30 }),
        sb.rpc("clicks_by_link", { p_days: 30 }),
        sb.rpc("top_referrers", { p_days: 30, p_limit: 6 }),
        sb.from("link_clicks")
          .select("platform, clicked_at")
          .order("clicked_at", { ascending: false })
          .limit(12),
        sb.rpc("device_breakdown", { p_days: 30 }),
      ]);

    const visitorsData = visitorsRes.data || [];
    const totalVisitors = visitorsData.length;
    const totalPageViews = visitorsData.reduce((s, v) => s + (v.page_views || 1), 0);
    const totalClicks =
      (clicksRes.count || 0) +
      (linksRes.data || []).reduce((s, l) => s + (l.clicks || 0), 0);

    // Fill missing days with zeros
    const dayMap = new Map<string, { visitors: number; views: number }>();
    (byDayRes.data || []).forEach((row: { date: string; visitors: number; views: number }) => {
      dayMap.set(String(row.date), { visitors: Number(row.visitors), views: Number(row.views) });
    });
    const visitorsByDay: { date: string; visitors: number; views: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = dayMap.get(key) || { visitors: 0, views: 0 };
      visitorsByDay.push({ date: key.slice(5), ...entry });
    }
    void sinceStr;

    return NextResponse.json({
      totalVisitors,
      totalPageViews,
      totalClicks,
      visitorsByDay,
      clicksByLink: linksRes.data
        ? linksRes.data
            .map((l) => {
              const tracked = (byLinkRes.data || []).find(
                (c: { platform: string; clicks: number }) => c.platform === l.platform
              );
              return {
                label: l.label,
                platform: l.platform,
                clicks: (l.clicks || 0) + (tracked ? Number(tracked.clicks) : 0),
              };
            })
            .sort((a, b) => b.clicks - a.clicks)
        : [],
      topReferrers: (referrersRes.data || []).map(
        (r: { referrer: string; count: number }) => ({
          referrer: r.referrer,
          count: Number(r.count),
        })
      ),
      recentClicks: (recentRes.data || []).map((c: { platform: string; clicked_at: string }) => ({
        platform: c.platform,
        clicked_at: c.clicked_at,
      })),
      deviceBreakdown: (deviceRes.data || []).map((d: { device: string; count: number }) => ({
        device: d.device,
        count: Number(d.count),
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analytics error" },
      { status: 500 }
    );
  }
}
