import type { Metadata } from "next";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { MatchExperience } from "@/features/match/match-experience";
import { getMatchDetail, MatchDetailError } from "@/features/match/match-service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { interpolateSystem, systemLabels } from "@/i18n/system-labels";

const resolveMatch = cache((slug: string, locale: Locale) => getMatchDetail(slug, locale));

async function resolved(slug: string, locale: Locale) {
  try { return await resolveMatch(slug, locale); }
  catch (error) { if (error instanceof MatchDetailError && error.code === "MATCH_NOT_FOUND") notFound(); throw error; }
}

export async function generateMetadata({ params }: PageProps<"/[locale]/match/[matchSlug]">): Promise<Metadata> {
  const { locale, matchSlug } = await params; if (!isLocale(locale)) notFound();
  const match = await resolved(matchSlug, locale); const copy = systemLabels[locale];
  const fields = { home: match.home.name, away: match.away.name };
  const title = `${interpolateSystem(copy.matchTitle, fields)} | MyBetOracle`;
  const description = interpolateSystem(copy.matchDescription, fields);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com";
  const canonical = `${origin}${match.canonicalPath}`;
  const localizedMatches = await Promise.all(locales.map(async (item) => [item, await resolved(matchSlug, item)] as const));
  const languages = Object.fromEntries(localizedMatches.map(([item, localized]) => [item, `${origin}${localized.canonicalPath}`]));
  const images = [match.home.emblemUrl, match.away.emblemUrl].filter((value): value is string => Boolean(value));
  return { title, description, alternates: { canonical, languages }, openGraph: { title, description, url: canonical, type: "website", ...(images.length ? { images } : {}) }, robots: { index: true, follow: true } };
}

export default async function MatchPage({ params }: PageProps<"/[locale]/match/[matchSlug]">) {
  const { locale, matchSlug } = await params; if (!isLocale(locale)) notFound();
  const match = await resolved(matchSlug, locale); if (matchSlug !== match.slug) permanentRedirect(match.canonicalPath);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com";
  const jsonLd = {
    "@context": "https://schema.org", "@type": "SportsEvent", name: `${match.home.name} vs ${match.away.name}`,
    startDate: match.kickoffAt, eventStatus: eventStatus(match.statusCode), url: `${origin}${match.canonicalPath}`,
    homeTeam: { "@type": "SportsTeam", name: match.home.name }, awayTeam: { "@type": "SportsTeam", name: match.away.name },
    ...(match.venue ? { location: { "@type": "Place", name: match.venue, address: match.city || undefined } } : {}),
  };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Today", item: `${origin}/${locale}/today` },
    { "@type": "ListItem", position: 2, name: match.competition.name },
    { "@type": "ListItem", position: 3, name: `${match.home.name} vs ${match.away.name}`, item: `${origin}${match.canonicalPath}` },
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumb]).replace(/</g, "\\u003c") }} /><MatchExperience match={match} locale={locale} /></>;
}

function eventStatus(code: string) {
  if (["FT", "AET", "PEN"].includes(code)) return "https://schema.org/EventCompleted";
  if (["PST", "CANC", "ABD"].includes(code)) return code === "PST" ? "https://schema.org/EventPostponed" : "https://schema.org/EventCancelled";
  if (["NS", "TBD"].includes(code)) return "https://schema.org/EventScheduled";
  return "https://schema.org/EventInProgress";
}
