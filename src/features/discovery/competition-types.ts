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
export type CompetitionData = {
  schemaVersion: 'mbo-competition-v1'; locale: string;
  competition: { id: string; displayName: string; country: string | null; countryCode: string | null;
    emblemUrl: string | null; countryFlagUrl: string | null; type: string | null };
  seasons: Array<{ id: string; year: number; isCurrent: boolean }>;
  season: { id: string; year: number; isCurrent: boolean } | null;
  tab: CompetitionTab; fixtures: CompetitionFixture[]; recentResults: CompetitionFixture[];
  standings: { availability: 'available' | 'not_available' | 'unavailable'; sourceUpdatedAt: string | null;
    groups: Array<{ name: string; sourceUpdatedAt: string; items: CompetitionStanding[] }> } | null;
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};
