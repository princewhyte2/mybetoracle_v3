import "server-only";
import type { Locale } from "@/i18n/config";
import { metricByKey } from "./metric-catalog";
import { streakScopes, type StreakExplorerData, type StreakExplorerQuery, type StreakMetric, type StreakRecord, type StreakScope, type StreakTeam } from "./types";

type ApiTeam = { id: string; canonicalName: string; displayName: string; shortName: string | null; countryCode: string | null; emblemUrl: string | null };
type ApiCompetition = { id: string; canonicalName: string; displayName: string; countryCode: string | null; countryName: string | null; countryDisplayName: string | null; emblemUrl: string | null; countryFlagUrl: string | null };
type ApiItem = { id: string; scope: string; metric: string; currentLength: number; sampleSize: number; asOfAt: string; engineVersion: string; computedAt: string; evidenceAvailable: boolean; zeroHistory: boolean; team: ApiTeam; competition: ApiCompetition; sourceFixture: null | { id: string; kickoffAt: string; statusCode: string; score: { home: number | null; away: number | null }; teamVenue: "HOME" | "AWAY"; teamScore: number | null; opponentScore: number | null; opponent: ApiTeam } };
type ApiComparisonStreak = { metric: string; scope: string; currentLength: number };
type ApiUpcomingFixture = { id: string; kickoffAt: string; competition: ApiCompetition; home: { team: ApiTeam; streaks: ApiComparisonStreak[] }; away: { team: ApiTeam; streaks: ApiComparisonStreak[] } };
type ApiResponse = { schemaVersion: "mbo-streaks-v1"; asOf: string; locale: string; meta: { freshness: "fresh" | "stale"; engineVersions: string[] }; filters: { countries: Array<{ code: string; displayName: string; flagUrl: string | null }>; competitions: ApiCompetition[]; teams: ApiTeam[] }; items: ApiItem[]; selectedTeamProfile: null | { teamId: string | null; items: ApiItem[] }; upcomingFixtures: { state: "available" | "unavailable"; items: ApiUpcomingFixture[] }; pagination: { page: number; pageSize: number; total: number; totalPages: number } };

export class StreakFeedError extends Error {
  constructor(readonly code: string) { super(code); }
}

function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }

function parseResponse(value: unknown): ApiResponse {
  if (!isObject(value) || value.schemaVersion !== "mbo-streaks-v1" || !isObject(value.meta) || !isObject(value.filters) || !Array.isArray(value.items) || !isObject(value.pagination) || !isObject(value.upcomingFixtures)) throw new StreakFeedError("STREAKS_INVALID_RESPONSE");
  const validMetrics = new Set(metricByKey.keys());
  for (const item of value.items) {
    if (!isObject(item) || typeof item.id !== "string" || !streakScopes.includes(item.scope as (typeof streakScopes)[number]) || !validMetrics.has(item.metric as StreakMetric) || !isObject(item.team) || !isObject(item.competition)) throw new StreakFeedError("STREAKS_INVALID_RESPONSE");
  }
  return value as unknown as ApiResponse;
}

function fallbackShortName(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words.map((word) => word[0]).join("") : name.slice(0, 3)).slice(0, 3).toUpperCase();
}

function mapTeam(team: ApiTeam, competition?: ApiCompetition): StreakTeam {
  return {
    id: team.id,
    name: team.displayName,
    shortName: team.shortName || fallbackShortName(team.displayName),
    country: competition?.countryDisplayName || competition?.countryName || team.countryCode || "",
    competition: competition?.displayName || "",
    emblemUrl: team.emblemUrl,
  };
}

function mapRecord(item: ApiItem): StreakRecord {
  return {
    id: item.id,
    team: mapTeam(item.team, item.competition),
    metric: item.metric as StreakMetric,
    scope: item.scope as StreakRecord["scope"],
    currentLength: item.currentLength,
    sampleSize: item.sampleSize,
    asOfAt: item.asOfAt,
    engineVersion: item.engineVersion,
    evidenceAvailable: item.evidenceAvailable,
    zeroHistory: item.zeroHistory,
    sourceFixture: item.sourceFixture ? {
      id: item.sourceFixture.id,
      kickoffAt: item.sourceFixture.kickoffAt,
      opponent: item.sourceFixture.opponent.displayName,
      score: item.sourceFixture.teamScore === null || item.sourceFixture.opponentScore === null ? "—" : `${item.sourceFixture.teamScore}–${item.sourceFixture.opponentScore}`,
    } : undefined,
  };
}

function mapComparisonStreak(item: ApiComparisonStreak) {
  if (!streakScopes.includes(item.scope as StreakScope) || !metricByKey.has(item.metric as StreakMetric)) return null;
  return { metric: item.metric as StreakMetric, scope: item.scope as StreakScope, currentLength: item.currentLength };
}

function mapResponse(api: ApiResponse, query: StreakExplorerData["query"]): StreakExplorerData {
  const records = api.items.map(mapRecord);
  const profile = api.selectedTeamProfile?.items.map(mapRecord) || [];
  const teamMap = new Map<string, StreakTeam>();
  [...records, ...profile].forEach((record) => teamMap.set(record.team.id, record.team));
  api.filters.teams.forEach((team) => { if (!teamMap.has(team.id)) teamMap.set(team.id, mapTeam(team)); });
  const selectedTeamId = api.selectedTeamProfile?.teamId;
  return {
    asOf: api.asOf,
    engineVersion: api.meta.engineVersions.join(", ") || "—",
    freshness: api.meta.freshness,
    countries: api.filters.countries.map((country) => ({ code: country.code, name: country.displayName, flagUrl: country.flagUrl })),
    competitions: api.filters.competitions.map((competition) => ({ id: competition.id, name: competition.displayName, countryCode: competition.countryCode })),
    teams: [...teamMap.values()].sort((left, right) => left.name.localeCompare(right.name)),
    topStreaks: records,
    upcomingFixtures: api.upcomingFixtures.items.map((fixture) => ({
      id: fixture.id,
      kickoffAt: fixture.kickoffAt,
      competition: fixture.competition.displayName,
      home: mapTeam(fixture.home.team, fixture.competition),
      away: mapTeam(fixture.away.team, fixture.competition),
      homeStreaks: fixture.home.streaks.map(mapComparisonStreak).filter((item): item is NonNullable<typeof item> => item !== null),
      awayStreaks: fixture.away.streaks.map(mapComparisonStreak).filter((item): item is NonNullable<typeof item> => item !== null),
    })),
    upcomingState: api.upcomingFixtures.state,
    teamProfiles: selectedTeamId ? { [selectedTeamId]: profile } : {},
    query,
    pagination: api.pagination,
  };
}

export function lagosEvidenceDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function getStreakExplorerData({ locale, query, historicalAsOf }: { locale: Locale; query: StreakExplorerQuery & { sort: "length" | "team" | "sample"; page: number }; historicalAsOf?: string }): Promise<StreakExplorerData> {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) throw new StreakFeedError("STREAKS_CONFIGURATION_ERROR");
  const url = new URL(`${baseUrl}/api/v3/streaks`);
  const params: Record<string, string | number | undefined> = {
    asOf: historicalAsOf,
    countryCode: query.country,
    competitionId: query.competition,
    teamId: query.teamId,
    scope: query.scope,
    category: query.category,
    metric: query.metric,
    minimumLength: query.minimumLength,
    search: query.search,
    sort: query.sort,
    page: query.page,
    locale,
    pageSize: 20,
  };
  Object.entries(params).filter(([, value]) => value !== undefined && value !== "").forEach(([key, value]) => url.searchParams.set(key, String(value)));
  let response: Response;
  try { response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey } }); }
  catch { throw new StreakFeedError("STREAKS_SERVICE_UNAVAILABLE"); }
  if (!response.ok) throw new StreakFeedError(response.status === 400 ? "STREAKS_INVALID_QUERY" : "STREAKS_SERVICE_UNAVAILABLE");
  try { return mapResponse(parseResponse(await response.json()), query); }
  catch (error) { if (error instanceof StreakFeedError) throw error; throw new StreakFeedError("STREAKS_INVALID_RESPONSE"); }
}
