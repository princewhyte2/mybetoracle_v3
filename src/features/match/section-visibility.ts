import type { MatchDetail } from "./types";

export function matchSectionVisibility(match: MatchDetail) {
  return {
    overview: true,
    oracle: match.oracleMarket.available || match.predictions.some(pick => pick.available),
    h2h: match.availability.h2h === "available" && match.h2h.length > 0,
    lineups: match.availability.lineups === "available" &&
      Boolean(match.lineup.homePlayers?.length || match.lineup.awayPlayers?.length),
    stats: (match.availability.statistics === "available" && match.comparison.length > 0) ||
      Boolean(match.playerStatistics?.some(player =>
        [player.rating, player.minutes, player.goals, player.assists].some(value => value !== null))),
    streaks: match.availability.streaks === "available" && match.streaks.some(streak =>
      streak.teamId === match.home.id || streak.teamId === match.away.id),
  };
}
