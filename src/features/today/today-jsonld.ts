import "server-only";
import { buildPublicMatchPath } from "@/features/match/public-match-url";
import { schemaEventStatus } from "@/features/match/schema-event-status";
import type { Locale } from "@/i18n/config";
import type { TodayData } from "./types";

// A conservative ItemList of real SportsEvent entries for whatever fixtures
// are actually present in the already-fetched, already-rendered TodayData --
// never re-fetched or expanded beyond what the page itself shows, so the
// structured data can never drift from the visible content. Fixtures with
// no resolved kickoff time are skipped rather than emitting a SportsEvent
// with a missing/guessed startDate.
export function buildTodayItemListJsonLd({
  data,
  locale,
  origin,
}: {
  data: TodayData;
  locale: Locale;
  origin: string;
}): Record<string, unknown> | null {
  const fixtures = data.competitions.slice(0, 20).flatMap((competition) => competition.matches);
  const items = fixtures.flatMap((match, index) => {
    if (!match.kickoffAt || !match.home.id || !match.away.id) return [];
    const url = `${origin}${buildPublicMatchPath({ locale, fixtureId: match.id, homeName: match.home.name, awayName: match.away.name })}`;
    return [{
      "@type": "ListItem",
      position: index + 1,
      url,
      item: {
        "@type": "SportsEvent",
        name: `${match.home.name} vs ${match.away.name}`,
        startDate: match.kickoffAt,
        eventStatus: schemaEventStatus(match.statusCode),
        url,
        homeTeam: { "@type": "SportsTeam", name: match.home.name },
        awayTeam: { "@type": "SportsTeam", name: match.away.name },
      },
    }];
  });
  if (!items.length) return null;
  return { "@context": "https://schema.org", "@type": "ItemList", itemListElement: items };
}
