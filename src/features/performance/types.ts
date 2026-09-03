export type SettledResult = "WON" | "LOST" | "VOID";
export const marketGroups = ["REGULAR", "BTTS", "TOTAL_2_5", "MIXED", "CORRECT_SCORE", "ORACLE_PICK"] as const;
export type MarketGroup = (typeof marketGroups)[number];

export type SettledPrediction = {
  id: string;
  fixtureId: string;
  matchHref: null;
  kickoffAt: string;
  settledAt: string;
  competition: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  homeShortName: string;
  awayShortName: string;
  homeEmblemUrl: string | null;
  awayEmblemUrl: string | null;
  competitionEmblemUrl: string | null;
  countryFlagUrl: string | null;
  selection: string;
  marketGroup: MarketGroup;
  oracleScore: number | null;
  publishedOdds: number | null;
  oddsState: "not_recorded";
  result: SettledResult;
  finalScore: [number | null, number | null];
};

export type PerformanceBreakdown = {
  key: string;
  label: string;
  settled: number;
  won: number;
  lost: number;
  void: number;
  hitRate: number;
};

export type AccumulatorPerformance = PerformanceBreakdown & {
  scope: "DAILY" | "WEEKLY";
};

export type PerformanceData = {
  asOf: string;
  periodDays: number;
  methodologyVersion: string;
  summary: {
    published: number;
    settled: number;
    pending: number;
    won: number;
    lost: number;
    void: number;
    hitRate: number;
  };
  byMarket: PerformanceBreakdown[];
  byOracleBand: PerformanceBreakdown[];
  accumulators: AccumulatorPerformance[];
  accumulatorsAvailable: boolean;
  recentResults: SettledPrediction[];
};

export type ResultsQuery = {
  from: string;
  to: string;
  market?: MarketGroup;
  result?: SettledResult;
  page?: number;
  pageSize?: number;
};

export type ResultsData = {
  asOf: string;
  query: Required<Pick<ResultsQuery, "from" | "to" | "page" | "pageSize">> & Pick<ResultsQuery, "market" | "result">;
  items: SettledPrediction[];
  total: number;
  totalPages: number;
};

export type SettledAccumulatorLeg = {
  id: string;
  fixtureSlug: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  selection: string;
  odds: number;
  finalScore: [number, number];
  result: SettledResult;
};

export type SettledAccumulator = {
  id: string;
  publishedDate: string;
  settledAt: string;
  scope: "DAILY" | "WEEKLY";
  targetLabel: string;
  variant: number;
  totalOdds: number;
  result: SettledResult;
  legs: SettledAccumulatorLeg[];
};

export interface PerformanceService {
  getPerformance(periodDays: number): Promise<PerformanceData>;
  getResults(query: ResultsQuery): Promise<ResultsData>;
}
