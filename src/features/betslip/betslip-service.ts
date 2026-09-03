import "server-only";
import type { Locale } from "@/i18n/config";
import type { DailyBetslip } from "./types";

type OracleDailyApiResponse = {
  schemaVersion: "mbo-oracle-daily-v1";
  date: string;
  timezone: string;
  locale: string;
  state: "available" | "unavailable";
  reason: string | null;
  publication: DailyBetslip | null;
  history: DailyBetslip["history"];
};

export class OracleDailyFeedError extends Error {
  constructor(readonly code: string) { super(code); }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parse(value: unknown): OracleDailyApiResponse {
  if (!isObject(value) || value.schemaVersion !== "mbo-oracle-daily-v1" || !["available", "unavailable"].includes(String(value.state)) || !Array.isArray(value.history)) {
    throw new OracleDailyFeedError("ORACLE_DAILY_INVALID_RESPONSE");
  }
  if (value.state === "available" && (!isObject(value.publication) || !Array.isArray(value.publication.legs))) {
    throw new OracleDailyFeedError("ORACLE_DAILY_INVALID_RESPONSE");
  }
  return value as unknown as OracleDailyApiResponse;
}

export async function getOracleDailyData({ date, locale }: { date: string; locale: Locale }) {
  const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!baseUrl || !serviceKey || serviceKey.length < 32) throw new OracleDailyFeedError("ORACLE_DAILY_CONFIGURATION_ERROR");
  const url = new URL(`${baseUrl}/api/v3/oracle-daily`);
  url.searchParams.set("date", date);
  url.searchParams.set("timezone", "Africa/Lagos");
  url.searchParams.set("locale", locale);
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey } });
  } catch {
    throw new OracleDailyFeedError("ORACLE_DAILY_SERVICE_UNAVAILABLE");
  }
  if (!response.ok) throw new OracleDailyFeedError(response.status === 400 ? "ORACLE_DAILY_INVALID_QUERY" : "ORACLE_DAILY_SERVICE_UNAVAILABLE");
  const api = parse(await response.json());
  if (api.state === "unavailable" || !api.publication) return { data: null, reason: api.reason || "no_eligible_publication", history: api.history };
  return { data: { ...api.publication, history: api.history }, reason: null, history: api.history };
}
