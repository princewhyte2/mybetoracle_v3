import type { OracleMarket, Team } from "@/features/today/types";

export type MatchDetailTeam = Team & {
  colors: [string, string];
  id: string;
  country: string;
  form: Array<"W" | "D" | "L">;
};

export type MatchStreak = {
  id: string;
  teamId: string;
  metric: string;
  shortLabel: string;
  scope: "OVERALL" | "HOME" | "AWAY";
  currentLength: number;
  sampleSize: number;
  category: "Results" | "Goals" | "Corners" | "Cards" | "First Half" | "Second Half";
};

export type MatchDetail = {
  id: string;
  slug: string;
  canonicalPath: string;
  status: "scheduled" | "live" | "finished";
  statusCode: string;
  kickoffAt: string;
  competition: { id: string; name: string; country: string; countryCode: string; round: string };
  venue: string | null;
  city: string | null;
  referee: string | null;
  home: MatchDetailTeam;
  away: MatchDetailTeam;
  score?: [number | null, number | null];
  elapsedMinute: number | null;
  oracleScore: number;
  oracleMarket: OracleMarket;
  evidence: string[];
  predictions: OracleMarket[];
  streaks: MatchStreak[];
  h2h: Array<{ id: string; date: string; competition: string; home: string; away: string; score: [number, number] }>;
  events: Array<{ id: string; teamId: string | null; minute: number | null; extra: number | null; type: string; detail: string | null; player: string | null; assist: string | null }>;
  comparison: Array<{ label: string; home: number; away: number; format: "number" | "percent" | "decimal" }>;
  lineup: { formationHome: string; formationAway: string; home: string[]; away: string[] };
  standings: Array<{ position: number; team: string; played: number; points: number; highlighted?: boolean }>;
  availability: {
    h2h: "available" | "not_available";
    streaks: "available" | "not_available";
    lineups: "available" | "not_available" | "not_confirmed";
    statistics: "available" | "not_available";
    standings: "available" | "not_available";
  };
  sourceUpdatedAt: string | null;
};

export interface MatchDetailService {
  getBySlug(slug: string): Promise<MatchDetail | null>;
}
