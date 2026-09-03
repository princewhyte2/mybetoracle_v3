import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultsHubExperience } from "@/features/performance/results-hub-experience";
import { daysBefore, getResultsData, lagosResultsDate, ResultsFeedError } from "@/features/performance/results-service";
import { marketGroups, type MarketGroup, type SettledResult } from "@/features/performance/types";
import { isLocale, locales } from "@/i18n/config";
import { resultsLabels } from "@/features/performance/results-labels";
import { localizedMetadata } from "@/i18n/localized-metadata";
import { withMultiPickTerminology } from "@/i18n/multi-pick-terminology";

export const dynamicParams = false;
export const dynamic = "force-dynamic";
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: PageProps<"/[locale]/results">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy=withMultiPickTerminology(resultsLabels[locale],locale,"results");
  return localizedMetadata(locale,"results",copy.title,copy.subtitle);
}
export default async function ResultsPage({ params, searchParams }: PageProps<"/[locale]/results">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const period = [7, 30, 90].includes(Number(query.period)) ? Number(query.period) : 30;
  const market = typeof query.market === "string" && marketGroups.includes(query.market as MarketGroup) ? query.market as MarketGroup : undefined;
  const result = typeof query.result === "string" && ["WON", "LOST", "VOID"].includes(query.result) ? query.result as SettledResult : undefined;
  const page = Math.max(1, Number.parseInt(typeof query.page === "string" ? query.page : "1", 10) || 1);
  const to = lagosResultsDate();
  let payload: Awaited<ReturnType<typeof getResultsData>> | null = null;
  let errorCode: string | null = null;
  try {
    payload = await getResultsData({ locale, from: daysBefore(to, period), to, market, result, page, pageSize: 50 });
  } catch (error) {
    errorCode = error instanceof ResultsFeedError ? error.code : "RESULTS_SERVICE_UNAVAILABLE";
  }
  if (payload) return <ResultsHubExperience locale={locale} predictions={payload.predictions} performance={payload.performance} accumulators={[]} />;
  const copy = withMultiPickTerminology(resultsLabels[locale], locale, "results");
  return <main style={{minHeight:"70vh",display:"grid",placeItems:"center",padding:"2rem"}}><section style={{maxWidth:560,textAlign:"center"}}><span>MyBetOracle</span><h1>{copy.title}</h1><p>{copy.subtitle}</p><small>{errorCode}</small></section></main>;
}
