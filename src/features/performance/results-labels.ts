import type { Locale } from "@/i18n/config";

type ResultsLabels = {
  search: string;
  searchPredictions: string;
  predictions: string;
  summary: string;
  verifiedPublications: string;
  originalVisible: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  accaWins: string;
  hitRate: string;
  accumulatorResults: string;
  predictionResults: string;
  performanceSummary: string;
  recentWins: string;
  winningAccas: string;
  completeSlips: string;
  dailyAcca: string;
  weeklyAcca: string;
  totalOdds: string;
  publishedSelection: string;
  retained: string;
  allDates: string;
  format: string;
  dailyWeekly: string;
  daily: string;
  weekly: string;
  outcome: string;
  allOutcomes: string;
  archive: string;
  settledAccas: string;
  newestFirst: string;
  days: string;
  settledPredictions: string;
  originalRecord: string;
  pageOf: string;
  byMarket: string;
  singlePredictions: string;
  rateSample: string;
  byOracle: string;
  observed: string;
  transparent: string;
  method: string;
  decided: string;
  oddsNotRecorded: string;
};

export const resultsLabels: Record<Locale, ResultsLabels> = {
  en: {
    search: "Search results",
    searchPredictions: "Search prediction results",
    predictions: "Predictions",
    summary: "Summary",
    verifiedPublications: "Verified publications",
    originalVisible: "Original picks and settlement records remain visible.",
    eyebrow: "VERIFIED TRACK RECORD",
    title: "Results",
    subtitle:
      "Published Accas and Oracle predictions, preserved after settlement.",
    accaWins: "Acca wins",
    hitRate: "prediction hit rate",
    accumulatorResults: "Acca results",
    predictionResults: "Prediction results",
    performanceSummary: "Performance summary",
    recentWins: "RECENT WINS",
    winningAccas: "Winning Accas",
    completeSlips: "Complete published slips",
    dailyAcca: "Daily Acca",
    weeklyAcca: "Weekly Acca",
    totalOdds: "Total odds",
    publishedSelection: "Published selection",
    retained: "Published selections and odds are retained after settlement.",
    allDates: "All dates",
    format: "Format",
    dailyWeekly: "Daily and weekly",
    daily: "Daily",
    weekly: "Weekly",
    outcome: "Outcome",
    allOutcomes: "All outcomes",
    archive: "Publication archive",
    settledAccas: "settled Accas",
    newestFirst: "newest first",
    days: "days",
    settledPredictions: "settled predictions",
    originalRecord: "Original market and verified final score",
    pageOf: "Page {page} of {pages}",
    byMarket: "By market",
    singlePredictions: "Settled single predictions",
    rateSample: "Hit rate · sample",
    byOracle: "By Oracle Score",
    observed: "Observed results, not guarantees",
    transparent: "Transparent calculation",
    method:
      "Hit rate equals wins divided by decided predictions. Voids remain visible but are excluded from the denominator. Historical results do not guarantee future outcomes.",
    decided: "decided",
    oddsNotRecorded: "Publication odds not recorded",
  },
  es: {
    search: "Buscar resultados",
    searchPredictions: "Buscar resultados de pronósticos",
    predictions: "Pronósticos",
    summary: "Resumen",
    verifiedPublications: "Publicaciones verificadas",
    originalVisible: "Los pronósticos y registros de resolución siguen visibles.",
    eyebrow: "HISTORIAL VERIFICADO",
    title: "Resultados",
    subtitle:
      "Accas y pronósticos Oracle publicados, conservados después de su resolución.",
    accaWins: "Accas ganadas",
    hitRate: "tasa de acierto",
    accumulatorResults: "Resultados de Accas",
    predictionResults: "Resultados de pronósticos",
    performanceSummary: "Resumen de rendimiento",
    recentWins: "VICTORIAS RECIENTES",
    winningAccas: "Accas ganadoras",
    completeSlips: "Combinaciones publicadas completas",
    dailyAcca: "Acca diaria",
    weeklyAcca: "Acca semanal",
    totalOdds: "Cuota total",
    publishedSelection: "Selección publicada",
    retained:
      "Las selecciones y cuotas publicadas se conservan después de la resolución.",
    allDates: "Todas las fechas",
    format: "Formato",
    dailyWeekly: "Diarias y semanales",
    daily: "Diarias",
    weekly: "Semanales",
    outcome: "Resultado",
    allOutcomes: "Todos los resultados",
    archive: "Archivo de publicaciones",
    settledAccas: "Accas resueltas",
    newestFirst: "más recientes primero",
    days: "días",
    settledPredictions: "pronósticos resueltos",
    originalRecord: "Mercado original y marcador final verificado",
    pageOf: "Página {page} de {pages}",
    byMarket: "Por mercado",
    singlePredictions: "Pronósticos individuales resueltos",
    rateSample: "Acierto · muestra",
    byOracle: "Por Oracle Score",
    observed: "Resultados observados, no garantías",
    transparent: "Cálculo transparente",
    method:
      "La tasa de acierto divide los pronósticos ganados entre los decididos. Los anulados siguen visibles, pero no cuentan en el denominador. El historial no garantiza resultados futuros.",
    decided: "decididos",
    oddsNotRecorded: "Cuota de publicación no registrada",
  },
  fr: {
    search: "Rechercher dans les résultats",
    searchPredictions: "Rechercher des résultats de pronostics",
    predictions: "Pronostics",
    summary: "Synthèse",
    verifiedPublications: "Publications vérifiées",
    originalVisible: "Les pronostics et règlements d’origine restent visibles.",
    eyebrow: "HISTORIQUE VÉRIFIÉ",
    title: "Résultats",
    subtitle: "Accas et pronostics Oracle publiés, conservés après règlement.",
    accaWins: "Accas gagnées",
    hitRate: "taux de réussite",
    accumulatorResults: "Résultats des Accas",
    predictionResults: "Résultats des pronostics",
    performanceSummary: "Synthèse des performances",
    recentWins: "GAINS RÉCENTS",
    winningAccas: "Accas gagnantes",
    completeSlips: "Combinaisons publiées complètes",
    dailyAcca: "Acca quotidienne",
    weeklyAcca: "Acca hebdomadaire",
    totalOdds: "Cote totale",
    publishedSelection: "Sélection publiée",
    retained:
      "Les sélections et les cotes publiées sont conservées après règlement.",
    allDates: "Toutes les dates",
    format: "Format",
    dailyWeekly: "Quotidiennes et hebdomadaires",
    daily: "Quotidiennes",
    weekly: "Hebdomadaires",
    outcome: "Issue",
    allOutcomes: "Toutes les issues",
    archive: "Archives des publications",
    settledAccas: "Accas réglées",
    newestFirst: "plus récentes d’abord",
    days: "jours",
    settledPredictions: "pronostics réglés",
    originalRecord: "Marché d’origine et score final vérifié",
    pageOf: "Page {page} sur {pages}",
    byMarket: "Par marché",
    singlePredictions: "Pronostics individuels réglés",
    rateSample: "Réussite · échantillon",
    byOracle: "Par Oracle Score",
    observed: "Résultats constatés, sans garantie",
    transparent: "Calcul transparent",
    method:
      "Le taux de réussite correspond aux pronostics gagnés divisés par les pronostics décidés. Les annulations restent visibles, mais sont exclues du calcul. Les résultats passés ne garantissent pas les résultats futurs.",
    decided: "décidés",
    oddsNotRecorded: "Cote de publication non enregistrée",
  },
  de: {
    search: "Ergebnisse suchen",
    searchPredictions: "Prognoseergebnisse suchen",
    predictions: "Prognosen",
    summary: "Übersicht",
    verifiedPublications: "Verifizierte Veröffentlichungen",
    originalVisible: "Ursprüngliche Tipps und Abrechnungen bleiben sichtbar.",
    eyebrow: "VERIFIZIERTER VERLAUF",
    title: "Ergebnisse",
    subtitle:
      "Veröffentlichte Accas und Oracle-Prognosen bleiben nach der Abrechnung dokumentiert.",
    accaWins: "gewonnene Accas",
    hitRate: "Trefferquote",
    accumulatorResults: "Acca-Ergebnisse",
    predictionResults: "Prognoseergebnisse",
    performanceSummary: "Leistungsübersicht",
    recentWins: "LETZTE GEWINNE",
    winningAccas: "Gewonnene Accas",
    completeSlips: "Vollständige veröffentlichte Kombinationen",
    dailyAcca: "Tägliche Acca",
    weeklyAcca: "Wöchentliche Acca",
    totalOdds: "Gesamtquote",
    publishedSelection: "Veröffentlichter Tipp",
    retained:
      "Veröffentlichte Tipps und Quoten bleiben nach der Abrechnung erhalten.",
    allDates: "Alle Daten",
    format: "Format",
    dailyWeekly: "Täglich und wöchentlich",
    daily: "Täglich",
    weekly: "Wöchentlich",
    outcome: "Ausgang",
    allOutcomes: "Alle Ergebnisse",
    archive: "Veröffentlichungsarchiv",
    settledAccas: "abgerechnete Accas",
    newestFirst: "neueste zuerst",
    days: "Tage",
    settledPredictions: "abgerechnete Prognosen",
    originalRecord: "Ursprünglicher Markt und verifiziertes Endergebnis",
    pageOf: "Seite {page} von {pages}",
    byMarket: "Nach Markt",
    singlePredictions: "Abgerechnete Einzelprognosen",
    rateSample: "Trefferquote · Stichprobe",
    byOracle: "Nach Oracle Score",
    observed: "Beobachtete Ergebnisse, keine Garantien",
    transparent: "Transparente Berechnung",
    method:
      "Die Trefferquote entspricht den gewonnenen geteilt durch die entschiedenen Prognosen. Stornierte Tipps bleiben sichtbar, werden aber nicht mitgerechnet. Vergangene Ergebnisse garantieren keine künftigen Resultate.",
    decided: "entschieden",
    oddsNotRecorded: "Veröffentlichungsquote nicht erfasst",
  },
  it: {
    search: "Cerca nei risultati",
    searchPredictions: "Cerca risultati dei pronostici",
    predictions: "Pronostici",
    summary: "Riepilogo",
    verifiedPublications: "Pubblicazioni verificate",
    originalVisible: "Pronostici e referti originali restano visibili.",
    eyebrow: "STORICO VERIFICATO",
    title: "Risultati",
    subtitle:
      "Accas e pronostici Oracle pubblicati, conservati dopo il referto.",
    accaWins: "Accas vinte",
    hitRate: "tasso di successo",
    accumulatorResults: "Risultati delle Accas",
    predictionResults: "Risultati dei pronostici",
    performanceSummary: "Riepilogo delle prestazioni",
    recentWins: "VINCITE RECENTI",
    winningAccas: "Accas vincenti",
    completeSlips: "Combinazioni pubblicate complete",
    dailyAcca: "Acca giornaliera",
    weeklyAcca: "Acca settimanale",
    totalOdds: "Quota totale",
    publishedSelection: "Selezione pubblicata",
    retained:
      "Le selezioni e le quote pubblicate restano disponibili dopo il referto.",
    allDates: "Tutte le date",
    format: "Formato",
    dailyWeekly: "Giornaliere e settimanali",
    daily: "Giornaliere",
    weekly: "Settimanali",
    outcome: "Esito",
    allOutcomes: "Tutti gli esiti",
    archive: "Archivio delle pubblicazioni",
    settledAccas: "Accas refertate",
    newestFirst: "più recenti prima",
    days: "giorni",
    settledPredictions: "pronostici refertati",
    originalRecord: "Mercato originale e punteggio finale verificato",
    pageOf: "Pagina {page} di {pages}",
    byMarket: "Per mercato",
    singlePredictions: "Pronostici singoli refertati",
    rateSample: "Successo · campione",
    byOracle: "Per Oracle Score",
    observed: "Risultati osservati, non garanzie",
    transparent: "Calcolo trasparente",
    method:
      "Il tasso di successo corrisponde ai pronostici vinti divisi per quelli decisi. Gli annullati restano visibili, ma sono esclusi dal calcolo. I risultati passati non garantiscono quelli futuri.",
    decided: "decisi",
    oddsNotRecorded: "Quota di pubblicazione non registrata",
  },
  pt: {
    search: "Buscar resultados",
    searchPredictions: "Buscar resultados de palpites",
    predictions: "Palpites",
    summary: "Resumo",
    verifiedPublications: "Publicações verificadas",
    originalVisible: "Os palpites e resultados apurados continuam visíveis.",
    eyebrow: "HISTÓRICO VERIFICADO",
    title: "Resultados",
    subtitle:
      "Accas e palpites Oracle publicados, preservados após a apuração.",
    accaWins: "Accas ganhas",
    hitRate: "taxa de acerto",
    accumulatorResults: "Resultados de Accas",
    predictionResults: "Resultados de palpites",
    performanceSummary: "Resumo de desempenho",
    recentWins: "VITÓRIAS RECENTES",
    winningAccas: "Accas vencedoras",
    completeSlips: "Combinações publicadas completas",
    dailyAcca: "Acca diária",
    weeklyAcca: "Acca semanal",
    totalOdds: "Odd total",
    publishedSelection: "Seleção publicada",
    retained: "As seleções e odds publicadas são preservadas após a apuração.",
    allDates: "Todas as datas",
    format: "Formato",
    dailyWeekly: "Diárias e semanais",
    daily: "Diárias",
    weekly: "Semanais",
    outcome: "Resultado",
    allOutcomes: "Todos os resultados",
    archive: "Arquivo de publicações",
    settledAccas: "Accas apuradas",
    newestFirst: "mais recentes primeiro",
    days: "dias",
    settledPredictions: "palpites apurados",
    originalRecord: "Mercado original e placar final verificado",
    pageOf: "Página {page} de {pages}",
    byMarket: "Por mercado",
    singlePredictions: "Palpites individuais apurados",
    rateSample: "Acerto · amostra",
    byOracle: "Por Oracle Score",
    observed: "Resultados observados, não garantias",
    transparent: "Cálculo transparente",
    method:
      "A taxa de acerto divide os palpites ganhos pelos decididos. Os anulados continuam visíveis, mas ficam fora do denominador. O histórico não garante resultados futuros.",
    decided: "decididos",
    oddsNotRecorded: "Odd de publicação não registrada",
  },
};
