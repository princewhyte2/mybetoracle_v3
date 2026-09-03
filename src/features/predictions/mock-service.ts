import type { DiscoveryMarket, DiscoveryPrediction, PredictionDiscoveryService } from "./types";

const teams = [
  ["arsenal-v-chelsea", "England", "ENG", "Premier League", "Arsenal", "Chelsea", "ARS", "CHE"],
  ["inter-v-parma", "Italy", "ITA", "Serie A", "Inter", "Parma", "INT", "PAR"],
  ["bayern-v-mainz", "Germany", "GER", "Bundesliga", "Bayern Munich", "Mainz", "FCB", "MAI"],
  ["barcelona-v-getafe", "Spain", "ESP", "LaLiga", "Barcelona", "Getafe", "BAR", "GET"],
  ["psg-v-lille", "France", "FRA", "Ligue 1", "PSG", "Lille", "PSG", "LIL"],
  ["ajax-v-utrecht", "Netherlands", "NED", "Eredivisie", "Ajax", "Utrecht", "AJA", "UTR"],
  ["porto-v-braga", "Portugal", "POR", "Liga Portugal", "Porto", "Braga", "POR", "BRA"],
  ["celtic-v-hearts", "Scotland", "SCO", "Premiership", "Celtic", "Hearts", "CEL", "HEA"],
] as const;
const picks: Array<[DiscoveryMarket, string, number]> = [["O/U", "Over 1.5 goals", 1.38], ["MIXED", "Home or draw + over 1.5", 1.61], ["1X2", "Home team to win", 1.82], ["GG/NG", "Both teams to score", 1.72], ["CORNERS", "Over 8.5 corners", 1.69]];

function makeItems(date: string): DiscoveryPrediction[] { return Array.from({ length: 16 }, (_, index) => {
  const team = teams[index % teams.length]; const pick = picks[index % picks.length]; const kickoff = new Date(`${date}T${String(12 + (index % 10)).padStart(2, "0")}:${index % 2 ? "30" : "00"}:00.000Z`);
  return { id: `prediction-${index + 1}`, fixtureSlug: team[0], kickoffAt: kickoff.toISOString(), state: index === 5 ? "LIVE" : "UPCOMING", minute: index === 5 ? 63 : undefined, country: team[1], countryCode: team[2], competition: team[3], homeTeam: team[4], awayTeam: team[5], homeShort: team[6], awayShort: team[7], market: pick[0], selection: pick[1], oracleScore: 95 - (index * 2) % 27, odds: pick[2] + (index % 3) * .04, evidence: index % 2 ? ["8/10 matching team games", "League goal rate 2.8"] : ["Strong home split", "Opponent conceded in 7/8"], saved: index === 0 };
}); }
export const mockPredictionDiscoveryService: PredictionDiscoveryService = { async getDiscovery(date) { return { asOf: `${date}T09:15:00.000Z`, date, analyzed: 86, totalFixtures: 112, oraclePickId: "prediction-1", items: makeItems(date) }; } };
