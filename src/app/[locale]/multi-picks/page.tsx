import { notFound } from "next/navigation";
import { MultiPicksExperience } from "@/features/accumulators/multi-picks-experience";
import { getMultiPicksData, lagosProductDate, MultiPicksFeedError } from "@/features/accumulators/multi-picks-service";
import { isLocale, locales } from "@/i18n/config";
import { localizedAccumulatorLabels } from "@/features/accumulators/localized-labels";
import { localizedMetadata } from "@/i18n/localized-metadata";

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({params}:PageProps<"/[locale]/multi-picks">){const {locale}=await params;if(!isLocale(locale))notFound();const c=localizedAccumulatorLabels[locale];return localizedMetadata(locale,"multi-picks",c.title,c.subtitle)}

function isCalendarDate(value: unknown): value is string { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T00:00:00.000Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; }

export default async function MultiPicksPage({ params, searchParams }: PageProps<"/[locale]/multi-picks">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const requestedDate = (await searchParams).date;
  const date = isCalendarDate(requestedDate) ? requestedDate : lagosProductDate();
  let data;
  try { data = await getMultiPicksData({ date, locale }); }
  catch (error) {
    const code = error instanceof MultiPicksFeedError ? error.code : "MULTI_PICKS_SERVICE_UNAVAILABLE";
    const copy = localizedAccumulatorLabels[locale];
    return <main style={{minHeight:"70vh",display:"grid",placeItems:"center",padding:"2rem"}}><section style={{maxWidth:560,textAlign:"center"}}><span>MyBetOracle</span><h1>{copy.title}</h1><p>{copy.subtitle}</p><small>{code}</small></section></main>;
  }
  const { daily, weekly } = data;

  return <MultiPicksExperience daily={daily} weekly={weekly} locale={locale} />;
}
