export type DiscoveryMarket = "1X2" | "MIXED" | "O/U" | "GG/NG" | "CORNERS";
export type DiscoveryState = "LIVE" | "UPCOMING";
export type DiscoveryPrediction = {
  id: string; fixtureSlug: string; kickoffAt: string; state: DiscoveryState; minute?: number;
  country: string; countryCode: string; competition: string;
  homeTeam: string; awayTeam: string; homeShort: string; awayShort: string;
  market: DiscoveryMarket; selection: string; oracleScore: number; odds: number;
  evidence: string[]; saved: boolean;
};
export type PredictionDiscoveryData = { asOf: string; date: string; analyzed: number; totalFixtures: number; oraclePickId: string; items: DiscoveryPrediction[] };
export interface PredictionDiscoveryService { getDiscovery(date: string): Promise<PredictionDiscoveryData>; }
