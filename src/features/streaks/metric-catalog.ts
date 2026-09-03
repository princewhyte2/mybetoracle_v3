import type { MetricMeta, StreakCategory, StreakMetric } from "./types";
import type { Locale } from "@/i18n/config";

export const categoryLabels: Record<StreakCategory, string> = {
  results: "Results",
  goals: "Goals",
  firstHalf: "First Half",
  secondHalf: "Second Half",
  corners: "Corners",
  cards: "Cards",
};

export const metricCatalog: MetricMeta[] = [
  { metric: "WIN", label: "Won", shortLabel: "Win", category: "results" },
  { metric: "UNBEATEN", label: "Unbeaten", shortLabel: "Unbeaten", category: "results" },
  { metric: "DRAW", label: "Drawn", shortLabel: "Draw", category: "results" },
  { metric: "LOSS", label: "Lost", shortLabel: "Loss", category: "results" },
  { metric: "WINLESS", label: "Winless", shortLabel: "Winless", category: "results" },
  { metric: "NO_DRAW", label: "No draw", shortLabel: "No draw", category: "results" },
  { metric: "WIN_BY_2_PLUS", label: "Won by 2+ goals", shortLabel: "Win by 2+", category: "results" },
  { metric: "AVOID_DEFEAT_BY_2_PLUS", label: "Covered +1.5 handicap", shortLabel: "+1.5 cover", category: "results" },
  { metric: "SCORED", label: "Scored", shortLabel: "Scored", category: "goals" },
  { metric: "CLEAN_SHEET", label: "Kept a clean sheet", shortLabel: "Clean sheet", category: "goals" },
  { metric: "FAILED_TO_SCORE", label: "Failed to score", shortLabel: "No goal", category: "goals" },
  { metric: "CONCEDED", label: "Conceded", shortLabel: "Conceded", category: "goals" },
  { metric: "BTTS_YES", label: "Both teams scored", shortLabel: "BTTS Yes", category: "goals" },
  { metric: "BTTS_NO", label: "At least one team did not score", shortLabel: "BTTS No", category: "goals" },
  { metric: "OVER_0_5", label: "Over 0.5 goals", shortLabel: "Over 0.5", category: "goals" },
  { metric: "UNDER_0_5", label: "Under 0.5 goals", shortLabel: "Under 0.5", category: "goals" },
  { metric: "OVER_1_5", label: "Over 1.5 goals", shortLabel: "Over 1.5", category: "goals" },
  { metric: "UNDER_1_5", label: "Under 1.5 goals", shortLabel: "Under 1.5", category: "goals" },
  { metric: "OVER_2_5", label: "Over 2.5 goals", shortLabel: "Over 2.5", category: "goals" },
  { metric: "UNDER_2_5", label: "Under 2.5 goals", shortLabel: "Under 2.5", category: "goals" },
  { metric: "OVER_3_5", label: "Over 3.5 goals", shortLabel: "Over 3.5", category: "goals" },
  { metric: "UNDER_3_5", label: "Under 3.5 goals", shortLabel: "Under 3.5", category: "goals" },
  { metric: "FIRST_HALF_WIN", label: "First-half win", shortLabel: "1H win", category: "firstHalf" },
  { metric: "FIRST_HALF_DRAW", label: "First-half draw", shortLabel: "1H draw", category: "firstHalf" },
  { metric: "FIRST_HALF_LOSS", label: "First-half loss", shortLabel: "1H loss", category: "firstHalf" },
  { metric: "FIRST_HALF_SCORED", label: "Scored in first half", shortLabel: "1H scored", category: "firstHalf" },
  { metric: "FIRST_HALF_CLEAN_SHEET", label: "First-half clean sheet", shortLabel: "1H clean sheet", category: "firstHalf" },
  { metric: "FIRST_HALF_OVER_0_5", label: "First half over 0.5", shortLabel: "1H O0.5", category: "firstHalf" },
  { metric: "FIRST_HALF_UNDER_0_5", label: "First half under 0.5", shortLabel: "1H U0.5", category: "firstHalf" },
  { metric: "FIRST_HALF_OVER_1_5", label: "First half over 1.5", shortLabel: "1H O1.5", category: "firstHalf" },
  { metric: "FIRST_HALF_UNDER_1_5", label: "First half under 1.5", shortLabel: "1H U1.5", category: "firstHalf" },
  { metric: "SECOND_HALF_SCORED", label: "Scored in second half", shortLabel: "2H scored", category: "secondHalf" },
  { metric: "SECOND_HALF_CLEAN_SHEET", label: "Second-half clean sheet", shortLabel: "2H clean sheet", category: "secondHalf" },
  { metric: "SECOND_HALF_OVER_0_5", label: "Second half over 0.5", shortLabel: "2H O0.5", category: "secondHalf" },
  { metric: "SECOND_HALF_UNDER_0_5", label: "Second half under 0.5", shortLabel: "2H U0.5", category: "secondHalf" },
  { metric: "SECOND_HALF_OVER_1_5", label: "Second half over 1.5", shortLabel: "2H O1.5", category: "secondHalf" },
  { metric: "SECOND_HALF_UNDER_1_5", label: "Second half under 1.5", shortLabel: "2H U1.5", category: "secondHalf" },
  { metric: "CORNERS_OVER_7_5", label: "Over 7.5 match corners", shortLabel: "Corners O7.5", category: "corners" },
  { metric: "CORNERS_UNDER_7_5", label: "Under 7.5 match corners", shortLabel: "Corners U7.5", category: "corners" },
  { metric: "CORNERS_OVER_8_5", label: "Over 8.5 match corners", shortLabel: "Corners O8.5", category: "corners" },
  { metric: "CORNERS_UNDER_8_5", label: "Under 8.5 match corners", shortLabel: "Corners U8.5", category: "corners" },
  { metric: "CORNERS_OVER_9_5", label: "Over 9.5 match corners", shortLabel: "Corners O9.5", category: "corners" },
  { metric: "CORNERS_UNDER_9_5", label: "Under 9.5 match corners", shortLabel: "Corners U9.5", category: "corners" },
  { metric: "CORNERS_OVER_10_5", label: "Over 10.5 match corners", shortLabel: "Corners O10.5", category: "corners" },
  { metric: "CORNERS_UNDER_10_5", label: "Under 10.5 match corners", shortLabel: "Corners U10.5", category: "corners" },
  { metric: "TEAM_CORNERS_OVER_3_5", label: "Team over 3.5 corners", shortLabel: "Team corners O3.5", category: "corners" },
  { metric: "TEAM_CORNERS_OVER_4_5", label: "Team over 4.5 corners", shortLabel: "Team corners O4.5", category: "corners" },
  { metric: "TEAM_CORNERS_OVER_5_5", label: "Team over 5.5 corners", shortLabel: "Team corners O5.5", category: "corners" },
  { metric: "CARDS_OVER_2_5", label: "Over 2.5 match cards", shortLabel: "Cards O2.5", category: "cards" },
  { metric: "CARDS_UNDER_2_5", label: "Under 2.5 match cards", shortLabel: "Cards U2.5", category: "cards" },
  { metric: "CARDS_OVER_3_5", label: "Over 3.5 match cards", shortLabel: "Cards O3.5", category: "cards" },
  { metric: "CARDS_UNDER_3_5", label: "Under 3.5 match cards", shortLabel: "Cards U3.5", category: "cards" },
  { metric: "CARDS_OVER_4_5", label: "Over 4.5 match cards", shortLabel: "Cards O4.5", category: "cards" },
  { metric: "CARDS_UNDER_4_5", label: "Under 4.5 match cards", shortLabel: "Cards U4.5", category: "cards" },
  { metric: "TEAM_CARD", label: "Team received a card", shortLabel: "Team card", category: "cards" },
  { metric: "BOOKING_POINTS_OVER_25", label: "Over 25 booking points", shortLabel: "Booking O25", category: "cards" },
  { metric: "BOOKING_POINTS_OVER_35", label: "Over 35 booking points", shortLabel: "Booking O35", category: "cards" },
  { metric: "BOOKING_POINTS_OVER_45", label: "Over 45 booking points", shortLabel: "Booking O45", category: "cards" },
];

export const metricByKey = new Map<StreakMetric, MetricMeta>(metricCatalog.map((item) => [item.metric, item]));

// Cards and corners remain part of the data contract, but are not launch-facing
// until those evidence feeds are ready for customers.
export function isLaunchVisibleStreakMetric(metric: StreakMetric) {
  const category = metricByKey.get(metric)?.category;
  return category !== "corners" && category !== "cards";
}

const metricWords: Record<Locale, Record<string, string>> = {
  en:{win:"Won",unbeaten:"Unbeaten",draw:"Drawn",loss:"Lost",winless:"Winless",noDraw:"No draw",winByTwo:"Won by 2+ goals",cover:"Avoided defeat by 2+ goals",scored:"Scored",clean:"Kept a clean sheet",failed:"Failed to score",conceded:"Conceded",bttsYes:"Both teams scored",bttsNo:"At least one team did not score",first:"First half",second:"Second half",goals:"goals",corners:"corners",teamCorners:"team corners",cards:"cards",teamCard:"Team received a card",booking:"booking points",over:"Over",under:"Under"},
  es:{win:"Ganó",unbeaten:"Invicto",draw:"Empató",loss:"Perdió",winless:"Sin ganar",noDraw:"Sin empates",winByTwo:"Ganó por 2+ goles",cover:"Evitó perder por 2+ goles",scored:"Marcó",clean:"Dejó la portería a cero",failed:"No marcó",conceded:"Encajó",bttsYes:"Marcaron ambos equipos",bttsNo:"Al menos un equipo no marcó",first:"Primera parte",second:"Segunda parte",goals:"goles",corners:"córneres",teamCorners:"córneres del equipo",cards:"tarjetas",teamCard:"El equipo recibió una tarjeta",booking:"puntos por tarjetas",over:"Más de",under:"Menos de"},
  fr:{win:"Victoire",unbeaten:"Invaincu",draw:"Match nul",loss:"Défaite",winless:"Sans victoire",noDraw:"Aucun nul",winByTwo:"Victoire par 2 buts ou plus",cover:"Défaite évitée par 2 buts ou plus",scored:"A marqué",clean:"N’a pas encaissé",failed:"N’a pas marqué",conceded:"A encaissé",bttsYes:"Les deux équipes ont marqué",bttsNo:"Au moins une équipe n’a pas marqué",first:"Première période",second:"Deuxième période",goals:"buts",corners:"corners",teamCorners:"corners de l’équipe",cards:"cartons",teamCard:"L’équipe a reçu un carton",booking:"points disciplinaires",over:"Plus de",under:"Moins de"},
  de:{win:"Gewonnen",unbeaten:"Ungeschlagen",draw:"Unentschieden",loss:"Verloren",winless:"Siegslos",noDraw:"Kein Unentschieden",winByTwo:"Mit 2+ Toren gewonnen",cover:"Niederlage mit 2+ Toren vermieden",scored:"Tor erzielt",clean:"Ohne Gegentor",failed:"Ohne Tor",conceded:"Gegentor kassiert",bttsYes:"Beide Teams trafen",bttsNo:"Mindestens ein Team traf nicht",first:"Erste Halbzeit",second:"Zweite Halbzeit",goals:"Tore",corners:"Ecken",teamCorners:"Teamecken",cards:"Karten",teamCard:"Team erhielt eine Karte",booking:"Kartenpunkte",over:"Über",under:"Unter"},
  it:{win:"Vittoria",unbeaten:"Imbattuta",draw:"Pareggio",loss:"Sconfitta",winless:"Senza vittorie",noDraw:"Nessun pareggio",winByTwo:"Vittoria con 2+ gol",cover:"Evitata la sconfitta con 2+ gol",scored:"Ha segnato",clean:"Porta inviolata",failed:"Non ha segnato",conceded:"Ha subito gol",bttsYes:"Entrambe hanno segnato",bttsNo:"Almeno una squadra non ha segnato",first:"Primo tempo",second:"Secondo tempo",goals:"gol",corners:"calci d’angolo",teamCorners:"calci d’angolo della squadra",cards:"cartellini",teamCard:"La squadra ha ricevuto un cartellino",booking:"punti disciplinari",over:"Over",under:"Under"},
  pt:{win:"Vitória",unbeaten:"Invicto",draw:"Empate",loss:"Derrota",winless:"Sem vencer",noDraw:"Sem empates",winByTwo:"Vitória por 2+ gols",cover:"Evitou derrota por 2+ gols",scored:"Marcou",clean:"Não sofreu gols",failed:"Não marcou",conceded:"Sofreu gol",bttsYes:"Ambos os times marcaram",bttsNo:"Pelo menos um time não marcou",first:"Primeiro tempo",second:"Segundo tempo",goals:"gols",corners:"escanteios",teamCorners:"escanteios do time",cards:"cartões",teamCard:"O time recebeu um cartão",booking:"pontos disciplinares",over:"Mais de",under:"Menos de"},
};

function localizedMetric(metric: StreakMetric, locale: Locale, short: boolean) {
  const w=metricWords[locale];
  const fixed:Partial<Record<StreakMetric,string>>={WIN:w.win,UNBEATEN:w.unbeaten,DRAW:w.draw,LOSS:w.loss,WINLESS:w.winless,NO_DRAW:w.noDraw,WIN_BY_2_PLUS:w.winByTwo,AVOID_DEFEAT_BY_2_PLUS:w.cover,SCORED:w.scored,CLEAN_SHEET:w.clean,FAILED_TO_SCORE:w.failed,CONCEDED:w.conceded,BTTS_YES:w.bttsYes,BTTS_NO:w.bttsNo,TEAM_CARD:w.teamCard};
  if(fixed[metric]) return fixed[metric]!;
  const value=metric.match(/_(\d+)_(\d+)$/); const threshold=value?`${value[1]}.${value[2]}`:"";
  const direction=metric.includes("UNDER")?w.under:w.over;
  if(metric.startsWith("FIRST_HALF_")){const action=metric.endsWith("WIN")?w.win:metric.endsWith("DRAW")?w.draw:metric.endsWith("LOSS")?w.loss:metric.endsWith("SCORED")?w.scored:metric.endsWith("CLEAN_SHEET")?w.clean:`${direction} ${threshold}`;return short?`1H ${action}`:`${w.first}: ${action}`;}
  if(metric.startsWith("SECOND_HALF_")){const action=metric.endsWith("SCORED")?w.scored:metric.endsWith("CLEAN_SHEET")?w.clean:`${direction} ${threshold}`;return short?`2H ${action}`:`${w.second}: ${action}`;}
  if(metric.startsWith("TEAM_CORNERS_")) return short?`${w.teamCorners} ${direction} ${threshold}`:`${direction} ${threshold} ${w.teamCorners}`;
  if(metric.startsWith("CORNERS_")) return short?`${w.corners} ${direction} ${threshold}`:`${direction} ${threshold} ${w.corners}`;
  if(metric.startsWith("CARDS_")) return short?`${w.cards} ${direction} ${threshold}`:`${direction} ${threshold} ${w.cards}`;
  if(metric.startsWith("BOOKING_POINTS_")){const points=metric.match(/_(\d+)$/)?.[1]??"";return `${w.over} ${points} ${w.booking}`;}
  if(metric.startsWith("OVER_")||metric.startsWith("UNDER_")) return `${direction} ${threshold} ${w.goals}`;
  return metricByKey.get(metric)?.label ?? metric;
}

export function metricLabel(metric: StreakMetric, locale: Locale = "en") { return localizedMetric(metric,locale,false); }
export function metricShortLabel(metric: StreakMetric, locale: Locale = "en") { return localizedMetric(metric,locale,true); }
