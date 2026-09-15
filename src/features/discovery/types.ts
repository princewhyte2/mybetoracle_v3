export type DiscoverySection = "competitions" | "teams" | "countries" | "markets";
export type DiscoveryView = "explore" | "calendar" | "directory" | "competition" | "team" | "country" | "market";

export type CountryEntity = { slug: string; name: string; code: string; flagUrl?: string | null; competitions: number; teams: number; matchesToday: number };
export type CompetitionEntity = { id: string; slug: string; name: string; countrySlug: string; country: string; code: string; emblemUrl?: string | null; countryFlagUrl?: string | null; color: string; fixtures: number; oraclePicks: number; followers: string | null; description: string };
export type TeamEntity = { id: string; slug: string; name: string; shortName: string; emblemUrl?: string | null; countrySlug: string; competitionSlug: string | null; colors: [string,string]; position: number | null; form: Array<"W"|"D"|"L">; nextOpponent: string | null; streak: string | null; oracleScore: number | null };
export type MarketEntity = { slug: string; code: string; name: string; shortName: string; description: string; publishedToday: number; hitRate: number | null; settledSample: number };
export type DiscoveryFixture = { id: string; slug: null; kickoffAt: string; competitionSlug: string; homeSlug: string; awaySlug: string; marketSlug: string; pick: string; odds: number | null; oracleScore: number; state: "scheduled"|"live"|"finished"; score?: [number|null,number|null] };

export type DiscoveryData = {
  activityAvailable?: boolean;
  date: string;
  countries: CountryEntity[];
  competitions: CompetitionEntity[];
  teams: TeamEntity[];
  markets: MarketEntity[];
  fixtures: DiscoveryFixture[];
  catalog: Record<DiscoverySection, { loaded: number; total: number; nextPage: number | null; totalPages: number }>;
};
