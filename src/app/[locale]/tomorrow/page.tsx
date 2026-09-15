import { notFound } from "next/navigation";
import { TodayExperience } from "@/features/today/today-experience";
import { todayRuntimeLabels } from "@/features/today/runtime-labels";
import { getTodayData, tomorrowLagosDate, TodayFeedError } from "@/features/today/today-service";
import { buildTodayItemListJsonLd } from "@/features/today/today-jsonld";
import { isLocale, locales } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/localized-metadata";
import { systemLabels } from "@/i18n/system-labels";
import styles from "../today/page.module.css";

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({params}:PageProps<"/[locale]/tomorrow">){const {locale}=await params;if(!isLocale(locale))notFound();return localizedMetadata(locale,"tomorrow",systemLabels[locale].tomorrowPredictionsHeading,systemLabels[locale].tomorrowDescription)}

export default async function TomorrowPage({ params }: PageProps<"/[locale]/tomorrow">) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }
  const runtime = todayRuntimeLabels[locale];

  const date = tomorrowLagosDate();
  let data;
  let errorCode: string | null = null;
  try { data = await getTodayData({ date, locale }); }
  catch (error) { errorCode = error instanceof TodayFeedError ? error.code : "TODAY_SERVICE_UNAVAILABLE"; }
  if (errorCode || !data) return <TomorrowState title={runtime.unavailableTitle} message={runtime.unavailableHelp} code={errorCode ?? undefined} />;
  if (data.totalMatches === 0) return <TomorrowState title={runtime.noFixturesTitle} message={runtime.noFixturesHelp} />;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com";
  const jsonLd = buildTodayItemListJsonLd({ data, locale, origin });
  // A different product day owns a fresh feed, selection and live subscription.
  return <>
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
    <TodayExperience key={`${locale}:${date}`} data={data} locale={locale} scope="tomorrow" heading={systemLabels[locale].tomorrowPredictionsHeading} />
  </>;
}

function TomorrowState({ title, message, code }: { title: string; message: string; code?: string }) {
  return <main className={styles.state}><div><span>MyBetOracle</span><h1>{title}</h1><p>{message}</p>{code && <small>Reference: {code}</small>}</div></main>;
}
