export const streakScopes = ["OVERALL", "HOME", "AWAY"] as const;
export type StreakScope = (typeof streakScopes)[number];

export const streakCategories = ["results", "goals", "firstHalf", "secondHalf", "corners", "cards"] as const;
export type StreakCategory = (typeof streakCategories)[number];

export type StreakMetric =
  | "WIN" | "UNBEATEN" | "DRAW" | "LOSS" | "WINLESS"
  | "SCORED" | "CLEAN_SHEET" | "FAILED_TO_SCORE" | "CONCEDED"
  | "BTTS_YES" | "BTTS_NO"
  | "OVER_0_5" | "UNDER_0_5" | "OVER_1_5" | "UNDER_1_5"
  | "OVER_2_5" | "UNDER_2_5" | "OVER_3_5" | "UNDER_3_5"
  | "NO_DRAW" | "WIN_BY_2_PLUS" | "AVOID_DEFEAT_BY_2_PLUS"
  | "FIRST_HALF_WIN" | "FIRST_HALF_DRAW" | "FIRST_HALF_LOSS"
  | "FIRST_HALF_SCORED" | "FIRST_HALF_CLEAN_SHEET"
  | "FIRST_HALF_OVER_0_5" | "FIRST_HALF_UNDER_0_5"
  | "FIRST_HALF_OVER_1_5" | "FIRST_HALF_UNDER_1_5"
  | "SECOND_HALF_SCORED" | "SECOND_HALF_CLEAN_SHEET"
  | "SECOND_HALF_OVER_0_5" | "SECOND_HALF_UNDER_0_5"
  | "SECOND_HALF_OVER_1_5" | "SECOND_HALF_UNDER_1_5"
  | "CORNERS_OVER_7_5" | "CORNERS_UNDER_7_5"
  | "CORNERS_OVER_8_5" | "CORNERS_UNDER_8_5"
  | "CORNERS_OVER_9_5" | "CORNERS_UNDER_9_5"
  | "CORNERS_OVER_10_5" | "CORNERS_UNDER_10_5"
  | "TEAM_CORNERS_OVER_3_5" | "TEAM_CORNERS_OVER_4_5" | "TEAM_CORNERS_OVER_5_5"
  | "CARDS_OVER_2_5" | "CARDS_UNDER_2_5"
  | "CARDS_OVER_3_5" | "CARDS_UNDER_3_5"
  | "CARDS_OVER_4_5" | "CARDS_UNDER_4_5"
  | "TEAM_CARD"
  | "BOOKING_POINTS_OVER_25" | "BOOKING_POINTS_OVER_35" | "BOOKING_POINTS_OVER_45";

export type MetricMeta = {
  metric: StreakMetric;
  label: string;
  shortLabel: string;
  category: StreakCategory;
};

export type StreakTeam = {
  id: string;
  name: string;
  shortName: string;
  country: string;
  competition: string;
  emblemUrl?: string | null;
  colors?: [string, string];
};

export type StreakRecord = {
  id: string;
  team: StreakTeam;
  metric: StreakMetric;
  scope: StreakScope;
  currentLength: number;
  sampleSize: number;
  asOfAt: string;
  engineVersion: string;
  evidenceAvailable: boolean;
  zeroHistory: boolean;
  sourceFixture?: {
    id: string;
    kickoffAt: string;
    opponent: string;
    score: string;
  };
};

export type FixtureStreakComparison = {
  id: string;
  kickoffAt: string;
  competition: string;
  home: StreakTeam;
  away: StreakTeam;
  homeStreaks: Array<Pick<StreakRecord, "metric" | "scope" | "currentLength">>;
  awayStreaks: Array<Pick<StreakRecord, "metric" | "scope" | "currentLength">>;
};

export type StreakExplorerData = {
  asOf: string;
  engineVersion: string;
  freshness: "fresh" | "stale";
  countries: Array<{ code: string; name: string; flagUrl?: string | null }>;
  competitions: Array<{ id: string; name: string; countryCode?: string | null }>;
  teams: StreakTeam[];
  topStreaks: StreakRecord[];
  upcomingFixtures: FixtureStreakComparison[];
  upcomingState: "available" | "unavailable";
  teamProfiles: Record<string, StreakRecord[]>;
  query: StreakExplorerQuery & { sort: "length" | "team" | "sample"; page: number };
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

export type StreakExplorerQuery = {
  asOf: string;
  country?: string;
  competition?: string;
  teamId?: string;
  scope?: StreakScope;
  category?: StreakCategory;
  metric?: StreakMetric;
  minimumLength?: number;
  search?: string;
};

export interface StreakExplorerService {
  getExplorer(query: StreakExplorerQuery): Promise<StreakExplorerData>;
}
