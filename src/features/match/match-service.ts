import "server-only";
import type { Locale } from "@/i18n/config";
import { encodedEntityId } from "@/features/discovery/public-id";
import { metricByKey, metricShortLabel } from "@/features/streaks/metric-catalog";
import type { StreakMetric } from "@/features/streaks/types";
import type { LineupPlayer, RecentMatch, MatchDetail, MatchStreak } from "./types";
import type { OracleMarket } from "@/features/today/types";

type UnknownRecord = Record<string, unknown>;
type Availability = "available" | "not_available" | "not_confirmed";

export class MatchDetailError extends Error {
  constructor(readonly code: "MATCH_NOT_FOUND" | "MATCH_UNAVAILABLE" | "MATCH_INVALID_RESPONSE" | "MATCH_CONFIGURATION_ERROR") { super(code); }
}

function object(value: unknown): UnknownRecord | null { return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null; }
function text(value: unknown): string | null { return typeof value === "string" && value.length ? value : null; }
function number(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null; }
function items(section: unknown): unknown[] { const value = object(section); return Array.isArray(value?.items) ? value.items : []; }
function availability(section: unknown, fallback: Availability = "not_available"): Availability { const value = object(section)?.availability; return value === "available" || value === "not_confirmed" || value === "not_available" ? value : fallback; }
function shortName(name: string) { const parts = name.split(/\s+/).filter(Boolean); return (parts.length > 1 ? parts.map((part) => part[0]).join("") : name.slice(0, 3)).slice(0, 3).toUpperCase(); }
function status(code: string): MatchDetail["status"] { if (["FT", "AET", "PEN"].includes(code)) return "finished"; if (["NS", "TBD", "PST", "CANC", "ABD", "AWD", "WO"].includes(code)) return "scheduled"; return "live"; }
function outcome(value: unknown): OracleMarket["outcome"] { return value === "WON" ? "won" : value === "LOST" ? "lost" : value === "VOID" ? "void" : undefined; }

export function parseMatch(payload: unknown, locale: Locale): MatchDetail {
  const root = object(payload); const fixture = object(root?.fixture); const home = object(fixture?.homeTeam); const away = object(fixture?.awayTeam); const competition = object(fixture?.competition);
  const fixtureId = text(root?.fixtureId); const canonicalSlug = text(root?.canonicalSlug); const canonicalPath = text(root?.canonicalPath);
  const homeName = text(home?.displayName); const awayName = text(away?.displayName); const kickoffAt = text(fixture?.kickoffAt); const statusCode = text(fixture?.statusCode);
  if (!root || !fixture || !home || !away || root.schemaVersion !== "mbo-match-v1" || !fixtureId || !canonicalSlug || !canonicalPath || !homeName || !awayName || !kickoffAt || !statusCode || !competition) throw new MatchDetailError("MATCH_INVALID_RESPONSE");
  const predictions = Array.isArray(fixture.predictions) ? fixture.predictions.flatMap((entry): OracleMarket[] => {
    const prediction = object(entry); if (!prediction) return [];
    const group = text(prediction.marketGroup) ?? ""; const latestOdds = Array.isArray(prediction.latestOdds) ? object(prediction.latestOdds[0]) : null;
    return [{ predictionId: text(prediction.id), market: group, marketType: text(prediction.marketType), marketValue: text(prediction.marketValue), selection: text(prediction.selectionLabel) ?? "Unavailable", shortSelection: text(prediction.selectionShortLabel) ?? "Unavailable", odds: number(latestOdds?.decimalOdds)?.toFixed(2) ?? null, confidence: number(prediction.confidenceScore) ?? 0, available: prediction.availability === "AVAILABLE", outcome: outcome(prediction.result) }];
  }) : [];
  const oracle = predictions.find((prediction) => prediction.market === "ORACLE_PICK") ?? predictions[0] ?? { predictionId: null, market: "ORACLE_PICK", marketType: null, marketValue: null, selection: "Unavailable", shortSelection: "Unavailable", odds: null, confidence: 0, available: false };
  const streaks = items(root.streaks).flatMap((entry): MatchStreak[] => {
    const streak = object(entry); const team = object(streak?.team); const metric = text(streak?.metric) as StreakMetric | null; const scope = text(streak?.scope); const id = text(streak?.id); const teamId = text(team?.id);
    if (!streak || !id || !teamId || !metric || !metricByKey.has(metric) || !["OVERALL", "HOME", "AWAY"].includes(scope ?? "")) return [];
    const category = metricByKey.get(metric)?.category;
    return [{ id, teamId, metric, shortLabel: metricShortLabel(metric, locale), scope: scope as MatchStreak["scope"], currentLength: number(streak.currentLength) ?? 0, sampleSize: number(streak.sampleSize) ?? 0, category: category === "results" ? "Results" : category === "firstHalf" ? "First Half" : category === "secondHalf" ? "Second Half" : "Goals" }];
  });
  const h2h = items(root.h2h).flatMap((entry) => {
    const row = object(entry); const rowHome = object(row?.homeTeam); const rowAway = object(row?.awayTeam); const rowCompetition = object(row?.competition);
    const id = text(row?.id); const date = text(row?.kickoffAt); const h = text(rowHome?.displayName); const a = text(rowAway?.displayName); const hs = number(row?.homeScore); const as = number(row?.awayScore);
    return id && date && h && a && hs !== null && as !== null ? [{ id, date, competition: text(rowCompetition?.displayName) ?? "", home: h, away: a, score: [hs, as] as [number, number] }] : [];
  });
  const recentFor = (teamId: string): RecentMatch[] => {
    const rows = items(root.recentResults).map(object).find(row => row?.teamId === teamId);
    return (Array.isArray(rows?.fixtures) ? rows.fixtures : []).flatMap(entry => {
      const row=object(entry), h=object(row?.homeTeam), a=object(row?.awayTeam);
      const id=text(row?.id), date=text(row?.kickoffAt), hn=text(h?.displayName), an=text(a?.displayName), hs=number(row?.homeScore), as=number(row?.awayScore);
      if(!id || !date || !hn || !an || hs===null || as===null || Date.parse(date)>=Date.parse(kickoffAt)) return [];
      const scored=h?.id===teamId?hs:as, conceded=h?.id===teamId?as:hs;
      return [{id,date,home:hn,away:an,score:[hs,as] as [number,number],result:scored===conceded?"D" as const:scored>conceded?"W" as const:"L" as const}];
    });
  };
  const recentHome=recentFor(text(home.id) ?? ""), recentAway=recentFor(text(away.id) ?? "");
  const score = object(fixture.score); const homeScore = number(score?.home); const awayScore = number(score?.away);
  const lineups = items(root.lineups).map(object).filter((item): item is UnknownRecord => Boolean(item));
  const homeLineup = lineups.find((item) => text(item.teamId) === text(home.id));
  const awayLineup = lineups.find((item) => text(item.teamId) === text(away.id));
  const lineupPlayers = (lineup: UnknownRecord | undefined): LineupPlayer[] => Array.isArray(lineup?.players) ? lineup.players.flatMap((entry) => {
    const player = object(entry); const name = text(player?.displayName); const id=text(player?.id);
    const photo = text(player?.photoUrl);
    const photoUrl = photo && /^https:\/\/media\.api-sports\.io\/football\/players\/[1-9]\d{0,14}\.png$/.test(photo) ? photo : null;
    return name && id ? [{id,name,number:number(player?.number),grid:text(player?.grid),starter:player?.isStarter===true,photoUrl}] : [];
  }) : [];
  const statistics = items(root.statistics).map(object).filter((item): item is UnknownRecord => Boolean(item));
  const metricNames = [...new Set(statistics.flatMap((item) => text(item.metric) ? [`${text(item.period) ?? "MATCH"}:${text(item.metric)!}`] : []))];
  const comparison = metricNames.flatMap((key): MatchDetail["comparison"] => {
    const [period,metric]=key.split(":");
    const homeValue = statistics.find((item) => text(item.metric) === metric && (text(item.period) ?? "MATCH") === period && text(item.teamId) === text(home.id));
    const awayValue = statistics.find((item) => text(item.metric) === metric && (text(item.period) ?? "MATCH") === period && text(item.teamId) === text(away.id));
    const h = number(homeValue?.value); const a = number(awayValue?.value);
    return h !== null && a !== null ? [{ period, label: metric.replaceAll("_", " "), home: h, away: a, format: text(homeValue?.displayValue)?.includes("%") || text(awayValue?.displayValue)?.includes("%") ? "percent" : !Number.isInteger(h) || !Number.isInteger(a) ? "decimal" : "number" }] : [];
  });
  const playerRows=items(root.playerStatistics).map(object).filter((row):row is UnknownRecord=>Boolean(row));
  const playerStatistics:NonNullable<MatchDetail["playerStatistics"]>=[];
  const playerMap=new Map<string,NonNullable<MatchDetail["playerStatistics"]>[number]>();
  const playerMetrics:Record<string,"rating"|"minutes"|"goals"|"assists">={GAMES_RATING:"rating",GAMES_MINUTES:"minutes",GOALS_TOTAL:"goals",GOALS_ASSISTS:"assists"};
  for(const row of playerRows) {
    const id=text(row.providerPlayerId),teamId=text(row.teamId),name=text(row.displayName),metric=playerMetrics[text(row.metric) ?? ""];
    if(!id || !teamId || !name || !metric)continue;
    const key=teamId+":"+id;
    let player=playerMap.get(key);
    if(!player){player={id:key,teamId,name,rating:null,minutes:null,goals:null,assists:null};playerMap.set(key,player);playerStatistics.push(player);}
    player[metric]=number(row.value);
  }
  const standingRows = items(root.standings).map(object).filter((item): item is UnknownRecord => Boolean(item));
  const events = items(root.events).flatMap((entry) => {
    const event = object(entry); const id = text(event?.id); if (!id) return [];
    return [{ id, teamId: text(event?.teamId), minute: number(event?.elapsedMinute), extra: number(event?.elapsedExtra), type: text(event?.eventType) ?? "OTHER", detail: text(event?.detail), player: text(event?.playerName), assist: text(event?.assistName) }];
  });
  const competitionName = text(competition.displayName) ?? text(competition.canonicalName) ?? "Competition";
  const venue = object(fixture.venue);
  return {
    id: fixtureId, slug: canonicalSlug, canonicalPath, status: status(statusCode), statusCode, kickoffAt,
    competition: { id: text(competition.id) ?? "", name: competitionName, country: text(competition.countryDisplayName) ?? text(competition.countryName) ?? "", countryCode: text(competition.countryCode) ?? "INT", round: text(fixture.round) ?? "" },
    venue: text(venue?.displayName) ?? text(venue?.name), city: text(venue?.city), referee: text(fixture.refereeName),
    home: { id: text(home?.id) ?? "", name: homeName, shortName: text(home?.shortName) ?? shortName(homeName), country: "", colors: ["#155EEF", "#D7E8FF"], form: recentHome.map(row=>row.result), emblemUrl: text(home?.emblemUrl) },
    away: { id: text(away?.id) ?? "", name: awayName, shortName: text(away?.shortName) ?? shortName(awayName), country: "", colors: ["#083F87", "#D7E8FF"], form: recentAway.map(row=>row.result), emblemUrl: text(away?.emblemUrl) },
    score: homeScore !== null || awayScore !== null ? [homeScore, awayScore] : undefined,
    elapsedMinute: number(fixture.elapsedMinute),
    oracleScore: oracle.confidence, oracleMarket: oracle, predictions, evidence: streaks.slice(0, 3).map((streak) => `${streak.shortLabel} · ${streak.currentLength}`), streaks, h2h,
    events, comparison, playerStatistics, recentResults: {home:recentHome,away:recentAway},
    lineup: { formationHome: text(homeLineup?.formation) ?? "", formationAway: text(awayLineup?.formation) ?? "", home: lineupPlayers(homeLineup).filter(p=>p.starter).map(p=>p.name), away: lineupPlayers(awayLineup).filter(p=>p.starter).map(p=>p.name), homePlayers:lineupPlayers(homeLineup),awayPlayers:lineupPlayers(awayLineup),coachHome:text(homeLineup?.coachName),coachAway:text(awayLineup?.coachName),confirmedHome:homeLineup?.isConfirmed===true,confirmedAway:awayLineup?.isConfirmed===true },
    standings: standingRows.flatMap((row) => {
      const team = object(row.team); const name = text(team?.displayName) ?? text(team?.canonicalName); const position = number(row.rank); const played = number(row.played); const points = number(row.points);
      return name && position !== null && played !== null && points !== null ? [{ position, team: name, played, points, highlighted: [text(home.id), text(away.id)].includes(text(row.teamId)) }] : [];
    }),
    availability: { h2h: availability(root.h2h) === "available" ? "available" : "not_available", streaks: availability(root.streaks) === "available" ? "available" : "not_available", lineups: availability(root.lineups, "not_confirmed"), statistics: availability(root.statistics) === "available" ? "available" : "not_available", standings: availability(root.standings) === "available" ? "available" : "not_available" },
    sourceUpdatedAt: text(object(root.meta)?.sourceUpdatedAt),
  };
}

export async function getMatchDetail(slug: string, locale: Locale): Promise<MatchDetail> {
  const fixtureId = encodedEntityId(slug); if (!fixtureId) throw new MatchDetailError("MATCH_NOT_FOUND");
  const publicId = slug.split("--").at(-1); const baseUrl = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, ""); const serviceKey = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!publicId || !baseUrl || !serviceKey || serviceKey.length < 32) throw new MatchDetailError("MATCH_CONFIGURATION_ERROR");
  const url = new URL(`${baseUrl}/api/v3/matches/${encodeURIComponent(publicId)}`); url.searchParams.set("locale", locale);
  let response: Response; try { response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json", "X-MyBetOracle-V3-Key": serviceKey } }); } catch { throw new MatchDetailError("MATCH_UNAVAILABLE"); }
  if (response.status === 404) throw new MatchDetailError("MATCH_NOT_FOUND"); if (!response.ok) throw new MatchDetailError("MATCH_UNAVAILABLE");
  try { return parseMatch(await response.json(), locale); } catch (error) { if (error instanceof MatchDetailError) throw error; throw new MatchDetailError("MATCH_INVALID_RESPONSE"); }
}
