import type { Accumulator, AccumulatorBand, AccumulatorHistoryItem, AccumulatorLeg, AccumulatorPageData, AccumulatorScope, AccumulatorService } from "./types";

const fixtureSeeds = [
  ["arsenal-chelsea", "arsenal-v-chelsea", "Premier League", "England", "Arsenal", "Chelsea", "ARS", "CHE", "2026-08-12T18:30:00.000Z", "#D71920", "#034694"],
  ["bayern-mainz", "bayern-v-mainz", "Bundesliga", "Germany", "Bayern Munich", "Mainz", "FCB", "MAI", "2026-08-12T19:30:00.000Z", "#DC052D", "#C3142D"],
  ["inter-parma", "inter-v-parma", "Serie A", "Italy", "Inter", "Parma", "INT", "PAR", "2026-08-12T20:00:00.000Z", "#00529F", "#F4C300"],
  ["barcelona-getafe", "barcelona-v-getafe", "LaLiga", "Spain", "Barcelona", "Getafe", "BAR", "GET", "2026-08-13T19:00:00.000Z", "#A50044", "#005999"],
  ["psg-lille", "psg-v-lille", "Ligue 1", "France", "PSG", "Lille", "PSG", "LIL", "2026-08-13T20:00:00.000Z", "#004170", "#D71920"],
  ["ajax-utrecht", "ajax-v-utrecht", "Eredivisie", "Netherlands", "Ajax", "Utrecht", "AJA", "UTR", "2026-08-14T18:45:00.000Z", "#D2122E", "#C8102E"],
  ["porto-braga", "porto-v-braga", "Primeira Liga", "Portugal", "Porto", "Braga", "POR", "BRA", "2026-08-15T19:30:00.000Z", "#003E7E", "#C8102E"],
  ["galatasaray-kasimpasa", "galatasaray-v-kasimpasa", "Super Lig", "Turkey", "Galatasaray", "Kasimpasa", "GAL", "KAS", "2026-08-16T18:00:00.000Z", "#A90432", "#1D4F91"],
] as const;

const selections = [
  ["DOUBLE_CHANCE", "HOME_OR_DRAW", "Arsenal or Draw", 1.42, 81, "ELITE"],
  ["TOTAL_GOALS", "OVER_1_5", "Over 1.5 Goals", 1.36, 80, "ELITE"],
  ["MATCH_RESULT", "HOME", "Inter to Win", 1.58, 78, "HIGH"],
  ["TEAM_TOTAL_GOALS", "HOME_OVER_0_5", "Barcelona Over 0.5 Team Goals", 1.24, 82, "ELITE"],
  ["TOTAL_GOALS", "OVER_1_5", "Over 1.5 Goals", 1.38, 76, "STRONG"],
  ["TOTAL_CORNERS", "OVER_7_5", "Over 7.5 Corners", 1.51, 75, "STRONG"],
] as const;

function leg(index: number, position: number, result: AccumulatorLeg["result"] = "PENDING"): AccumulatorLeg {
  const fixture = fixtureSeeds[index % fixtureSeeds.length];
  const selection = selections[index % selections.length];
  return {
    id: `leg-${index}-${position}`,
    position,
    marketType: selection[0],
    marketValue: selection[1],
    selectionLabel: selection[2],
    decimalOdds: selection[3],
    result,
    fixture: { id: fixture[0], slug: fixture[1], competition: fixture[2], country: fixture[3], homeTeam: fixture[4], awayTeam: fixture[5], homeShortName: fixture[6], awayShortName: fixture[7], kickoffAt: fixture[8], statusCode: "NS", homeColors: [fixture[9], "#FFFFFF"], awayColors: [fixture[10], "#FFFFFF"] },
    prediction: { confidenceScore: selection[4], qualityTier: selection[5], revision: 1 },
    oddsSnapshot: { bookmaker: "SportyBet", capturedAt: "2026-08-11T06:45:00.000Z", mappingVersion: "sportybet-v2" },
  };
}

function accumulator(scope: AccumulatorScope, band: string, label: string, variant: number, totalOdds: number, legIndexes: number[]): Accumulator {
  const legs = legIndexes.map((item, index) => leg(item, index + 1));
  return { id: `${scope}-${band}-${variant}`, scope, targetBand: band, targetLabel: label, variant, windowStart: "2026-08-11T00:00:00.000Z", windowEnd: scope === "DAILY" ? "2026-08-11T23:59:59.000Z" : "2026-08-16T23:59:59.000Z", timezone: "Africa/Lagos", totalOdds, averageConfidence: Math.round(legs.reduce((sum, item) => sum + item.prediction.confidenceScore, 0) / legs.length), status: "PUBLISHED", result: "PENDING", publishedAt: "2026-08-11T07:15:00.000Z", legs };
}

const dailyBands: AccumulatorBand[] = [
  { key: "ODDS_2", label: "2 Odds", minimum: 2, maximum: 2.99 },
  { key: "ODDS_5", label: "5 Odds", minimum: 5, maximum: 5.99 },
  { key: "ODDS_10", label: "10 Odds", minimum: 10, maximum: 10.99 },
  { key: "ODDS_20", label: "20 Odds", minimum: 20, maximum: 20.99 },
];

const weeklyBands: AccumulatorBand[] = [
  { key: "ODDS_5", label: "5 Odds", minimum: 5, maximum: 5.99 },
  { key: "ODDS_10", label: "10 Odds", minimum: 10, maximum: 10.99 },
  { key: "ODDS_20", label: "20 Odds", minimum: 20, maximum: 20.99 },
  { key: "ODDS_40", label: "40 Odds", minimum: 40, maximum: 40.99 },
];

const dailyItems = [
  accumulator("DAILY", "ODDS_2", "2 Odds", 1, 2.24, [0, 1]),
  accumulator("DAILY", "ODDS_2", "2 Odds", 2, 2.51, [2, 4]),
  accumulator("DAILY", "ODDS_5", "5 Odds", 1, 5.43, [0, 1, 2, 3]),
  accumulator("DAILY", "ODDS_5", "5 Odds", 2, 5.68, [0, 2, 4, 5]),
  accumulator("DAILY", "ODDS_5", "5 Odds", 3, 5.27, [1, 3, 4, 5]),
  accumulator("DAILY", "ODDS_10", "10 Odds", 1, 10.41, [0, 1, 2, 3, 4, 5]),
];

const weeklyItems = [
  accumulator("WEEKLY", "ODDS_5", "5 Odds", 1, 5.32, [0, 1, 2, 3]),
  accumulator("WEEKLY", "ODDS_5", "5 Odds", 2, 5.71, [0, 2, 4, 5]),
  accumulator("WEEKLY", "ODDS_10", "10 Odds", 1, 10.62, [0, 1, 2, 3, 4, 5]),
  accumulator("WEEKLY", "ODDS_40", "40 Odds", 1, 40.38, [0, 1, 2, 3, 4, 5, 6, 7]),
];

const history: AccumulatorHistoryItem[] = [
  { id: "history-1", scope: "DAILY", targetLabel: "5 Odds", variant: 1, date: "2026-08-10", totalOdds: 5.43, result: "WON", wonLegs: 3, lostLegs: 0, voidLegs: 1 },
  { id: "history-2", scope: "DAILY", targetLabel: "10 Odds", variant: 1, date: "2026-08-09", totalOdds: 10.28, result: "LOST", wonLegs: 4, lostLegs: 1, voidLegs: 0 },
  { id: "history-3", scope: "WEEKLY", targetLabel: "5 Odds", variant: 2, date: "2026-08-03", totalOdds: 5.61, result: "VOID", wonLegs: 0, lostLegs: 0, voidLegs: 4 },
];

export const mockAccumulatorService: AccumulatorService = {
  async getPublications(query): Promise<AccumulatorPageData> {
    const weekly = query.scope === "WEEKLY";
    return { date: query.date, timezone: query.timezone, scope: query.scope, windowStart: "2026-08-10T00:00:00.000Z", windowEnd: weekly ? "2026-08-16T23:59:59.000Z" : "2026-08-11T23:59:59.000Z", updatedAt: "2026-08-11T07:15:00.000Z", bands: weekly ? weeklyBands : dailyBands, items: weekly ? weeklyItems : dailyItems, history };
  },
};
