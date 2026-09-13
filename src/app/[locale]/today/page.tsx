import { notFound } from "next/navigation";
import { TodayExperience } from "@/features/today/today-experience";
import { todayRuntimeLabels } from "@/features/today/runtime-labels";
import { getTodayData, lagosDate, TodayFeedError } from "@/features/today/today-service";
import { isLocale, locales } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { localizedMetadata } from "@/i18n/localized-metadata";
import { systemLabels } from "@/i18n/system-labels";
import styles from "./page.module.css";

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function generateMetadata({params}:PageProps<"/[locale]/today">){const {locale}=await params;if(!isLocale(locale))notFound();return localizedMetadata(locale,"today",getMessages(locale).common.today,systemLabels[locale].todayDescription)}

export default async function TodayPage({ params, searchParams }: PageProps<"/[locale]/today">) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }
  const runtime = todayRuntimeLabels[locale];

  const requestedDate = (await searchParams).date;
  const date = isCalendarDate(requestedDate) ? requestedDate : lagosDate();
  let data;
  let errorCode: string | null = null;
  try { data = await getTodayData({ date, locale }); }
  catch (error) { errorCode = error instanceof TodayFeedError ? error.code : "TODAY_SERVICE_UNAVAILABLE"; }
  if (errorCode || !data) return <TodayState title={runtime.unavailableTitle} message={runtime.unavailableHelp} code={errorCode ?? undefined} />;
  if (data.totalMatches === 0) return <TodayState title={runtime.noFixturesTitle} message={runtime.noFixturesHelp} />;
  // A different product day owns a fresh feed, selection and live subscription.
  return <TodayExperience key={`${locale}:${date}`} data={data} locale={locale} />;
}

function TodayState({ title, message, code }: { title: string; message: string; code?: string }) {
  return <main className={styles.state}><div><span>MyBetOracle</span><h1>{title}</h1><p>{message}</p>{code && <small>Reference: {code}</small>}</div></main>;
}
