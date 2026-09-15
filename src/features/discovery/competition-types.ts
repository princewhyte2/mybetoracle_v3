export type CompetitionTab = 'overview' | 'fixtures' | 'results' | 'predictions' | 'standings';
export type CompetitionTeam = { id: string; displayName: string; emblemUrl: string | null };
export type CompetitionFixture = {
  id: string; kickoffAt: string; statusCode: string; elapsedMinute?: number | null; round: string | null;
  homeTeam: CompetitionTeam; awayTeam: CompetitionTeam;
  score: { home: number | null; away: number | null };
  predictions: Array<{ id: string; marketGroup: string; availability: string; selectionLabel: string | null;
    selectionShortLabel: string | null; confidenceScore: number | null; result: string; latestOdds: Array<{ decimalOdds: number }> }>;
};
export type CompetitionStanding = { rank: number; team: CompetitionTeam; played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number; form: string | null };
// Season-scoped, derived only from settled (FT/AET/PEN) fixtures with both
// regulation-time scores recorded -- see doubleengine's product-read.service.ts
// getCompetitionStatistics for the exact eligibility rule. `not_available`
// (zero eligible fixtures) and `unavailable` (transient failure) both carry
// null percentages/averages, never a fabricated 0%.
export type CompetitionStatistics = {
  availability: 'available' | 'not_available' | 'unavailable';
  matchesPlayed: number;
  avgTotalGoals: number | null;
  avgHomeGoals: number | null;
  avgAwayGoals: number | null;
  homeWinPct: number | null;
  drawPct: number | null;
  awayWinPct: number | null;
  bttsPct: number | null;
  over15Pct: number | null;
  over25Pct: number | null;
  over35Pct: number | null;
};
export type CompetitionData = {
  schemaVersion: 'mbo-competition-v1'; locale: string;
  competition: { id: string; displayName: string; country: string | null; countryCode: string | null;
    emblemUrl: string | null; countryFlagUrl: string | null; type: string | null };
  seasons: Array<{ id: string; year: number; isCurrent: boolean }>;
  season: { id: string; year: number; isCurrent: boolean } | null;
  tab: CompetitionTab; fixtures: CompetitionFixture[]; recentResults: CompetitionFixture[];
  predictedFixtures: CompetitionFixture[];
  standings: { availability: 'available' | 'not_available' | 'unavailable'; sourceUpdatedAt: string | null;
    groups: Array<{ name: string; sourceUpdatedAt: string; items: CompetitionStanding[] }> } | null;
  statistics: CompetitionStatistics | null;
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};
