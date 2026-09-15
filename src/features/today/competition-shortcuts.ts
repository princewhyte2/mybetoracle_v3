import { entitySlug } from "../discovery/public-id";
import type { Locale } from "@/i18n/config";
import type { Competition } from "./types";

// Presentation only: callers must supply real, localized product preferences.
// No prototype names, invented counts, or fallback to an unrelated competition.
export function competitionShortcuts(
  competitions: ReadonlyArray<Pick<Competition, "id" | "name" | "countryCode">>,
  locale: Locale,
) {
  const seen = new Set<string>();
  return competitions.flatMap((competition) => {
    if (!competition.name.trim() || seen.has(competition.id)) return [];
    try {
      const href = `/${locale}/competitions/${entitySlug(competition.name, competition.id)}`;
      seen.add(competition.id);
      return [{ ...competition, href }];
    } catch {
      return [];
    }
  });
}
