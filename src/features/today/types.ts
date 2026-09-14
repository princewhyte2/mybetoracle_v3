export const corePredictionMarkets = [
  "REGULAR", "BTTS", "TOTAL_2_5", "MIXED", "CORRECT_SCORE", "ORACLE_PICK",
] as const;
export const predictionMarkets = [
  ...corePredictionMarkets,
  "DOUBLE_CHANCE", "TEAM_TO_SCORE", "TOTAL_1_5", "TOTAL_3_5",
  "GOALS_BAND", "HALFTIME_RESULT", "HALFTIME_FULLTIME", "CARDS", "CORNERS", "HANDICAP",
] as const;
export type MatchState = "scheduled" | "live" | "finished";
export type PredictionMarket = (typeof predictionMarkets)[number];
export type TipOutcome = "won" | "lost" | "void";

export type Team = {
  id?: string;
  name: string;
  shortName: string;
  emblemUrl?: string | null;
  colors?: [string, string];
};

export type MarketSelection = { marketType: string; marketValue: string; probability: number; line?: number; countingRule?: string; selectionLabel?: string; selectionShortLabel?: string; result?: string; latestOdds?: Array<{ decimalOdds: number }>; distribution?: Record<string, number> };
export type LivePrediction = { sourceObservedAt: string; generatedAt: string; sourceRevision: number; modelVersion: string; markets: Array<{ marketGroup: string; availability: string; reason: string | null; selections: MarketSelection[] }> };
export type RankedSelection = { marketGroup: PredictionMarket; predictionId: string; selection: MarketSelection; valueAnalysis: NonNullable<OracleMarket['valueAnalysis']> };
export type OracleMarket = {
  probability?: number | null;
  selections?: MarketSelection[];
  evidence?: { samples?: { homeOverall?: number; awayOverall?: number }; reason?: string; countingRule?: string };
  qualityTier?: string;
  valueAnalysis?: { probability: number; decimalOdds: number; edge: number; expectedValue: number; kellyScore: number; topPick: boolean; capturedAt: string } | null;
  predictionId: string | null;
  market: string;
  marketType: string | null;
  marketValue: string | null;
  selection: string;
  shortSelection: string;
  odds: string | null;
  confidence: number;
  available?: boolean;
  risk?: "Low" | "Balanced" | "Elevated";
  outcome?: TipOutcome;
};

export type Match = {
  livePrediction?: LivePrediction | null;
  rankedSelection?: RankedSelection | null;
  id: string;
  slug: string | null;
  kickoff: string;
  kickoffAt?: string;
  state: MatchState;
  statusCode: string;
  elapsedMinute: number | null;
  score?: [number | null, number | null];
  home: Team;
  away: Team;
  oracleScore: number;
  insight: string;
  markets: Record<PredictionMarket, OracleMarket>;
};

export type Competition = {
  id: string;
  country: string;
  countryCode: string;
  countryFlagUrl?: string | null;
  emblemUrl?: string | null;
  name: string;
  matches: Match[];
};

export type TodayData = {
  ranking?: { version: string | null; availability: string; view: string } | null;
  dateIso: string;
  totalMatches: number;
  analyzedMatches: number | null;
  competitions: Competition[];
  oraclePickId: string | null;
  oraclePick: Match | null;
  freshness?: "fresh" | "stale";
  pagination: { page: number; pageSize: number; total: number; totalPages: number; hasMore: boolean; nextCursor: string | null };
  performance: {
    available?: boolean;
    period: string;
    hitRate: number | null;
    settled: number | null;
    currentRun?: number;
  };
};
