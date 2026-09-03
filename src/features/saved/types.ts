export type SavedMatchState = "LIVE" | "UPCOMING" | "SETTLED";
export type SavedOutcome = "WON" | "LOST" | "VOID";

export type SavedMatch = {
  id: string; slug: string; kickoffAt: string; state: SavedMatchState; minute?: number;
  competition: string; countryCode: string; homeTeam: string; awayTeam: string;
  selection: string; oracleScore: number; odds: number; alertEnabled: boolean; outcome?: SavedOutcome;
};
export type SavedAccumulator = { id: string; scope: "DAILY" | "WEEKLY"; targetLabel: string; variant: number; totalOdds: number; legs: number; wonLegs: number; status: "PENDING" | "WON"; nextKickoffAt?: string };
export type FollowedEntity = { id: string; type: "TEAM" | "COMPETITION"; name: string; context: string; shortCode: string; color: string; upcoming: number; alerts: boolean };
export type NotificationPreferences = { kickoff: boolean; lineup: boolean; oracleUpdate: boolean; settlement: boolean; accumulatorResult: boolean; morningDigest: boolean; eveningRecap: boolean };
export type SavedData = { asOf: string; matches: SavedMatch[]; accumulators: SavedAccumulator[]; following: FollowedEntity[]; notifications: NotificationPreferences };
export interface SavedService { getSaved(): Promise<SavedData>; }
