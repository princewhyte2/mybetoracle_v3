import { entitySlug } from "../discovery/public-id";
import type { Locale } from "@/i18n/config";
import type { Competition } from "./types";

export interface PinnedCompetitionShortcut {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly countryCode: string;
  readonly emblemUrl?: string;
  readonly href: string;
}

export const CANONICAL_TOP_LEAGUES: ReadonlyArray<
  Pick<Competition, "id" | "name" | "countryCode"> & { emblemUrl: string; slug: string }
> = [
  {
    id: "c8b97cc2-2122-4bcc-a7ab-65274a75d00b",
    name: "Premier League",
    countryCode: "ENG",
    slug: "premier-league--yLl8wiEiS8ynq2UnSnXQCw",
    emblemUrl: "https://media.api-sports.io/football/leagues/39.png",
  },
  {
    id: "365e4ab3-a9b9-4271-8507-1aa4d985957b",
    name: "UEFA Champions League",
    countryCode: "INT",
    slug: "uefa-champions-league--Nl5Ks6m5QnGFBxqk2YWVew",
    emblemUrl: "https://media.api-sports.io/football/leagues/2.png",
  },
  {
    id: "92436c91-cf2d-47b6-a133-7c660d6e261a",
    name: "La Liga",
    countryCode: "ESP",
    slug: "la-liga--kkNskc8tR7ahM3xmDW4mGg",
    emblemUrl: "https://media.api-sports.io/football/leagues/140.png",
  },
  {
    id: "390f0f1b-6dc0-4d50-8b4e-87696813bb99",
    name: "Serie A",
    countryCode: "ITA",
    slug: "serie-a--OQ8PG23ATVCLTodpaBO7mQ",
    emblemUrl: "https://media.api-sports.io/football/leagues/135.png",
  },
  {
    id: "1cfc4ef3-0c92-41b4-99c0-0a1fc7cf789f",
    name: "Bundesliga",
    countryCode: "DEU",
    slug: "bundesliga--HPxO8wySQbSZwAofx894nw",
    emblemUrl: "https://media.api-sports.io/football/leagues/78.png",
  },
  {
    id: "f6899004-373f-4eb6-8769-9f6193e35167",
    name: "Ligue 1",
    countryCode: "FRA",
    slug: "ligue-1--9omQBDc_TraHaZ9hk-NRZw",
    emblemUrl: "https://media.api-sports.io/football/leagues/61.png",
  },
  {
    id: "69b7bb33-6a34-4a19-8bb7-d2042de4b44f",
    name: "UEFA Europa League",
    countryCode: "INT",
    slug: "uefa-europa-league--abe7M2o0ShmLt9IELeS0Tw",
    emblemUrl: "https://media.api-sports.io/football/leagues/3.png",
  },
  {
    id: "4e37e2a9-af76-4d61-9a91-6fd96dae3db4",
    name: "Eredivisie",
    countryCode: "NLD",
    slug: "eredivisie--Tjfiqa92TWGakW_Zba49tA",
    emblemUrl: "https://media.api-sports.io/football/leagues/88.png",
  },
];

// Presentation only: callers must supply real, localized product preferences.
// No prototype names, invented counts, or fallback to an unrelated competition.
export function competitionShortcuts(
  competitions: ReadonlyArray<Pick<Competition, "id" | "name" | "countryCode"> & { emblemUrl?: string; slug?: string }>,
  locale: Locale,
): PinnedCompetitionShortcut[] {
  const seen = new Set<string>();
  return competitions.flatMap((competition) => {
    if (!competition.name.trim() || seen.has(competition.id)) return [];
    try {
      const slug = entitySlug(competition.name, competition.id);
      const href = `/${locale}/competitions/${slug}`;
      seen.add(competition.id);
      return [{
        id: competition.id,
        name: competition.name,
        slug,
        countryCode: competition.countryCode,
        emblemUrl: competition.emblemUrl,
        href,
      }];
    } catch {
      return [];
    }
  });
}
