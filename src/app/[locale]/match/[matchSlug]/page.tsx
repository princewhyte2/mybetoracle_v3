import type { Metadata } from "next";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { MatchExperience } from "@/features/match/match-experience";
import { getMatchDetail, MatchDetailError } from "@/features/match/match-service";
import { schemaEventStatus } from "@/features/match/schema-event-status";
import { entitySlug } from "@/features/discovery/public-id";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { interpolateSystem, systemLabels } from "@/i18n/system-labels";
import { DEFAULT_OG_IMAGE } from "@/i18n/localized-metadata";

import { buildMatchSeo } from "@/features/match/match-seo";

const resolveMatch = cache((slug: string, locale: Locale) => getMatchDetail(slug, locale));

async function resolved(slug: string, locale: Locale) {
  try { return await resolveMatch(slug, locale); }
  catch (error) { if (error instanceof MatchDetailError && error.code === "MATCH_NOT_FOUND") notFound(); throw error; }
}

export async function generateMetadata({ params }: PageProps<"/[locale]/match/[matchSlug]">): Promise<Metadata> {
  const { locale, matchSlug } = await params;
  if (!isLocale(locale)) notFound();

  let match;
  try {
    match = await resolved(matchSlug, locale);
  } catch {
    return {
      title: "Match Details | MyBetOracle",
      description: "Football match intelligence, predictions, head-to-head records and team streaks.",
      robots: { index: false, follow: true },
    };
  }

  const { rawTitle, fullTitle, description } = buildMatchSeo(match, locale);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com").replace(/\/$/, "");
  const canonical = `${origin}${match.canonicalPath}`;
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((item) => [item, `${origin}/${item}/match/${match.slug}`])
  );
  languages["x-default"] = `${origin}/en/match/${match.slug}`;

  const matchImages = [match.home.emblemUrl, match.away.emblemUrl].filter((value): value is string => Boolean(value));
  const ogImages = matchImages.length > 0
    ? [...matchImages.map((url) => ({ url, alt: `${match.home.name} vs ${match.away.name}` })), DEFAULT_OG_IMAGE]
    : [DEFAULT_OG_IMAGE];
  const twitterImage = matchImages[0] || DEFAULT_OG_IMAGE.url;

  return {
    title: rawTitle,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      siteName: "MyBetOracle",
      title: fullTitle,
      description,
      url: canonical,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      site: "@mybetoracle",
      creator: "@mybetoracle",
      title: fullTitle,
      description,
      images: [twitterImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function MatchPage({ params }: PageProps<"/[locale]/match/[matchSlug]">) {
  const { locale, matchSlug } = await params;
  if (!isLocale(locale)) notFound();
  const match = await resolved(matchSlug, locale);
  if (matchSlug !== match.slug) permanentRedirect(match.canonicalPath);

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com").replace(/\/$/, "");
  const { description } = buildMatchSeo(match, locale);
  const score = match.score;
  const hasScore = Boolean(score && (score[0] !== null || score[1] !== null));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: score && hasScore
      ? `${match.home.name} ${score[0]} - ${score[1]} ${match.away.name}`
      : `${match.home.name} vs ${match.away.name}`,
    description,
    sport: "Soccer",
    startDate: match.kickoffAt,
    eventStatus: schemaEventStatus(match.statusCode),
    url: `${origin}${match.canonicalPath}`,
    homeTeam: {
      "@type": "SportsTeam",
      name: match.home.name,
      ...(score && hasScore ? { score: score[0] } : {}),
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: match.away.name,
      ...(score && hasScore ? { score: score[1] } : {}),
    },
    ...(match.venue ? { location: { "@type": "Place", name: match.venue, address: match.city || undefined } } : {}),
  };

  const competitionUrl = match.competition.id
    ? `${origin}/${locale}/competitions/${entitySlug(match.competition.name, match.competition.id)}`
    : undefined;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Today", item: `${origin}/${locale}/today` },
      { "@type": "ListItem", position: 2, name: match.competition.name, ...(competitionUrl ? { item: competitionUrl } : {}) },
      { "@type": "ListItem", position: 3, name: `${match.home.name} vs ${match.away.name}`, item: `${origin}${match.canonicalPath}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumb]).replace(/</g, "\\u003c") }}
      />
      <MatchExperience match={match} locale={locale} />
    </>
  );
}
