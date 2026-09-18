import { FeedRetry } from "@/features/accumulators/feed-retry";
import { notFound } from "next/navigation";
import { MultiPicksExperience } from "@/features/accumulators/multi-picks-experience";
import { getMultiPicksData, lagosProductDate } from "@/features/accumulators/multi-picks-service";
import { isLocale, locales } from "@/i18n/config";
import { buildMultiPicksJsonLd } from "@/features/accumulators/multi-picks-jsonld";
import { localizedAccumulatorLabels } from "@/features/accumulators/localized-labels";
import { localizedMetadata } from "@/i18n/localized-metadata";

export const revalidate = 120;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/multi-picks">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = localizedAccumulatorLabels[locale];
  const metadata = localizedMetadata(locale, "multi-picks", c.seoTitle, c.seoDescription);
  return {
    ...metadata,
    keywords: c.seoKeywords,
  };
}

function isCalendarDate(value: unknown): value is string { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T00:00:00.000Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; }

export default async function MultiPicksPage({ params, searchParams }: PageProps<"/[locale]/multi-picks">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const requestedDate = (await searchParams).date;
  const date = isCalendarDate(requestedDate) ? requestedDate : lagosProductDate();
  let data;
  try { data = await getMultiPicksData({ date, locale }); }
  catch {
    return <FeedRetry locale={locale} title={localizedAccumulatorLabels[locale].title} href={`/${locale}/multi-picks?date=${date}`} />;
  }
  const { daily, weekly } = data;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com";
  const jsonLd = buildMultiPicksJsonLd({
    daily,
    weekly,
    locale,
    origin,
    title: localizedAccumulatorLabels[locale].seoTitle,
    description: localizedAccumulatorLabels[locale].seoDescription,
  });

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}
      <MultiPicksExperience daily={daily} weekly={weekly} locale={locale} />
    </>
  );
}
