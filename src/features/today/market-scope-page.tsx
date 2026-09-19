import "server-only";
import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import type { PredictionMarket } from "./types";
import { notFound } from "next/navigation";
import { TodayExperience } from "@/features/today/today-experience";
import { todayRuntimeLabels } from "@/features/today/runtime-labels";
import { getTodayData, lagosDate, tomorrowLagosDate, TodayFeedError } from "@/features/today/today-service";
import { marketGroupForSlug, marketPresentation } from "@/features/discovery/discovery-service";
import { LIVE_SCORES_SLUG, liveScoresContent, rankedViewForSlug, valueViewLabels } from "@/features/discovery/market-presentation";
import { discoveryLabels } from "@/features/discovery/labels";
import { isLocale, locales } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/localized-metadata";
import { systemLabels } from "@/i18n/system-labels";
import { buildTodayItemListJsonLd } from "./today-jsonld";
import { type MarketScope, marketSlugs, scopedHeading, scopedMarketDescription } from "./scoped-heading";
import styles from "@/app/[locale]/today/page.module.css";

export type { MarketScope };
export { marketSlugs, scopedHeading, scopedMarketDescription };

// Live scores only make sense for "today" -- tomorrow's fixtures haven't
// started, so /tomorrow/live-scores would always be an empty page. Scoping
// it out here (rather than generated-then-empty) keeps dynamicParams:false
// 404ing that path honestly instead of publishing thin content.
export function buildMarketScopeStaticParams(scope: MarketScope) {
  const slugs = [...marketSlugs(), "value-picks", "top-picks", ...(scope === "today" ? [LIVE_SCORES_SLUG] : [])];
  return locales.flatMap((locale) => slugs.map((marketSlug) => ({ locale, marketSlug })));
}

type PageParams = { locale: string; marketSlug: string };
type ScopeProps = { params: Promise<PageParams>; searchParams?: Promise<Record<string, string | string[] | undefined>> };
const marketFeed = cache((date: string, locale: typeof locales[number], group: string, page: number) => getTodayData({ date, locale, ...(group === "top" || group === "value" || group === "live" ? { view: group } : { marketGroup: group }), page }));
function pageNumber(value: unknown) { return typeof value === "string" && /^[1-9]\d{0,5}$/.test(value) ? Number(value) : 1; }
function scopeDate(value: unknown, scope: MarketScope) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T12:00:00Z`);
    if (Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value) return value;
  }
  return scope === "today" ? lagosDate() : tomorrowLagosDate();
}

export async function buildMarketScopeMetadata(
  { params, searchParams }: ScopeProps,
  scope: MarketScope,
): Promise<Metadata> {
  const { locale, marketSlug } = await params;
  if (!isLocale(locale)) notFound();
  const ranked = rankedViewForSlug(marketSlug);
  const isLive = marketSlug === LIVE_SCORES_SLUG && scope === "today";
  const group = ranked ?? (isLive ? "live" : marketGroupForSlug(marketSlug));
  if (!group) return { robots: { index: false, follow: false } };
  const copy = discoveryLabels[locale];
  const marketName = ranked ? valueViewLabels[locale][ranked] : isLive ? liveScoresContent[locale].heading : copy.marketNames[marketSlug] ?? marketPresentation[group]?.name ?? marketSlug;
  const description = isLive ? liveScoresContent[locale].description : scopedMarketDescription(locale, marketSlug, scope, copy.marketDescriptions[marketSlug]);
  const query = await searchParams;
  const page = pageNumber(query?.page);
  const date = scopeDate(query?.date, scope);
  const data = await marketFeed(date, locale, group, page).catch(() => null);
  return localizedMetadata(
    locale,
    `${scope}/${marketSlug}${page > 1 ? `?page=${page}` : ""}`,
    isLive ? marketName : scopedHeading(locale, marketName, scope),
    description,
    Boolean(data?.competitions.length) && page === 1 && date === scopeDate(undefined, scope),
  );
}

export async function MarketScopePage({ params, searchParams }: ScopeProps, scope: MarketScope) {
  const { locale, marketSlug } = await params;
  if (!isLocale(locale)) notFound();
  const ranked = rankedViewForSlug(marketSlug);
  const isLive = marketSlug === LIVE_SCORES_SLUG && scope === "today";
  const group = ranked ?? (isLive ? "live" : marketGroupForSlug(marketSlug));
  if (!group) notFound();

  const runtime = todayRuntimeLabels[locale];
  const query = await searchParams;
  const date = scopeDate(query?.date, scope);
  const page = pageNumber(query?.page);
  let data;
  let errorCode: string | null = null;
  try { data = await marketFeed(date, locale, group, page); }
  catch (error) { errorCode = error instanceof TodayFeedError ? error.code : "TODAY_SERVICE_UNAVAILABLE"; }
  if (errorCode || !data) return <ScopeState title={runtime.unavailableTitle} message={runtime.unavailableHelp} />;
  if (page > 1 && data.competitions.length === 0) notFound();
  const marketName = ranked ? valueViewLabels[locale][ranked] : isLive ? liveScoresContent[locale].heading : discoveryLabels[locale].marketNames[marketSlug] ?? marketPresentation[group]?.name ?? marketSlug;
  const pageHeading = isLive ? marketName : scopedHeading(locale, marketName, scope);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com").replace(/\/$/, "");
  const jsonLd = buildTodayItemListJsonLd({ data, locale, origin });
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: scope === "tomorrow" ? systemLabels[locale].tomorrowPredictionsHeading : systemLabels[locale].todayPredictionsHeading, item: `${origin}/${locale}/${scope}` },
      { "@type": "ListItem", position: 2, name: pageHeading, item: `${origin}/${locale}/${scope}/${marketSlug}` },
    ],
  };
  const schemas = jsonLd ? [jsonLd, breadcrumb] : [breadcrumb];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, "\\u003c") }}
      />
      <TodayExperience
        key={`${locale}:${scope}:${marketSlug}:${date}:${page}`}
        data={data}
        locale={locale}
        scope={scope}
        initialMarket={ranked ?? (isLive || group === "ORACLE_PICK" ? "best" : group as Exclude<PredictionMarket, "ORACLE_PICK">)}
        heading={pageHeading}
      />
      <nav aria-label={discoveryLabels[locale].fixtures} style={{ display: "flex", gap: "1rem", justifyContent: "center", padding: "1rem 1rem 5rem" }}>
        {page > 1 && <Link prefetch={false} href={`/${locale}/${scope}/${marketSlug}?date=${date}&page=${page - 1}`}>← {page - 1}</Link>}
        {data.pagination.hasMore && <Link prefetch={false} href={`/${locale}/${scope}/${marketSlug}?date=${date}&page=${page + 1}`}>{page + 1} →</Link>}
      </nav>
    </>
  );
}

function ScopeState({ title, message }: { title: string; message: string }) {
  return <main className={styles.state}><div><span>MyBetOracle</span><h1>{title}</h1><p>{message}</p></div></main>;
}
