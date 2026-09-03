import "server-only";
import type { Locale } from "@/i18n/config";
import type { AccumulatorPageData, AccumulatorScope } from "./types";

type ApiScope = Omit<AccumulatorPageData, "date" | "timezone" | "scope" | "windowStart" | "windowEnd" | "updatedAt" | "history" | "availability" | "freshness"> & {
  state: "available" | "unavailable";
};
type MultiPicksApiResponse = {
  schemaVersion: "mbo-multi-picks-v1";
  date: string;
  timezone: string;
  locale: string;
  scopes: Record<AccumulatorScope, ApiScope>;
  history: { state: "available" | "unavailable"; items: AccumulatorPageData["history"] };
  meta: { servedAt: string; freshness: "fresh" | "stale" };
};

export class MultiPicksFeedError extends Error { constructor(readonly code: string) { super(code); } }
function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function parseResponse(value: unknown): MultiPicksApiResponse {
  if (!isObject(value) || value.schemaVersion !== "mbo-multi-picks-v1" || !isObject(value.scopes) || !isObject(value.scopes.DAILY) || !isObject(value.scopes.WEEKLY) || !isObject(value.history) || !isObject(value.meta)) throw new MultiPicksFeedError("MULTI_PICKS_INVALID_RESPONSE");
  for (const scope of [value.scopes.DAILY, value.scopes.WEEKLY]) {
    if (!Array.isArray(scope.items) || !Array.isArray(scope.bands) || !["available", "unavailable"].includes(String(scope.state))) throw new MultiPicksFeedError("MULTI_PICKS_INVALID_RESPONSE");
  }
  return value as unknown as MultiPicksApiResponse;
}
function fallbackWindow(date: string, scope: AccumulatorScope) {
  const selected = new Date(`${date}T12:00:00.000Z`);
  if (scope === "WEEKLY") {
    const mondayOffset = (selected.getUTCDay() + 6) % 7;
    selected.setUTCDate(selected.getUTCDate() - mondayOffset);
    const start = selected.toISOString().slice(0, 10);
    selected.setUTCDate(selected.getUTCDate() + 6);
    return { start: `${start}T00:00:00.000Z`, end: `${selected.toISOString().slice(0, 10)}T23:59:59.999Z` };
  }
  return { start: `${date}T00:00:00.000Z`, end: `${date}T23:59:59.999Z` };
}
function mapScope(api: MultiPicksApiResponse, scope: AccumulatorScope): AccumulatorPageData {
  const selected = api.scopes[scope];
  const first = selected.items[0];
  const fallback = fallbackWindow(api.date, scope);
  return {
    date: api.date, timezone: api.timezone, scope,
    windowStart: first?.windowStart ?? fallback.start, windowEnd: first?.windowEnd ?? fallback.end,
    updatedAt: api.meta.servedAt, bands: selected.bands, items: selected.items,
    history: api.history.items, availability: selected.state, freshness: api.meta.freshness,
  };
}

export async function getMultiPicksData({ date, locale }: { date: string; locale: Locale }) {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) throw new MultiPicksFeedError("MULTI_PICKS_CONFIGURATION_ERROR");
  const url = new URL(`${baseUrl}/api/v3/multi-picks`);
  url.searchParams.set("date", date); url.searchParams.set("timezone", "Africa/Lagos"); url.searchParams.set("locale", locale);
  let response: Response;
  try { response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey } }); }
  catch { throw new MultiPicksFeedError("MULTI_PICKS_SERVICE_UNAVAILABLE"); }
  if (!response.ok) throw new MultiPicksFeedError(response.status === 400 ? "MULTI_PICKS_INVALID_QUERY" : "MULTI_PICKS_SERVICE_UNAVAILABLE");
  try { const api = parseResponse(await response.json()); return { daily: mapScope(api, "DAILY"), weekly: mapScope(api, "WEEKLY") }; }
  catch (error) { if (error instanceof MultiPicksFeedError) throw error; throw new MultiPicksFeedError("MULTI_PICKS_INVALID_RESPONSE"); }
}

export function lagosProductDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
