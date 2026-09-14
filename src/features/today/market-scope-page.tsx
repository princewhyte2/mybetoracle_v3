import "server-only";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TodayExperience } from "@/features/today/today-experience";
import { todayRuntimeLabels } from "@/features/today/runtime-labels";
import { getTodayData, lagosDate, tomorrowLagosDate, TodayFeedError } from "@/features/today/today-service";
import { marketGroupForSlug, marketPresentation } from "@/features/discovery/discovery-service";
import { discoveryLabels } from "@/features/discovery/labels";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/localized-metadata";
import styles from "@/app/[locale]/today/page.module.css";

export type MarketScope = "today" | "tomorrow";

const scopeWord: Record<Locale, Record<MarketScope, string>> = {
  en: { today: "today", tomorrow: "tomorrow" },
  es: { today: "hoy", tomorrow: "mañana" },
  fr: { today: "aujourd’hui", tomorrow: "demain" },
  de: { today: "heute", tomorrow: "morgen" },
  it: { today: "oggi", tomorrow: "domani" },
  pt: { today: "hoje", tomorrow: "amanhã" },
};

// A single colon-separated template reads naturally across all six locales
// regardless of market-name length or grammatical gender, without following
// English word order (per V3_LOCALIZATION_STANDARD.md's translation rule).
function scopedMarketTitle(locale: Locale, marketName: string, scope: MarketScope): string {
  const when = scopeWord[locale][scope];
  switch (locale) {
    case "es": return `${marketName}: pronósticos para ${when}`;
    case "fr": return `${marketName} : pronostics pour ${when}`;
    case "de": return `${marketName}: Prognosen für ${when}`;
    case "it": return `${marketName}: pronostici per ${when}`;
    case "pt": return `${marketName}: palpites para ${when}`;
    default: return `${marketName}: predictions for ${when}`;
  }
}

export function marketSlugs(): string[] {
  return Object.values(marketPresentation)
    .map((item) => item.slug)
    .filter((slug) => slug !== "mixed");
}

export function buildMarketScopeStaticParams() {
  return locales.flatMap((locale) => marketSlugs().map((marketSlug) => ({ locale, marketSlug })));
}

type PageParams = { locale: string; marketSlug: string };

export async function buildMarketScopeMetadata(
  { params }: { params: Promise<PageParams> },
  scope: MarketScope,
): Promise<Metadata> {
  const { locale, marketSlug } = await params;
  if (!isLocale(locale)) notFound();
  const group = marketGroupForSlug(marketSlug);
  if (!group) return { robots: { index: false, follow: false } };
  const copy = discoveryLabels[locale];
  const marketName = copy.marketNames[marketSlug] ?? marketPresentation[group]?.name ?? marketSlug;
  const description = copy.marketDescriptions[marketSlug];
  return localizedMetadata(
    locale,
    `${scope}/${marketSlug}`,
    scopedMarketTitle(locale, marketName, scope),
    description,
  );
}

export async function MarketScopePage({ params }: { params: Promise<PageParams> }, scope: MarketScope) {
  const { locale, marketSlug } = await params;
  if (!isLocale(locale)) notFound();
  const group = marketGroupForSlug(marketSlug);
  if (!group) notFound();

  const runtime = todayRuntimeLabels[locale];
  const date = scope === "today" ? lagosDate() : tomorrowLagosDate();
  let data;
  let errorCode: string | null = null;
  try { data = await getTodayData({ date, locale, marketGroup: group }); }
  catch (error) { errorCode = error instanceof TodayFeedError ? error.code : "TODAY_SERVICE_UNAVAILABLE"; }
  if (errorCode || !data) return <ScopeState title={runtime.unavailableTitle} message={runtime.unavailableHelp} code={errorCode ?? undefined} />;
  if (data.totalMatches === 0) return <ScopeState title={runtime.noFixturesTitle} message={runtime.noFixturesHelp} />;
  return <TodayExperience key={`${locale}:${scope}:${marketSlug}:${date}`} data={data} locale={locale} scope={scope} />;
}

function ScopeState({ title, message, code }: { title: string; message: string; code?: string }) {
  return <main className={styles.state}><div><span>MyBetOracle</span><h1>{title}</h1><p>{message}</p>{code && <small>Reference: {code}</small>}</div></main>;
}
