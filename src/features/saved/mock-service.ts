import type { SavedData, SavedService } from "./types";

const data: SavedData = {
  asOf: "2026-08-13T09:10:00.000Z",
  matches: [
    { id: "arsenal-chelsea", slug: "arsenal-v-chelsea", kickoffAt: "2026-08-13T18:30:00.000Z", state: "UPCOMING", competition: "Premier League", countryCode: "ENG", homeTeam: "Arsenal", awayTeam: "Chelsea", selection: "Over 1.5 goals", oracleScore: 91, odds: 1.38, alertEnabled: true },
    { id: "inter-parma", slug: "inter-v-parma", kickoffAt: "2026-08-13T20:00:00.000Z", state: "LIVE", minute: 63, competition: "Serie A", countryCode: "ITA", homeTeam: "Inter", awayTeam: "Parma", selection: "Inter to win", oracleScore: 84, odds: 1.58, alertEnabled: true },
    { id: "bayern-mainz", slug: "bayern-v-mainz", kickoffAt: "2026-08-14T19:30:00.000Z", state: "UPCOMING", competition: "Bundesliga", countryCode: "GER", homeTeam: "Bayern Munich", awayTeam: "Mainz", selection: "Home or draw + over 1.5", oracleScore: 88, odds: 1.61, alertEnabled: false },
    { id: "barcelona-getafe", slug: "barcelona-v-getafe", kickoffAt: "2026-08-12T19:00:00.000Z", state: "SETTLED", competition: "LaLiga", countryCode: "ESP", homeTeam: "Barcelona", awayTeam: "Getafe", selection: "Barcelona to win", oracleScore: 86, odds: 1.52, alertEnabled: false, outcome: "WON" },
  ],
  accumulators: [
    { id: "saved-daily-5-1", scope: "DAILY", targetLabel: "5 Odds", variant: 1, totalOdds: 5.43, legs: 4, wonLegs: 2, status: "PENDING", nextKickoffAt: "2026-08-13T18:30:00.000Z" },
    { id: "saved-weekly-10-1", scope: "WEEKLY", targetLabel: "10 Odds", variant: 1, totalOdds: 10.62, legs: 6, wonLegs: 4, status: "PENDING", nextKickoffAt: "2026-08-14T18:45:00.000Z" },
    { id: "saved-win-5-2", scope: "DAILY", targetLabel: "5 Odds", variant: 2, totalOdds: 5.61, legs: 4, wonLegs: 4, status: "WON" },
  ],
  following: [
    { id: "arsenal", type: "TEAM", name: "Arsenal", context: "England", shortCode: "ARS", color: "#D71920", upcoming: 3, alerts: true },
    { id: "inter", type: "TEAM", name: "Inter", context: "Italy", shortCode: "INT", color: "#00529F", upcoming: 2, alerts: true },
    { id: "premier-league", type: "COMPETITION", name: "Premier League", context: "England", shortCode: "PL", color: "#3D195B", upcoming: 12, alerts: false },
    { id: "champions-league", type: "COMPETITION", name: "Champions League", context: "Europe", shortCode: "UCL", color: "#123E78", upcoming: 8, alerts: true },
  ],
  notifications: { kickoff: true, lineup: true, oracleUpdate: true, settlement: true, accumulatorResult: true, morningDigest: true, eveningRecap: false },
};
export const mockSavedService: SavedService = { async getSaved() { return structuredClone(data); } };
