import type { MetadataRoute } from "next";
import { getDiscoveryData } from "@/features/discovery/discovery-service";
import { marketSlugs } from "@/features/today/market-scope-page";
import { marketPresentation } from "@/features/discovery/market-presentation";
import { getTodayData, lagosDate, tomorrowLagosDate } from "@/features/today/today-service";
import { locales } from "@/i18n/config";

const PUBLIC_ROUTES = ["today", "tomorrow", "explore", "calendar", "competitions", "teams", "countries", "markets", "streaks", "multi-picks", "results", "betslip"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com";
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    PUBLIC_ROUTES.map((route) => ({
      url: `${origin}/${locale}/${route}`,
      changeFrequency: ["today", "tomorrow", "calendar", "streaks", "multi-picks", "results", "betslip"].includes(route) ? "daily" as const : "weekly" as const,
      priority: route === "today" ? 1 : 0.75,
    })),
  );
  try {
    const entityEntries = (await Promise.all(locales.map(async (locale) => {
      const data = await getDiscoveryData({ locale, activityOptional: true });
      const entities = [
        ...data.competitions.map((item) => `competitions/${item.slug}`),
        ...data.teams.map((item) => `teams/${item.slug}`),
        ...data.countries.map((item) => `countries/${item.slug}`),
      ];
      return entities.map((path) => ({ url: `${origin}/${locale}/${path}`, changeFrequency: "daily" as const, priority: 0.7 }));
    }).map(promise => promise.catch(() => [])))).flat();
    const matches = await matchEntries(origin);
    return [...staticEntries, ...entityEntries, ...(await marketScopeEntries(origin)), ...matches];
  } catch {
    return [...staticEntries, ...(await marketScopeEntries(origin)), ...(await matchEntries(origin).catch(() => []))];
  }
}

// The Forebet/PredictZ (scope x market) URL fanout: every real market type
// gets its own crawlable today/ and tomorrow/ page, per locale.
async function marketScopeEntries(origin: string): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const scope of ["today", "tomorrow"] as const) {
    const date = scope === "today" ? lagosDate() : tomorrowLagosDate();
    const pages = await Promise.all(locales.map(async locale => {
      const data = await getTodayData({ date, locale });
      const available = new Set(data.competitions.flatMap(c => c.matches.flatMap(m => Object.entries(m.markets).filter(([,value]) => value.available).map(([group]) => marketPresentation[group]?.slug))));
      return marketSlugs().filter(slug => available.has(slug)).map(slug => ({ url: `${origin}/${locale}/${scope}/${slug}`, changeFrequency: "daily" as const, priority: 0.72 }));
    }).map(promise => promise.catch(() => [])));
    entries.push(...pages.flat());
  }
  return entries;
}

async function matchEntries(origin: string): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) return [];
  const now = new Date(); const from = new Date(now); const to = new Date(now);
  // Keep the discovery payload comfortably below Next.js's 2 MB fetch-cache
  // boundary while retaining the fixtures most useful to launch discovery.
  from.setUTCDate(from.getUTCDate() - 1); to.setUTCDate(to.getUTCDate() + 3);
  const day = (value: Date) => value.toISOString().slice(0, 10);
  const pages = await Promise.all(locales.map(async (locale) => {
    const url = new URL(`${baseUrl}/api/v3/matches/discovery`); url.searchParams.set("from", day(from)); url.searchParams.set("to", day(to)); url.searchParams.set("locale", locale);
    const response = await fetch(url, { headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey }, next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) });
    if (!response.ok) return [];
    const payload = await response.json() as { schemaVersion?: string; items?: Array<{ canonicalPath?: string; updatedAt?: string }> };
    if (payload.schemaVersion !== "mbo-match-discovery-v1" || !Array.isArray(payload.items)) return [];
    return payload.items.flatMap((item) => typeof item.canonicalPath === "string" && item.canonicalPath.startsWith(`/${locale}/match/`) ? [{ url: `${origin}${item.canonicalPath}`, lastModified: item.updatedAt ? new Date(item.updatedAt) : now, changeFrequency: "hourly" as const, priority: 0.8 }] : []);
  }).map(promise => promise.catch(() => [])));
  return [...new Map(pages.flat().map((entry) => [entry.url, entry])).values()];
}
