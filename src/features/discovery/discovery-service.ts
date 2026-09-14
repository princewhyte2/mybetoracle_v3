import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { getTodayData, lagosDate } from "@/features/today/today-service";
import type { Match, PredictionMarket, TodayData } from "@/features/today/types";
import { entitySlug, readableSlug } from "./public-id";
import type {
  CompetitionEntity,
  CountryEntity,
  DiscoveryData,
  DiscoveryFixture,
  MarketEntity,
  TeamEntity,
} from "./types";

type Pagination = { page: number; pageSize: number; total: number; totalPages: number };
type CatalogResponse<T> = {
  schemaVersion: "mbo-catalog-v1";
  entity: string;
  locale: string;
  items: T[];
  pagination: Pagination;
};
type CatalogCountry = { id: string; code: string; canonicalName: string; displayName: string; flagUrl: string | null; competitionCount: number; teamCount: number };
type CatalogCompetition = { id: string; canonicalName: string; displayName: string; type: string | null; countryCode: string | null; countryName: string | null; countryDisplayName: string | null; emblemUrl: string | null; countryFlagUrl: string | null; fixtureCount: number };
type CatalogTeam = { id: string; canonicalName: string; displayName: string; shortName: string | null; countryCode: string | null; emblemUrl: string | null; fixtureCount: number; streakEvidenceCount: number };
type CatalogMarket = { id: string; code: string; activePredictionCount: number; settledSample: number; won: number; hitRate: number | null };

export class DiscoveryDataError extends Error {
  constructor(readonly code: string) { super(code); }
}

export const marketPresentation: Record<string, { slug: string; name: string; shortName: string }> = {
  MIXED: { slug: "mixed", name: "Mixed Markets", shortName: "Mixed" },
  REGULAR: { slug: "match-result", name: "Match Result", shortName: "1X2" },
  DOUBLE_CHANCE: { slug: "double-chance", name: "Double Chance", shortName: "DC" },
  BTTS: { slug: "both-teams-score", name: "Both Teams to Score", shortName: "BTTS" },
  TOTAL_1_5: { slug: "total-1-5", name: "Over / Under 1.5", shortName: "O/U 1.5" },
  TOTAL_2_5: { slug: "total-2-5", name: "Over / Under 2.5", shortName: "O/U 2.5" },
  TOTAL_3_5: { slug: "total-3-5", name: "Over / Under 3.5", shortName: "O/U 3.5" },
  GOALS_BAND: { slug: "goals-band", name: "Goals Band", shortName: "Goals" },
  HALFTIME_RESULT: { slug: "halftime-result", name: "Half-time Result", shortName: "HT" },
  HANDICAP: { slug: "handicap", name: "Handicap", shortName: "HCP" },
  CORRECT_SCORE: { slug: "correct-score", name: "Correct Score", shortName: "Score" },
  CORNERS: { slug: "corners", name: "Corners", shortName: "Corners" },
  CARDS: { slug: "cards", name: "Cards", shortName: "Cards" },
  TEAM_TO_SCORE: { slug: "team-to-score", name: "Team to Score", shortName: "TTS" },
};

const marketGroupBySlug = new Map(
  Object.entries(marketPresentation).map(([group, presentation]) => [presentation.slug, group]),
);
// MIXED and ORACLE_PICK are internal aggregate views, not real bookmaker
// market types -- excluded from the scope x market fanout pages, which
// exist to mirror Forebet/PredictZ's per-market-type crawlable pages.
export function marketGroupForSlug(slug: string): string | null {
  if (slug === "mixed" || slug === "oracle-best") return null;
  return marketGroupBySlug.get(slug) ?? null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseCatalog<T>(value: unknown, entity: string): CatalogResponse<T> {
  if (
    !isObject(value) ||
    value.schemaVersion !== "mbo-catalog-v1" ||
    value.entity !== entity ||
    !Array.isArray(value.items) ||
    !isObject(value.pagination) ||
    typeof value.pagination.page !== "number" ||
    typeof value.pagination.totalPages !== "number"
  ) throw new DiscoveryDataError("DISCOVERY_INVALID_RESPONSE");
  return value as CatalogResponse<T>;
}

async function catalogPage<T>(entity: string, locale: Locale, page: number, search?: string, id?: string) {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) {
    throw new DiscoveryDataError("DISCOVERY_CONFIGURATION_ERROR");
  }
  const url = new URL(`${baseUrl}/api/v3/discovery/catalog`);
  url.searchParams.set("entity", entity);
  url.searchParams.set("locale", locale);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", "100");
  if (search) url.searchParams.set("search", search);
  if (id) url.searchParams.set("id", id);
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey },
    });
  } catch {
    throw new DiscoveryDataError("DISCOVERY_SERVICE_UNAVAILABLE");
  }
  if (!response.ok) {
    throw new DiscoveryDataError(response.status === 401
      ? "DISCOVERY_CONFIGURATION_ERROR"
      : "DISCOVERY_SERVICE_UNAVAILABLE");
  }
  return parseCatalog<T>(await response.json(), entity);
}

async function allCatalog<T>(entity: string, locale: Locale, maximumPages: number) {
  const first = await catalogPage<T>(entity, locale, 1);
  const pageCount = Math.min(first.pagination.totalPages, maximumPages);
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      catalogPage<T>(entity, locale, index + 2),
    ),
  );
  const items = [first, ...remaining].flatMap((catalogue) => catalogue.items);
  return {
    items,
    pagination: {
      ...first.pagination,
      page: pageCount,
      pageSize: items.length,
    },
  };
}

function colors(id: string): [string, string] {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return [`hsl(${hue} 62% 38%)`, `hsl(${(hue + 42) % 360} 68% 92%)`];
}

function selection(match: Match) {
  return Object.entries(match.markets)
    .filter(([, market]) => market.available && market.selection)
    .sort((left, right) => right[1].confidence - left[1].confidence)[0] as
    | [PredictionMarket, Match["markets"][PredictionMarket]]
    | undefined;
}

function indexToday(today: TodayData) {
  const competitions = new Map(today.competitions.map((item) => [item.id, item]));
  const teamActivity = new Map<string, {
    competitionId: string;
    opponent: string;
    oracleScore: number;
  }>();
  for (const competition of today.competitions) {
    for (const match of competition.matches) {
      if (match.home.id) teamActivity.set(match.home.id, {
        competitionId: competition.id,
        opponent: match.away.name,
        oracleScore: Math.max(teamActivity.get(match.home.id)?.oracleScore ?? 0, match.oracleScore),
      });
      if (match.away.id) teamActivity.set(match.away.id, {
        competitionId: competition.id,
        opponent: match.home.name,
        oracleScore: Math.max(teamActivity.get(match.away.id)?.oracleScore ?? 0, match.oracleScore),
      });
    }
  }
  return { competitions, teamActivity };
}

function mapFixtures(
  today: TodayData,
  competitionSlugs: Map<string, string>,
  teamSlugs: Map<string, string>,
): DiscoveryFixture[] {
  return today.competitions.flatMap((competition) =>
    competition.matches.flatMap((match) => {
      const selected = selection(match);
      if (!selected || !match.kickoffAt || !match.home.id || !match.away.id) return [];
      const [marketGroup, market] = selected;
      return [{
        id: match.id,
        slug: null,
        kickoffAt: match.kickoffAt,
        competitionSlug: competitionSlugs.get(competition.id) ?? "",
        homeSlug: teamSlugs.get(match.home.id) ?? "",
        awaySlug: teamSlugs.get(match.away.id) ?? "",
        marketSlug: marketPresentation[marketGroup]?.slug ?? readableSlug(marketGroup),
        pick: market.selection,
        odds: market.odds === null ? null : Number(market.odds.replace(",", ".")),
        oracleScore: market.confidence,
        state: match.state,
        score: match.score,
      }];
    }),
  );
}

export async function getDiscoveryData({
  locale,
  date = lagosDate(),
}: {
  locale: Locale;
  date?: string;
}): Promise<DiscoveryData> {
  const [countryCatalog, competitionCatalog, teamCatalog, marketCatalog, today] = await Promise.all([
    allCatalog<CatalogCountry>("countries", locale, 1),
    allCatalog<CatalogCompetition>("competitions", locale, 1),
    allCatalog<CatalogTeam>("teams", locale, 1),
    allCatalog<CatalogMarket>("markets", locale, 1),
    getTodayData({ date, locale }),
  ]);
  const countryRows = countryCatalog.items;
  const competitionRows = competitionCatalog.items;
  const teamRows = teamCatalog.items;
  const marketRows = marketCatalog.items;
  const competitionRowMap = new Map(competitionRows.map((item) => [item.id, item]));
  const teamRowMap = new Map(teamRows.map((item) => [item.id, item]));
  for (const competition of today.competitions) {
    if (!competitionRowMap.has(competition.id)) competitionRowMap.set(competition.id, {
      id: competition.id,
      canonicalName: competition.name,
      displayName: competition.name,
      type: null,
      countryCode: competition.countryCode,
      countryName: competition.country,
      countryDisplayName: competition.country,
      emblemUrl: competition.emblemUrl ?? null,
      countryFlagUrl: competition.countryFlagUrl ?? null,
      fixtureCount: competition.matches.length,
    });
    for (const match of competition.matches) {
      for (const team of [match.home, match.away]) {
        if (!team.id || teamRowMap.has(team.id)) continue;
        teamRowMap.set(team.id, {
          id: team.id,
          canonicalName: team.name,
          displayName: team.name,
          shortName: team.shortName,
          countryCode: competition.countryCode,
          emblemUrl: team.emblemUrl ?? null,
          fixtureCount: 1,
          streakEvidenceCount: 0,
        });
      }
    }
  }
  const effectiveCompetitionRows = [...competitionRowMap.values()];
  const effectiveTeamRows = [...teamRowMap.values()];
  const { competitions: todayCompetitions, teamActivity } = indexToday(today);
  const countrySlugs = new Map(countryRows.map((item) => [
    item.code,
    `${readableSlug(item.displayName)}--${item.code.toLowerCase()}`,
  ]));
  const competitionSlugs = new Map(effectiveCompetitionRows.map((item) => [
    item.id,
    entitySlug(item.displayName, item.id),
  ]));
  const teamSlugs = new Map(effectiveTeamRows.map((item) => [
    item.id,
    entitySlug(item.displayName, item.id),
  ]));

  const countries: CountryEntity[] = countryRows.map((item) => ({
    slug: countrySlugs.get(item.code)!,
    name: item.displayName,
    code: item.code,
    flagUrl: item.flagUrl,
    competitions: item.competitionCount,
    teams: item.teamCount,
    matchesToday: today.competitions
      .filter((competition) => competition.countryCode === item.code)
      .reduce((sum, competition) => sum + competition.matches.length, 0),
  }));
  const competitions: CompetitionEntity[] = effectiveCompetitionRows.map((item) => {
    const active = todayCompetitions.get(item.id);
    return {
      id: item.id,
      slug: competitionSlugs.get(item.id)!,
      name: item.displayName,
      countrySlug: item.countryCode
        ? countrySlugs.get(item.countryCode) ?? `country--${item.countryCode.toLowerCase()}`
        : "international",
      country: item.countryDisplayName || item.countryName || item.countryCode || "International",
      code: item.countryCode || "INT",
      emblemUrl: item.emblemUrl,
      countryFlagUrl: item.countryFlagUrl,
      color: colors(item.id)[0],
      fixtures: active?.matches.length ?? 0,
      oraclePicks: active?.matches.filter((match) => selection(match)).length ?? 0,
      followers: null,
      description: "",
    };
  });
  const teams: TeamEntity[] = effectiveTeamRows.map((item) => {
    const activity = teamActivity.get(item.id);
    return {
      id: item.id,
      slug: teamSlugs.get(item.id)!,
      name: item.displayName,
      shortName: item.shortName || item.displayName.slice(0, 3).toUpperCase(),
      emblemUrl: item.emblemUrl,
      countrySlug: item.countryCode
        ? countrySlugs.get(item.countryCode) ?? `country--${item.countryCode.toLowerCase()}`
        : "international",
      competitionSlug: activity
        ? competitionSlugs.get(activity.competitionId) ?? null
        : null,
      colors: colors(item.id),
      position: null,
      form: [],
      nextOpponent: activity?.opponent ?? null,
      streak: null,
      oracleScore: activity?.oracleScore ?? null,
    };
  });
  const fixtures = mapFixtures(today, competitionSlugs, teamSlugs);
  const publishedByMarket = new Map<string, number>();
  for (const fixture of fixtures) {
    publishedByMarket.set(
      fixture.marketSlug,
      (publishedByMarket.get(fixture.marketSlug) ?? 0) + 1,
    );
  }
  const markets: MarketEntity[] = marketRows.map((item) => {
    const presentation = marketPresentation[item.code] ?? {
      slug: readableSlug(item.code),
      name: item.code.replaceAll("_", " "),
      shortName: item.code,
    };
    return {
      ...presentation,
      code: item.code,
      description: "",
      publishedToday: publishedByMarket.get(presentation.slug) ?? 0,
      hitRate: item.hitRate === null ? null : item.hitRate * 100,
      settledSample: item.settledSample,
    };
  });
  const catalog = {
    countries: catalogMeta(countryCatalog.pagination, countries.length),
    competitions: catalogMeta(competitionCatalog.pagination, competitions.length),
    teams: catalogMeta(teamCatalog.pagination, teams.length),
    markets: catalogMeta(marketCatalog.pagination, markets.length),
  };
  return { date, countries, competitions, teams, markets, fixtures, catalog };
}

function catalogMeta(pagination: Pagination, loaded: number) {
  return {
    loaded,
    total: pagination.total,
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : null,
    totalPages: pagination.totalPages,
  };
}

export async function getDiscoveryCatalogSlice({
  locale,
  section,
  page,
  search,
  id,
}: {
  locale: Locale;
  section: "countries" | "competitions" | "teams" | "markets";
  page: number;
  search?: string;
  id?: string;
}) {
  const response = section === "countries"
    ? await catalogPage<CatalogCountry>(section, locale, page, search, id)
    : section === "competitions"
      ? await catalogPage<CatalogCompetition>(section, locale, page, search, id)
      : section === "teams"
        ? await catalogPage<CatalogTeam>(section, locale, page, search, id)
        : await catalogPage<CatalogMarket>(section, locale, page, search, id);
  const items = section === "countries"
    ? (response.items as CatalogCountry[]).map((item): CountryEntity => ({ slug: `${readableSlug(item.displayName)}--${item.code.toLowerCase()}`, name: item.displayName, code: item.code, flagUrl: item.flagUrl, competitions: item.competitionCount, teams: item.teamCount, matchesToday: 0 }))
    : section === "competitions"
      ? (response.items as CatalogCompetition[]).map((item): CompetitionEntity => ({ id: item.id, slug: entitySlug(item.displayName, item.id), name: item.displayName, countrySlug: item.countryCode ? `country--${item.countryCode.toLowerCase()}` : "international", country: item.countryDisplayName || item.countryName || item.countryCode || "International", code: item.countryCode || "INT", emblemUrl: item.emblemUrl, countryFlagUrl: item.countryFlagUrl, color: colors(item.id)[0], fixtures: item.fixtureCount, oraclePicks: 0, followers: null, description: "" }))
      : section === "teams"
        ? (response.items as CatalogTeam[]).map((item): TeamEntity => ({ id: item.id, slug: entitySlug(item.displayName, item.id), name: item.displayName, shortName: item.shortName || item.displayName.slice(0, 3).toUpperCase(), emblemUrl: item.emblemUrl, countrySlug: item.countryCode ? `country--${item.countryCode.toLowerCase()}` : "international", competitionSlug: null, colors: colors(item.id), position: null, form: [], nextOpponent: null, streak: null, oracleScore: null }))
        : (response.items as CatalogMarket[]).map((item): MarketEntity => { const presentation = marketPresentation[item.code] ?? { slug: readableSlug(item.code), name: item.code.replaceAll("_", " "), shortName: item.code }; return { ...presentation, code: item.code, description: "", publishedToday: item.activePredictionCount, hitRate: item.hitRate === null ? null : item.hitRate * 100, settledSample: item.settledSample }; });
  return { items, pagination: response.pagination };
}

export const getCachedDiscoveryData = cache(
  (locale: Locale, date?: string) => getDiscoveryData({ locale, date }),
);
