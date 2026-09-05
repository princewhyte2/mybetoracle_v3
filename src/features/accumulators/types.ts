export type AccumulatorScope = "DAILY" | "WEEKLY";
export type AccumulatorResult = "PENDING" | "WON" | "LOST" | "VOID";
export type AccumulatorStatus = "PUBLISHED" | "SETTLED";

export type AccumulatorLeg = {
  id: string;
  position: number;
  marketType: string;
  marketValue: string;
  selectionLabel: string;
  decimalOdds: number;
  result: AccumulatorResult;
  fixture: {
    id: string;
    slug: string | null;
    matchHref?: null;
    kickoffAt: string;
    statusCode: string;
    score?: { home: number | null; away: number | null };
    competition: string;
    country: string;
    homeTeam: string;
    awayTeam: string;
    homeShortName: string | null;
    awayShortName: string | null;
    homeColors: [string, string];
    awayColors: [string, string];
    identity?: {
      competition: { name: string; country: string | null; countryFlagUrl: string | null; emblemUrl: string | null };
      homeTeam: { name: string; shortName: string | null; emblemUrl: string | null };
      awayTeam: { name: string; shortName: string | null; emblemUrl: string | null };
    };
  };
  prediction: {
    confidenceScore: number;
    qualityTier: string;
    revision: number;
  };
  oddsSnapshot: {
    bookmaker: string;
    capturedAt: string;
    mappingVersion: string;
  };
  settlementEvidence?: string;
  settledAt?: string;
};

export type Accumulator = {
  id: string;
  scope: AccumulatorScope;
  targetBand: string;
  targetLabel: string;
  variant: number;
  windowStart: string;
  windowEnd: string;
  timezone: string;
  totalOdds: number;
  averageConfidence: number;
  status: AccumulatorStatus;
  result: AccumulatorResult;
  publishedAt: string;
  settledAt?: string;
  legs: AccumulatorLeg[];
};

export type AccumulatorBand = {
  key: string;
  label: string;
  minimum: number;
  maximum: number;
};

export type AccumulatorHistoryItem = {
  id: string;
  scope: AccumulatorScope;
  targetLabel: string;
  variant: number;
  date: string;
  totalOdds: number;
  result: Exclude<AccumulatorResult, "PENDING">;
  wonLegs: number;
  lostLegs: number;
  voidLegs: number;
};

export type AccumulatorPageData = {
  date: string;
  timezone: string;
  scope: AccumulatorScope;
  windowStart: string;
  windowEnd: string;
  updatedAt: string;
  bands: AccumulatorBand[];
  items: Accumulator[];
  history: AccumulatorHistoryItem[];
  availability?: "available" | "unavailable";
  freshness?: "fresh" | "stale";
};

export interface AccumulatorService {
  getPublications(query: { date: string; timezone: string; scope: AccumulatorScope }): Promise<AccumulatorPageData>;
}
