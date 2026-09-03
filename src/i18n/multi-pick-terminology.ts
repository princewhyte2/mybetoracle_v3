import type { Locale } from "@/i18n/config";

type CopyOverrides = Record<string, string>;

const todayOverrides: Record<Locale, CopyOverrides> = {
  en: { openAccas: "Open published Multi-Picks", buildMyAcca: "Build My Multi-Pick", buildAcca: "Build Multi-Pick" },
  es: { openAccas: "Abrir Multi-Picks publicados", buildMyAcca: "Crear mi Multi-Pick", buildAcca: "Crear Multi-Pick" },
  fr: { openAccas: "Ouvrir les Multi-Picks publiés", buildMyAcca: "Créer mon Multi-Pick", buildAcca: "Créer un Multi-Pick" },
  de: { openAccas: "Veröffentlichte Multi-Picks öffnen", buildMyAcca: "Meinen Multi-Pick erstellen", buildAcca: "Multi-Pick erstellen" },
  it: { openAccas: "Apri i Multi-Picks pubblicati", buildMyAcca: "Crea il mio Multi-Pick", buildAcca: "Crea Multi-Pick" },
  pt: { openAccas: "Abrir Multi-Picks publicados", buildMyAcca: "Montar meu Multi-Pick", buildAcca: "Montar Multi-Pick" },
};

const betslipOverrides: Record<Locale, CopyOverrides> = {
  en: { todaySlip: "Today's edition", pastSlips: "Past editions", accumulators: "Multi-Picks", title: "Oracle Daily", dailyBetslip: "Oracle Daily", slipStandard: "Publication criteria", recentSlips: "Recent editions", dailyWeeklyAccas: "Daily and weekly Multi-Picks", openAccas: "Open Multi-Picks" },
  es: { todaySlip: "Edición de hoy", pastSlips: "Ediciones anteriores", accumulators: "Multi-Picks", title: "Oracle Daily", dailyBetslip: "Oracle Daily", slipStandard: "Criterios de publicación", recentSlips: "Ediciones recientes", dailyWeeklyAccas: "Multi-Picks diarios y semanales", openAccas: "Abrir Multi-Picks" },
  fr: { todaySlip: "Édition du jour", pastSlips: "Éditions précédentes", accumulators: "Multi-Picks", title: "Oracle Daily", dailyBetslip: "Oracle Daily", slipStandard: "Critères de publication", recentSlips: "Éditions récentes", dailyWeeklyAccas: "Multi-Picks quotidiens et hebdomadaires", openAccas: "Ouvrir les Multi-Picks" },
  de: { todaySlip: "Heutige Ausgabe", pastSlips: "Frühere Ausgaben", accumulators: "Multi-Picks", title: "Oracle Daily", dailyBetslip: "Oracle Daily", slipStandard: "Veröffentlichungskriterien", recentSlips: "Letzte Ausgaben", dailyWeeklyAccas: "Tägliche und wöchentliche Multi-Picks", openAccas: "Multi-Picks öffnen" },
  it: { todaySlip: "Edizione di oggi", pastSlips: "Edizioni precedenti", accumulators: "Multi-Picks", title: "Oracle Daily", dailyBetslip: "Oracle Daily", slipStandard: "Criteri di pubblicazione", recentSlips: "Edizioni recenti", dailyWeeklyAccas: "Multi-Picks giornalieri e settimanali", openAccas: "Apri i Multi-Picks" },
  pt: { todaySlip: "Edição de hoje", pastSlips: "Edições anteriores", accumulators: "Multi-Picks", title: "Oracle Daily", dailyBetslip: "Oracle Daily", slipStandard: "Critérios de publicação", recentSlips: "Edições recentes", dailyWeeklyAccas: "Multi-Picks diários e semanais", openAccas: "Abrir Multi-Picks" },
};

const resultsOverrides: Record<Locale, CopyOverrides> = {
  en: { subtitle: "Published Multi-Picks and Oracle predictions, preserved after settlement.", accaWins: "Multi-Pick wins", accumulatorResults: "Multi-Pick results", winningAccas: "Winning Multi-Picks", completeSlips: "Complete publications", dailyAcca: "Daily Multi-Pick", weeklyAcca: "Weekly Multi-Pick", settledAccas: "settled Multi-Picks" },
  es: { subtitle: "Multi-Picks y pronósticos Oracle publicados, conservados después de su resolución.", accaWins: "Multi-Picks ganados", accumulatorResults: "Resultados de Multi-Picks", winningAccas: "Multi-Picks ganadores", completeSlips: "Publicaciones completas", dailyAcca: "Multi-Pick diario", weeklyAcca: "Multi-Pick semanal", settledAccas: "Multi-Picks resueltos" },
  fr: { subtitle: "Multi-Picks et pronostics Oracle publiés, conservés après règlement.", accaWins: "Multi-Picks gagnés", accumulatorResults: "Résultats des Multi-Picks", winningAccas: "Multi-Picks gagnants", completeSlips: "Publications complètes", dailyAcca: "Multi-Pick quotidien", weeklyAcca: "Multi-Pick hebdomadaire", settledAccas: "Multi-Picks réglés" },
  de: { subtitle: "Veröffentlichte Multi-Picks und Oracle-Prognosen bleiben nach der Abrechnung dokumentiert.", accaWins: "Gewonnene Multi-Picks", accumulatorResults: "Multi-Pick-Ergebnisse", winningAccas: "Gewonnene Multi-Picks", completeSlips: "Vollständige Veröffentlichungen", dailyAcca: "Täglicher Multi-Pick", weeklyAcca: "Wöchentlicher Multi-Pick", settledAccas: "abgerechnete Multi-Picks" },
  it: { subtitle: "Multi-Picks e pronostici Oracle pubblicati, conservati dopo il referto.", accaWins: "Multi-Picks vinti", accumulatorResults: "Risultati dei Multi-Picks", winningAccas: "Multi-Picks vincenti", completeSlips: "Pubblicazioni complete", dailyAcca: "Multi-Pick giornaliero", weeklyAcca: "Multi-Pick settimanale", settledAccas: "Multi-Picks refertati" },
  pt: { subtitle: "Multi-Picks e palpites Oracle publicados, preservados após a apuração.", accaWins: "Multi-Picks ganhos", accumulatorResults: "Resultados de Multi-Picks", winningAccas: "Multi-Picks vencedores", completeSlips: "Publicações completas", dailyAcca: "Multi-Pick diário", weeklyAcca: "Multi-Pick semanal", settledAccas: "Multi-Picks apurados" },
};

const accountOverrides: Record<Locale, string> = {
  en: "Matches and Multi-Picks",
  es: "Partidos y Multi-Picks",
  fr: "Matchs et Multi-Picks",
  de: "Spiele und Multi-Picks",
  it: "Partite e Multi-Picks",
  pt: "Jogos e Multi-Picks",
};

export function withMultiPickTerminology<T extends Record<string, string>>(
  copy: T,
  locale: Locale,
  surface: "today" | "betslip" | "results",
): T {
  const overrides = surface === "today" ? todayOverrides : surface === "betslip" ? betslipOverrides : resultsOverrides;
  return { ...copy, ...overrides[locale] };
}

export function getMatchesAndMultiPicksLabel(locale: Locale) {
  return accountOverrides[locale];
}

export function getOracleDailyLabel() {
  return "Oracle Daily";
}
