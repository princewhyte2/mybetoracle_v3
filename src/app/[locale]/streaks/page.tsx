import { notFound } from "next/navigation";
import { StreakExperience } from "@/features/streaks/streak-experience";
import { getStreakExplorerData, lagosEvidenceDate } from "@/features/streaks/streak-service";
import { streakCategories, streakScopes, type StreakCategory, type StreakMetric, type StreakScope } from "@/features/streaks/types";
import { isLaunchVisibleStreakMetric, metricByKey } from "@/features/streaks/metric-catalog";
import { isLocale, locales } from "@/i18n/config";
import { streakLabels } from "@/features/streaks/labels";
import { localizedMetadata } from "@/i18n/localized-metadata";
import StreaksLoading from "./loading";

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({params}:PageProps<"/[locale]/streaks">){const {locale}=await params;if(!isLocale(locale))notFound();const c=streakLabels[locale];return localizedMetadata(locale,"streaks",c.title,c.subtitle)}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? undefined : value;
}

function validUuid(value: string | undefined) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : undefined;
}

export default async function StreaksPage({ params, searchParams }: PageProps<"/[locale]/streaks"> & { searchParams: SearchParams }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const raw = await searchParams;
  const scopeValue = first(raw.scope);
  const categoryValue = first(raw.category);
  const metricValue = first(raw.metric);
  const sortValue = first(raw.sort);
  const sort: "length" | "team" | "sample" = sortValue === "team" || sortValue === "sample" ? sortValue : "length";
  const minimumValue = Number(first(raw.minimumLength));
  const pageValue = Number(first(raw.page));
  const historicalAsOf = validDate(first(raw.asOf));
  const requestedMetric = metricByKey.has(metricValue as StreakMetric) ? metricValue as StreakMetric : undefined;
  const metric = requestedMetric && isLaunchVisibleStreakMetric(requestedMetric) ? requestedMetric : undefined;
  const category = !metric && streakCategories.includes(categoryValue as StreakCategory) && categoryValue !== "corners" && categoryValue !== "cards"
    ? categoryValue as StreakCategory
    : undefined;
  const query = {
    asOf: historicalAsOf ?? lagosEvidenceDate(),
    country: first(raw.country)?.trim().slice(0, 128) || undefined,
    competition: validUuid(first(raw.competition)),
    teamId: validUuid(first(raw.teamId)),
    scope: streakScopes.includes(scopeValue as StreakScope) ? scopeValue as StreakScope : "OVERALL" as const,
    category,
    metric: metric ?? (category ? undefined : "WIN" as const),
    minimumLength: Number.isInteger(minimumValue) && minimumValue >= 0 && minimumValue <= 80 ? minimumValue : 3,
    search: first(raw.search)?.trim().slice(0, 100) || undefined,
    sort,
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
  };

  let data: Awaited<ReturnType<typeof getStreakExplorerData>> | null = null;
  try {
    data = await getStreakExplorerData({ locale, query, historicalAsOf });
  } catch (error) {
    console.error(`[streaks] feed unavailable: ${error instanceof Error ? error.message : "STREAKS_UNKNOWN_ERROR"}`);
  }
  if (data) return <StreakExperience data={data} locale={locale} />;
  return <StreaksLoading />;
}
