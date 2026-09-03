import { notFound } from "next/navigation";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { BetslipExperience } from "@/features/betslip/localized-betslip-experience";
import { getOracleDailyData, OracleDailyFeedError } from "@/features/betslip/betslip-service";
import { lagosProductDate } from "@/features/accumulators/multi-picks-service";
import { isLocale, locales } from "@/i18n/config";
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

function OracleDailyState({ locale, date, reason }: { locale: string; date: string; reason: string }) {
  const serviceFailure = reason !== "no_eligible_publication";
  return <main className={stateStyles.state}><section className={stateStyles.card}><div className={stateStyles.mark}><ReceiptText /></div><span>ORACLE DAILY · {date}</span><h1>{serviceFailure ? "Oracle Daily is temporarily unavailable" : "No Oracle Daily publication today"}</h1><p>{serviceFailure ? "The verified publication could not be retrieved safely. Nothing unverified will be shown in its place." : "No combination met the strict 3.00–3.99 publication standard. The thresholds remain unchanged."}</p><nav><Link href={`/${locale}/today`}>View today&apos;s matches</Link><Link href={`/${locale}/multi-picks`}>Open Multi-Picks</Link></nav></section></main>;
}
