import "server-only";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { interpolateRuntimeLabel, todayRuntimeLabels } from "./runtime-labels";
import { buildPublicMatchSlug } from "@/features/match/public-match-url";
import { intelligenceCopy } from "./market-intelligence-copy";
import { corePredictionMarkets, predictionMarkets, type Match, type MatchState, type OracleMarket, type PredictionMarket, type TodayData, type TipOutcome } from "./types";

type ApiPrediction = { probability?: number | null; selections?: OracleMarket['selections']; evidence?: OracleMarket['evidence']; qualityTier?: string; predictionId: string | null; marketGroup: string; availability: string; marketType: string | null; marketValue: string | null; selection: string | null; shortSelection: string | null; confidence: number | null; odds: number | null; result?: unknown; valueAnalysis?: OracleMarket['valueAnalysis'] };
type ApiFixture = { livePrediction?: Match['livePrediction']; rankedSelection?: Match['rankedSelection']; id: string; matchHref: string | null; kickoffAt: string; status: { code: string; detail: string | null; elapsedMinute?: number | null }; score: { home: number | null; away: number | null }; homeTeam: { id: string; name: string; emblemUrl: string | null }; awayTeam: { id: string; name: string; emblemUrl: string | null }; predictions: ApiPrediction[] };
type ApiCompetition = { id: string; name: string; country: string | null; countryCode: string | null; countryFlagUrl: string | null; emblemUrl: string | null; fixtures: ApiFixture[] };
type TodayApiResponse = { ranking?: TodayData['ranking']; schemaVersion: "mbo-today-v2"; date: string; locale: string; meta: { freshness: "fresh" | "stale" }; summary: { totalFixtures: number; analyzedFixtures: number | null }; marketGroups: string[]; oraclePickFixtureId: string | null; oraclePick: ApiFixture | null; competitions: ApiCompetition[]; pagination: { page: number; pageSize: number; total: number; totalPages: number; hasMore: boolean; nextCursor: string | null }; performance: { state: "available" | "unavailable"; periodDays: number; settled: number | null; hitRate: number | null } };

export class TodayFeedError extends Error { constructor(readonly code: string) { super(code); } }
function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function parseResponse(value: unknown): TodayApiResponse {
  if (!isObject(value) || value.schemaVersion !== "mbo-today-v2" || !isObject(value.meta) || !isObject(value.summary) || !Array.isArray(value.marketGroups) || !Array.isArray(value.competitions) || !isObject(value.pagination) || !isObject(value.performance) || typeof value.pagination.hasMore !== "boolean" || !(typeof value.pagination.nextCursor === "string" || value.pagination.nextCursor === null) || !(isObject(value.oraclePick) || value.oraclePick === null)) throw new TodayFeedError("TODAY_INVALID_RESPONSE");
  const groups = value.marketGroups as unknown[]; const competitions = value.competitions as unknown[];
  if (!corePredictionMarkets.every((group) => groups.includes(group))) throw new TodayFeedError("TODAY_MARKET_CONTRACT_INCOMPLETE");
  for (const competition of competitions) {
    if (!isObject(competition) || !Array.isArray(competition.fixtures)) throw new TodayFeedError("TODAY_INVALID_RESPONSE");
    for (const fixture of competition.fixtures) { if (!isObject(fixture) || !Array.isArray(fixture.predictions)) throw new TodayFeedError("TODAY_FIXTURE_CONTRACT_INCOMPLETE"); const predictions = fixture.predictions as unknown[]; if (!corePredictionMarkets.every((group) => predictions.some((prediction) => isObject(prediction) && prediction.marketGroup === group))) throw new TodayFeedError("TODAY_FIXTURE_CONTRACT_INCOMPLETE"); }
  }
  return value as unknown as TodayApiResponse;
}
function stateFor(code: string): MatchState { if (["FT", "AET", "PEN"].includes(code)) return "finished"; if (["NS", "TBD", "PST", "CANC", "ABD", "AWD", "WO"].includes(code)) return "scheduled"; return "live"; }
function outcomeFor(value: unknown): TipOutcome | undefined { return value === "WON" ? "won" : value === "LOST" ? "lost" : value === "VOID" ? "void" : undefined; }
function shortName(name: string) { const words = name.split(/\s+/).filter(Boolean); return (words.length > 1 ? words.map((word) => word[0]).join("") : name.slice(0, 3)).slice(0, 3).toUpperCase(); }
function mapFixture(fixture: ApiFixture, locale: Locale, unavailableLabel: string): Match {
  const byGroup = new Map(fixture.predictions.map((prediction) => [prediction.marketGroup, prediction]));
  for (const marketGroup of predictionMarkets) if (!byGroup.has(marketGroup)) byGroup.set(marketGroup, { marketGroup, predictionId: null, availability: 'INSUFFICIENT_DATA', marketType: null, marketValue: null, selection: null, shortSelection: null, confidence: null, odds: null });
  const markets = Object.fromEntries(predictionMarkets.map((group) => { const prediction = byGroup.get(group)!; const selection = prediction.selection || unavailableLabel; const market: OracleMarket = { probability: prediction.probability, selections: prediction.selections, evidence: prediction.evidence, qualityTier: prediction.qualityTier, valueAnalysis: prediction.valueAnalysis ?? null, predictionId: prediction.predictionId, market: group, marketType: prediction.marketType, marketValue: prediction.marketValue, selection, shortSelection: prediction.shortSelection || selection, odds: prediction.odds === null ? null : new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(prediction.odds), confidence: prediction.confidence ?? 0, available: prediction.availability === "AVAILABLE", outcome: outcomeFor(prediction.result) }; return [group, market]; })) as Record<PredictionMarket, OracleMarket>;
  const state = stateFor(fixture.status.code); const exceptional = ["TBD", "PST", "CANC", "ABD", "AWD", "WO"].includes(fixture.status.code); const kickoff = state === "finished" ? "FT" : state === "live" || exceptional ? fixture.status.code : new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(fixture.kickoffAt));
  return { livePrediction: fixture.livePrediction, rankedSelection: fixture.rankedSelection, id: fixture.id, slug: fixture.matchHref?.split("/").at(-1) || buildPublicMatchSlug({ fixtureId: fixture.id, homeName: fixture.homeTeam.name, awayName: fixture.awayTeam.name }), kickoff, kickoffAt: fixture.kickoffAt, state, statusCode: fixture.status.code, elapsedMinute: fixture.status.elapsedMinute ?? null, score: fixture.score.home !== null || fixture.score.away !== null ? [fixture.score.home, fixture.score.away] : undefined, home: { id: fixture.homeTeam.id, name: fixture.homeTeam.name, shortName: shortName(fixture.homeTeam.name), emblemUrl: fixture.homeTeam.emblemUrl }, away: { id: fixture.awayTeam.id, name: fixture.awayTeam.name, shortName: shortName(fixture.awayTeam.name), emblemUrl: fixture.awayTeam.emblemUrl }, oracleScore: markets.ORACLE_PICK.confidence, insight: "", markets };
}
function mapResponse(api: TodayApiResponse, locale: Locale): TodayData {
  const runtime = todayRuntimeLabels[locale];
  const unavailable = getMessages(locale).common.unavailable;
  return {
    ranking: api.ranking,
    dateIso: `${api.date}T12:00:00.000Z`,
    totalMatches: api.summary.totalFixtures,
    analyzedMatches: api.summary.analyzedFixtures,
    oraclePickId: api.oraclePickFixtureId,
    freshness: api.meta.freshness,
    pagination: api.pagination,
    competitions: api.competitions.map((competition) => ({
      id: competition.id,
      country: competition.country || runtime.international,
      countryCode: competition.countryCode || "INT",
      countryFlagUrl: competition.countryFlagUrl,
      emblemUrl: competition.emblemUrl,
      name: competition.id === "ranked-discovery" ? (api.ranking?.view === "top" ? intelligenceCopy(locale)[20] : intelligenceCopy(locale)[21]) : competition.name,
      matches: competition.fixtures.map((fixture) => mapFixture(fixture, locale, unavailable)),
    })),
    oraclePick: api.oraclePick ? mapFixture(api.oraclePick, locale, unavailable) : null,
    performance: {
      available: api.performance.state === "available",
      period: interpolateRuntimeLabel(runtime.lastDays, { days: api.performance.periodDays }),
      hitRate: api.performance.hitRate === null ? null : api.performance.hitRate * 100,
      settled: api.performance.settled,
    },
  };
}

export async function getTodayData({ date, locale, page = 1, cursor, view = "all", marketGroup, search }: { date: string; locale: Locale; page?: number; cursor?: string; view?: "all" | "live" | "top" | "value"; marketGroup?: string; search?: string }): Promise<TodayData> {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, ""); const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) throw new TodayFeedError("TODAY_CONFIGURATION_ERROR");
  const url = new URL(`${baseUrl}/api/v3/today`); url.searchParams.set("date", date); url.searchParams.set("timezone", "Africa/Lagos"); url.searchParams.set("locale", locale); url.searchParams.set("page", String(page)); url.searchParams.set("pageSize", "120"); url.searchParams.set("view", view); if (marketGroup) url.searchParams.set("marketGroup", marketGroup); if (cursor) url.searchParams.set("cursor", cursor); if (search) url.searchParams.set("search", search);
  let response: Response; try { response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey } }); } catch { throw new TodayFeedError("TODAY_SERVICE_UNAVAILABLE"); }
  if (!response.ok) throw new TodayFeedError(response.status === 401 ? "TODAY_CONFIGURATION_ERROR" : "TODAY_SERVICE_UNAVAILABLE");
  try { return mapResponse(parseResponse(await response.json()), locale); } catch (error) { if (error instanceof TodayFeedError) throw error; throw new TodayFeedError("TODAY_INVALID_RESPONSE"); }
}
export function lagosDate(now = new Date()) { const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now); const value = Object.fromEntries(parts.map(({ type, value }) => [type, value])); return `${value.year}-${value.month}-${value.day}`; }
// Africa/Lagos carries no DST, so a fixed 24h offset from "now" always lands on the correct next calendar day in that zone.
export function tomorrowLagosDate(now = new Date()) { return lagosDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); }
