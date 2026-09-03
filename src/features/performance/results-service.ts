import "server-only";
import type { Locale } from "@/i18n/config";
import type { MarketGroup, PerformanceData, ResultsData, SettledPrediction, SettledResult } from "./types";

type ResultsRequest = { from: string; to: string; market?: MarketGroup; result?: SettledResult; page?: number; pageSize?: number };
type ApiResponse = {
  schemaVersion: "mbo-results-v1"; from: string; to: string;
  summary: PerformanceData["summary"] & { decided: number };
  byMarket: PerformanceData["byMarket"]; byOracleBand: PerformanceData["byOracleBand"];
  accumulators: { state: "available" | "unavailable"; items: unknown[] };
  items: Array<Omit<SettledPrediction, "finalScore" | "homeEmblemUrl" | "awayEmblemUrl" | "competitionEmblemUrl" | "countryFlagUrl"> & {
    finalScore: { home: number | null; away: number | null };
    identity: { competition: { emblemUrl: string | null; countryFlagUrl: string | null }; homeTeam: { emblemUrl: string | null }; awayTeam: { emblemUrl: string | null } };
  }>;
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  meta: { servedAt: string; freshness: "fresh" | "stale" };
};

export class ResultsFeedError extends Error { constructor(readonly code: string) { super(code); } }
function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function parseResponse(value: unknown): ApiResponse {
  if (!isObject(value) || value.schemaVersion !== "mbo-results-v1" || !isObject(value.summary) || !Array.isArray(value.byMarket) || !Array.isArray(value.byOracleBand) || !isObject(value.accumulators) || !Array.isArray(value.items) || !isObject(value.pagination) || !isObject(value.meta)) throw new ResultsFeedError("RESULTS_INVALID_RESPONSE");
  return value as unknown as ApiResponse;
}
function mapItem(item: ApiResponse["items"][number]): SettledPrediction {
  return { ...item, finalScore: [item.finalScore.home, item.finalScore.away], homeEmblemUrl: item.identity.homeTeam.emblemUrl, awayEmblemUrl: item.identity.awayTeam.emblemUrl, competitionEmblemUrl: item.identity.competition.emblemUrl, countryFlagUrl: item.identity.competition.countryFlagUrl };
}

export async function getResultsData({ locale, ...query }: { locale: Locale } & ResultsRequest): Promise<{ predictions: ResultsData; performance: PerformanceData }> {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) throw new ResultsFeedError("RESULTS_CONFIGURATION_ERROR");
  const url = new URL(`${baseUrl}/api/v3/results`);
  url.searchParams.set("from", query.from); url.searchParams.set("to", query.to); url.searchParams.set("timezone", "Africa/Lagos"); url.searchParams.set("locale", locale);
  if (query.market) url.searchParams.set("marketGroup", query.market);
  if (query.result) url.searchParams.set("result", query.result);
  url.searchParams.set("page", String(query.page ?? 1)); url.searchParams.set("pageSize", String(query.pageSize ?? 50));
  let response: Response;
  try { response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey } }); }
  catch { throw new ResultsFeedError("RESULTS_SERVICE_UNAVAILABLE"); }
  if (!response.ok) throw new ResultsFeedError(response.status === 400 ? "RESULTS_INVALID_QUERY" : "RESULTS_SERVICE_UNAVAILABLE");
  let api: ApiResponse;
  try { api = parseResponse(await response.json()); } catch (error) { if (error instanceof ResultsFeedError) throw error; throw new ResultsFeedError("RESULTS_INVALID_RESPONSE"); }
  const items = api.items.map(mapItem);
  return {
    predictions: { asOf: api.meta.servedAt, query: { from: api.from, to: api.to, market: query.market, result: query.result, page: api.pagination.page, pageSize: api.pagination.pageSize }, items, total: api.pagination.total, totalPages: Math.max(1, api.pagination.totalPages) },
    performance: { asOf: api.meta.servedAt, periodDays: daysInclusive(api.from, api.to), methodologyVersion: "settlement-v3", summary: api.summary, byMarket: api.byMarket, byOracleBand: api.byOracleBand, accumulators: [], accumulatorsAvailable: api.accumulators.state === "available", recentResults: items.slice(0, 8) },
  };
}

function daysInclusive(from: string, to: string) { return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1; }
export function lagosResultsDate(now = new Date()) { const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now); const values = Object.fromEntries(parts.map(({ type, value }) => [type, value])); return `${values.year}-${values.month}-${values.day}`; }
export function daysBefore(date: string, days: number) { const value = new Date(`${date}T12:00:00.000Z`); value.setUTCDate(value.getUTCDate() - days + 1); return value.toISOString().slice(0, 10); }
