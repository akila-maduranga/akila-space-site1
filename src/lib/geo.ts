/**
 * Best-effort visitor country lookup for the anonymous analytics.
 *
 * The country is read once per browser session from /api/geo (which uses
 * the Vercel/Cloudflare edge headers — no IP is ever stored) and cached in
 * sessionStorage so repeat tracking calls don't repeat the request. If the
 * lookup fails for any reason we report "unknown" and get on with life.
 */

let memo: string | null = null;
let inflight: Promise<string> | null = null;

export async function getCountry(): Promise<string> {
  if (typeof window === "undefined") return "unknown";
  if (memo) return memo;

  const stored = window.sessionStorage.getItem("cosmosfolio_country");
  if (stored) {
    memo = stored;
    return memo;
  }

  if (!inflight) {
    inflight = (async () => {
      let country = "unknown";
      try {
        const res = await fetch("/api/geo", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { country?: string };
          if (data.country && /^[a-z]{2}$/.test(data.country)) country = data.country;
        }
      } catch {
        /* offline / blocked — "unknown" is fine */
      }
      try {
        window.sessionStorage.setItem("cosmosfolio_country", country);
      } catch {
        /* storage disabled — memo still works for this page load */
      }
      memo = country;
      return country;
    })();
  }

  return inflight;
}
