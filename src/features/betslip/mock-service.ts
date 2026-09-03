import type { AccumulatorLeg } from "@/features/accumulators/types";
import type { BetslipService, DailyBetslip } from "./types";

const legs: AccumulatorLeg[] = [
  {
    id: "betslip-arsenal-chelsea", position: 1, marketType: "mixed", marketValue: "OVER_1_5", selectionLabel: "Over 1.5 Goals", decimalOdds: 1.34, result: "PENDING",
    fixture: { id: "arsenal-chelsea", slug: "arsenal-v-chelsea", kickoffAt: "2026-08-15T18:30:00.000Z", statusCode: "NS", competition: "Premier League", country: "England", homeTeam: "Arsenal", awayTeam: "Chelsea", homeShortName: "ARS", awayShortName: "CHE", homeColors: ["#D71920", "#FFFFFF"], awayColors: ["#034694", "#FFFFFF"] },
    prediction: { confidenceScore: 91, qualityTier: "ELITE", revision: 1 }, oddsSnapshot: { bookmaker: "SportyBet", capturedAt: "2026-08-15T06:30:00.000Z", mappingVersion: "sportybet-v2" },
  },
  {
    id: "betslip-inter-parma", position: 2, marketType: "main", marketValue: "HOME", selectionLabel: "Inter to Win", decimalOdds: 1.58, result: "PENDING",
    fixture: { id: "inter-parma", slug: "inter-v-parma", kickoffAt: "2026-08-15T20:00:00.000Z", statusCode: "NS", competition: "Serie A", country: "Italy", homeTeam: "Inter", awayTeam: "Parma", homeShortName: "INT", awayShortName: "PAR", homeColors: ["#00529F", "#FFFFFF"], awayColors: ["#F4C300", "#FFFFFF"] },
    prediction: { confidenceScore: 84, qualityTier: "ELITE", revision: 1 }, oddsSnapshot: { bookmaker: "SportyBet", capturedAt: "2026-08-15T06:30:00.000Z", mappingVersion: "sportybet-v2" },
  },
  {
    id: "betslip-psg-lille", position: 3, marketType: "mixed", marketValue: "HOME_OVER_0_5", selectionLabel: "PSG Over 0.5 Team Goals", decimalOdds: 1.62, result: "PENDING",
    fixture: { id: "psg-lille", slug: "psg-v-lille", kickoffAt: "2026-08-15T20:15:00.000Z", statusCode: "NS", competition: "Ligue 1", country: "France", homeTeam: "PSG", awayTeam: "Lille", homeShortName: "PSG", awayShortName: "LIL", homeColors: ["#004170", "#FFFFFF"], awayColors: ["#D71920", "#FFFFFF"] },
    prediction: { confidenceScore: 86, qualityTier: "ELITE", revision: 1 }, oddsSnapshot: { bookmaker: "SportyBet", capturedAt: "2026-08-15T06:30:00.000Z", mappingVersion: "sportybet-v2" },
  },
];

const dailyBetslip: DailyBetslip = {
  id: "betslip_2026-08-15_en", date: "2026-08-15", timezone: "Africa/Lagos", targetMinimum: 3, targetMaximum: 3.99, totalOdds: 3.43, status: "PUBLISHED", result: "PENDING", generatedAt: "2026-08-15T06:30:00.000Z", legs,
  history: [
    { id: "betslip-2026-08-14", date: "2026-08-14", totalOdds: 3.61, selections: 3, result: "WON" },
    { id: "betslip-2026-08-13", date: "2026-08-13", totalOdds: 3.28, selections: 3, result: "LOST" },
    { id: "betslip-2026-08-12", date: "2026-08-12", totalOdds: 3.74, selections: 4, result: "WON" },
  ],
};

export const mockBetslipService: BetslipService = {
  async getDaily(query) { return { ...dailyBetslip, date: query.date, timezone: query.timezone }; },
};
