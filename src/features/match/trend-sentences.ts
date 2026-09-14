import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/football";
import type { MatchDetailTeam, MatchStreak } from "./types";

// A curated shortlist, not the full 62-metric catalog -- these are the
// metrics with real narrative value (Forebet-style "X have scored in Y of
// their last Z matches"), each hand-translated per locale rather than
// assembled from fragments, so the sentence reads naturally in every
// language instead of following English word order.
const curatedMetrics = [
  "WIN", "UNBEATEN", "SCORED", "CLEAN_SHEET", "FAILED_TO_SCORE",
  "BTTS_YES", "BTTS_NO", "OVER_1_5", "OVER_2_5", "UNDER_2_5", "OVER_3_5",
] as const;
type CuratedMetric = (typeof curatedMetrics)[number];

function isCuratedMetric(metric: string): metric is CuratedMetric {
  return (curatedMetrics as readonly string[]).includes(metric);
}

const templates: Record<Locale, Record<CuratedMetric, string>> = {
  en: {
    WIN: "{team} have won {count} of their last {sample} matches",
    UNBEATEN: "{team} are unbeaten in their last {count} matches",
    SCORED: "{team} have scored in {count} of their last {sample} matches",
    CLEAN_SHEET: "{team} have kept a clean sheet in {count} of their last {sample} matches",
    FAILED_TO_SCORE: "{team} have failed to score in {count} of their last {sample} matches",
    BTTS_YES: "{team} have seen both teams score in {count} of their last {sample} matches",
    BTTS_NO: "{team} have seen at least one team fail to score in {count} of their last {sample} matches",
    OVER_1_5: "{team} have seen over 1.5 goals in {count} of their last {sample} matches",
    OVER_2_5: "{team} have seen over 2.5 goals in {count} of their last {sample} matches",
    UNDER_2_5: "{team} have seen under 2.5 goals in {count} of their last {sample} matches",
    OVER_3_5: "{team} have seen over 3.5 goals in {count} of their last {sample} matches",
  },
  es: {
    WIN: "{team} ha ganado {count} de sus últimos {sample} partidos",
    UNBEATEN: "{team} lleva {count} partidos sin perder",
    SCORED: "{team} ha marcado en {count} de sus últimos {sample} partidos",
    CLEAN_SHEET: "{team} ha mantenido la portería a cero en {count} de sus últimos {sample} partidos",
    FAILED_TO_SCORE: "{team} no ha marcado en {count} de sus últimos {sample} partidos",
    BTTS_YES: "En {count} de los últimos {sample} partidos de {team}, ambos equipos marcaron",
    BTTS_NO: "En {count} de los últimos {sample} partidos de {team}, al menos un equipo no marcó",
    OVER_1_5: "{count} de los últimos {sample} partidos de {team} tuvieron más de 1.5 goles",
    OVER_2_5: "{count} de los últimos {sample} partidos de {team} tuvieron más de 2.5 goles",
    UNDER_2_5: "{count} de los últimos {sample} partidos de {team} tuvieron menos de 2.5 goles",
    OVER_3_5: "{count} de los últimos {sample} partidos de {team} tuvieron más de 3.5 goles",
  },
  fr: {
    WIN: "{team} a remporté {count} de ses {sample} derniers matchs",
    UNBEATEN: "{team} reste invaincu depuis {count} matchs",
    SCORED: "{team} a marqué lors de {count} de ses {sample} derniers matchs",
    CLEAN_SHEET: "{team} a gardé sa cage inviolée lors de {count} de ses {sample} derniers matchs",
    FAILED_TO_SCORE: "{team} n'a pas marqué lors de {count} de ses {sample} derniers matchs",
    BTTS_YES: "Les deux équipes ont marqué lors de {count} des {sample} derniers matchs de {team}",
    BTTS_NO: "Au moins une équipe n'a pas marqué lors de {count} des {sample} derniers matchs de {team}",
    OVER_1_5: "{count} des {sample} derniers matchs de {team} ont compté plus de 1,5 but",
    OVER_2_5: "{count} des {sample} derniers matchs de {team} ont compté plus de 2,5 buts",
    UNDER_2_5: "{count} des {sample} derniers matchs de {team} ont compté moins de 2,5 buts",
    OVER_3_5: "{count} des {sample} derniers matchs de {team} ont compté plus de 3,5 buts",
  },
  de: {
    WIN: "{team} hat {count} der letzten {sample} Spiele gewonnen",
    UNBEATEN: "{team} ist seit {count} Spielen ungeschlagen",
    SCORED: "{team} hat in {count} der letzten {sample} Spiele getroffen",
    CLEAN_SHEET: "{team} blieb in {count} der letzten {sample} Spiele ohne Gegentor",
    FAILED_TO_SCORE: "{team} blieb in {count} der letzten {sample} Spiele ohne eigenes Tor",
    BTTS_YES: "In {count} der letzten {sample} Spiele von {team} trafen beide Teams",
    BTTS_NO: "In {count} der letzten {sample} Spiele von {team} traf mindestens ein Team nicht",
    OVER_1_5: "In {count} der letzten {sample} Spiele von {team} fielen mehr als 1,5 Tore",
    OVER_2_5: "In {count} der letzten {sample} Spiele von {team} fielen mehr als 2,5 Tore",
    UNDER_2_5: "In {count} der letzten {sample} Spiele von {team} fielen weniger als 2,5 Tore",
    OVER_3_5: "In {count} der letzten {sample} Spiele von {team} fielen mehr als 3,5 Tore",
  },
  it: {
    WIN: "{team} ha vinto {count} delle ultime {sample} partite",
    UNBEATEN: "{team} è imbattuta da {count} partite",
    SCORED: "{team} ha segnato in {count} delle ultime {sample} partite",
    CLEAN_SHEET: "{team} non ha subito gol in {count} delle ultime {sample} partite",
    FAILED_TO_SCORE: "{team} non ha segnato in {count} delle ultime {sample} partite",
    BTTS_YES: "In {count} delle ultime {sample} partite di {team} hanno segnato entrambe le squadre",
    BTTS_NO: "In {count} delle ultime {sample} partite di {team} almeno una squadra non ha segnato",
    OVER_1_5: "In {count} delle ultime {sample} partite di {team} sono stati segnati più di 1,5 gol",
    OVER_2_5: "In {count} delle ultime {sample} partite di {team} sono stati segnati più di 2,5 gol",
    UNDER_2_5: "In {count} delle ultime {sample} partite di {team} sono stati segnati meno di 2,5 gol",
    OVER_3_5: "In {count} delle ultime {sample} partite di {team} sono stati segnati più di 3,5 gol",
  },
  pt: {
    WIN: "{team} venceu {count} dos últimos {sample} jogos",
    UNBEATEN: "{team} está invicto há {count} jogos",
    SCORED: "{team} marcou em {count} dos últimos {sample} jogos",
    CLEAN_SHEET: "{team} não sofreu gols em {count} dos últimos {sample} jogos",
    FAILED_TO_SCORE: "{team} não marcou em {count} dos últimos {sample} jogos",
    BTTS_YES: "Em {count} dos últimos {sample} jogos do {team}, ambos os times marcaram",
    BTTS_NO: "Em {count} dos últimos {sample} jogos do {team}, pelo menos um time não marcou",
    OVER_1_5: "Em {count} dos últimos {sample} jogos do {team} houve mais de 1,5 gols",
    OVER_2_5: "Em {count} dos últimos {sample} jogos do {team} houve mais de 2,5 gols",
    UNDER_2_5: "Em {count} dos últimos {sample} jogos do {team} houve menos de 2,5 gols",
    OVER_3_5: "Em {count} dos últimos {sample} jogos do {team} houve mais de 3,5 gols",
  },
};

// Only the fixture's own scope (home form for the home team, away form for
// the away team) is used -- an overall-record sentence would be a less
// honest framing of a specific upcoming match than the team's record in
// that specific context. Requires a real, non-thin sample before surfacing
// anything: a 1-of-1 "streak" is not a trend worth stating.
export function buildTrendSentence(
  team: MatchDetailTeam,
  streaks: MatchStreak[],
  scope: "HOME" | "AWAY",
  locale: Locale,
): string | null {
  const candidates = streaks.filter(
    (streak): streak is MatchStreak & { metric: CuratedMetric } =>
      streak.teamId === team.id &&
      streak.scope === scope &&
      isCuratedMetric(streak.metric) &&
      streak.currentLength >= 3 &&
      streak.sampleSize >= 3,
  );
  if (!candidates.length) return null;
  const best = candidates.reduce((top, item) => (item.currentLength > top.currentLength ? item : top));
  return fill(templates[locale][best.metric], {
    team: team.name,
    count: String(best.currentLength),
    sample: String(best.sampleSize),
  });
}
