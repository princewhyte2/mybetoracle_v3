import { metricByKey, metricCatalog } from "./metric-catalog";
import type {
  FixtureStreakComparison,
  StreakExplorerData,
  StreakExplorerService,
  StreakMetric,
  StreakRecord,
  StreakScope,
  StreakTeam,
} from "./types";

const AS_OF = "2026-08-10T22:00:00.000Z";
const ENGINE_VERSION = "streak-v2";

const teams: StreakTeam[] = [
  { id: "arsenal", name: "Arsenal", shortName: "ARS", country: "England", competition: "Premier League", colors: ["#D71920", "#FFFFFF"] },
  { id: "chelsea", name: "Chelsea", shortName: "CHE", country: "England", competition: "Premier League", colors: ["#034694", "#FFFFFF"] },
  { id: "liverpool", name: "Liverpool", shortName: "LIV", country: "England", competition: "Premier League", colors: ["#C8102E", "#FFFFFF"] },
  { id: "bayern", name: "Bayern Munich", shortName: "FCB", country: "Germany", competition: "Bundesliga", colors: ["#DC052D", "#FFFFFF"] },
  { id: "inter", name: "Inter", shortName: "INT", country: "Italy", competition: "Serie A", colors: ["#00529F", "#111111"] },
  { id: "barcelona", name: "Barcelona", shortName: "BAR", country: "Spain", competition: "LaLiga", colors: ["#A50044", "#004D98"] },
];

const strengthOverrides: Record<string, number> = {
  "arsenal:OVERALL:SCORED": 15,
  "arsenal:HOME:OVER_1_5": 12,
  "arsenal:AWAY:UNBEATEN": 6,
  "chelsea:AWAY:WINLESS": 5,
  "chelsea:AWAY:CONCEDED": 9,
  "chelsea:OVERALL:BTTS_YES": 7,
  "liverpool:OVERALL:CORNERS_OVER_9_5": 7,
  "liverpool:HOME:TEAM_CORNERS_OVER_4_5": 9,
  "bayern:HOME:OVER_2_5": 8,
  "bayern:OVERALL:WIN": 6,
  "inter:AWAY:CLEAN_SHEET": 5,
  "inter:OVERALL:UNDER_3_5": 11,
  "barcelona:OVERALL:TEAM_CARD": 10,
  "barcelona:HOME:FIRST_HALF_SCORED": 8,
};

function makeProfile(team: StreakTeam, teamIndex: number): StreakRecord[] {
  return (["OVERALL", "HOME", "AWAY"] as StreakScope[]).flatMap((scope, scopeIndex) =>
    metricCatalog.map((meta, metricIndex) => {
      const zeroHistory = team.id === "inter" && scope === "AWAY" && (meta.category === "corners" || meta.category === "cards");
      const evidenceMissing = team.id === "barcelona" && scope === "HOME" && meta.category === "corners" && metricIndex % 3 === 0;
      const generatedLength = (teamIndex * 5 + scopeIndex * 3 + metricIndex * 2) % 7;
      const currentLength = zeroHistory || evidenceMissing
        ? 0
        : strengthOverrides[`${team.id}:${scope}:${meta.metric}`] ?? generatedLength;
      const sampleSize = zeroHistory ? 0 : 14 + ((teamIndex + scopeIndex + metricIndex) % 15);

      return {
        id: `${team.id}-${scope.toLowerCase()}-${meta.metric.toLowerCase()}`,
        team,
        metric: meta.metric,
        scope,
        currentLength,
        sampleSize,
        asOfAt: AS_OF,
        engineVersion: ENGINE_VERSION,
        evidenceAvailable: !zeroHistory && !evidenceMissing,
        zeroHistory,
        sourceFixture: sampleSize > 0 ? {
          id: `${team.id}-source-${metricIndex}`,
          kickoffAt: "2026-08-08T15:00:00.000Z",
          opponent: team.id === "arsenal" ? "Brighton" : "Latest opponent",
          score: team.id === "arsenal" ? "2-1" : "2-0",
        } : undefined,
      } satisfies StreakRecord;
    }),
  );
}

const teamProfiles = Object.fromEntries(teams.map((team, index) => [team.id, makeProfile(team, index)]));

function streak(teamId: string, scope: StreakScope, metric: StreakMetric) {
  const item = teamProfiles[teamId].find((candidate) => candidate.scope === scope && candidate.metric === metric);
  if (!item) throw new Error(`Missing mock streak ${teamId}:${scope}:${metric}`);
  return item;
}

const topStreaks = [
  streak("arsenal", "OVERALL", "SCORED"),
  streak("arsenal", "HOME", "OVER_1_5"),
  streak("inter", "OVERALL", "UNDER_3_5"),
  streak("barcelona", "OVERALL", "TEAM_CARD"),
  streak("liverpool", "HOME", "TEAM_CORNERS_OVER_4_5"),
  streak("chelsea", "AWAY", "CONCEDED"),
  streak("bayern", "HOME", "OVER_2_5"),
  streak("barcelona", "HOME", "FIRST_HALF_SCORED"),
  streak("chelsea", "OVERALL", "BTTS_YES"),
  streak("liverpool", "OVERALL", "CORNERS_OVER_9_5"),
  streak("bayern", "OVERALL", "WIN"),
  streak("inter", "AWAY", "CLEAN_SHEET"),
].sort((left, right) => right.currentLength - left.currentLength);

function comparisonItem(teamId: string, scope: StreakScope, metric: StreakMetric) {
  const item = streak(teamId, scope, metric);
  return { metric: item.metric, scope: item.scope, currentLength: item.currentLength };
}

const upcomingFixtures: FixtureStreakComparison[] = [
  {
    id: "arsenal-chelsea",
    kickoffAt: "2026-08-12T18:30:00.000Z",
    competition: "Premier League",
    home: teams[0],
    away: teams[1],
    homeStreaks: [
      comparisonItem("arsenal", "OVERALL", "SCORED"),
      comparisonItem("arsenal", "HOME", "OVER_1_5"),
      comparisonItem("arsenal", "HOME", "TEAM_CORNERS_OVER_4_5"),
    ],
    awayStreaks: [
      comparisonItem("chelsea", "OVERALL", "BTTS_YES"),
      comparisonItem("chelsea", "AWAY", "WINLESS"),
      comparisonItem("chelsea", "AWAY", "CONCEDED"),
    ],
  },
  {
    id: "bayern-inter",
    kickoffAt: "2026-08-12T20:00:00.000Z",
    competition: "Champions League",
    home: teams[3],
    away: teams[4],
    homeStreaks: [
      comparisonItem("bayern", "HOME", "OVER_2_5"),
      comparisonItem("bayern", "OVERALL", "WIN"),
      comparisonItem("bayern", "HOME", "SCORED"),
    ],
    awayStreaks: [
      comparisonItem("inter", "OVERALL", "UNDER_3_5"),
      comparisonItem("inter", "AWAY", "CLEAN_SHEET"),
      comparisonItem("inter", "OVERALL", "UNBEATEN"),
    ],
  },
];

const explorerData: StreakExplorerData = {
  asOf: AS_OF,
  engineVersion: ENGINE_VERSION,
  freshness: "fresh",
  countries: ["England", "Germany", "Italy", "Spain"].map((name) => ({ code: name, name })),
  competitions: ["Premier League", "Bundesliga", "Serie A", "LaLiga", "Champions League"].map((name) => ({ id: name, name })),
  teams,
  topStreaks,
  upcomingFixtures,
  upcomingState: "available",
  teamProfiles,
  query: { asOf: AS_OF, scope: "OVERALL", minimumLength: 3, sort: "length", page: 1 },
  pagination: { page: 1, pageSize: 20, total: topStreaks.length, totalPages: 1 },
};

export const mockStreakExplorerService: StreakExplorerService = {
  async getExplorer() {
    return explorerData;
  },
};

export function getMetricCategory(metric: StreakMetric) {
  return metricByKey.get(metric)?.category;
}
