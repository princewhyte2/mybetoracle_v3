import { notFound } from "next/navigation";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { BetslipExperience } from "@/features/betslip/localized-betslip-experience";
import { getOracleDailyData, OracleDailyFeedError } from "@/features/betslip/betslip-service";
import { lagosProductDate } from "@/features/accumulators/multi-picks-service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { betslipLabels } from "@/features/betslip/labels";
import { localizedMetadata } from "@/i18n/localized-metadata";
import { withMultiPickTerminology } from "@/i18n/multi-pick-terminology";
import stateStyles from "@/features/betslip/oracle-daily-state.module.css";
export const dynamic = "force-dynamic";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({params}:PageProps<"/[locale]/betslip">){const {locale}=await params;if(!isLocale(locale))notFound();const c=withMultiPickTerminology(betslipLabels[locale],locale,"betslip");return localizedMetadata(locale,"betslip",c.title,c.subtitle)}

export default async function BetslipPage({ params, searchParams }: PageProps<"/[locale]/betslip">) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const requested = typeof query.date === "string" ? query.date : undefined;
  const date = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : lagosProductDate();
  let result;
  try { result = await getOracleDailyData({ date, locale }); }
  catch (error) { return <OracleDailyState locale={locale} date={date} reason={error instanceof OracleDailyFeedError ? error.code : "ORACLE_DAILY_SERVICE_UNAVAILABLE"} />; }
  if (!result.data) return <OracleDailyState locale={locale} date={date} reason={result.reason ?? "no_eligible_publication"} />;
  const data = result.data;
  return <BetslipExperience data={data} locale={locale} />;
}

function OracleDailyState({ locale, date, reason }: { locale: Locale; date: string; reason: string }) {
  const serviceFailure = reason !== "no_eligible_publication";
  const c = betslipLabels[locale];
  return <main className={stateStyles.state}><section className={stateStyles.card}><div className={stateStyles.mark}><ReceiptText /></div><span>ORACLE DAILY · {date}</span><h1>{serviceFailure ? c.unavailableTitle : c.noPublicationTitle}</h1><p>{serviceFailure ? c.unavailableHelp : c.noPublicationHelp}</p><nav><Link href={`/${locale}/today`}>{c.viewTodaysMatches}</Link><Link href={`/${locale}/multi-picks`}>{c.openMultiPicks}</Link></nav></section></main>;
}
