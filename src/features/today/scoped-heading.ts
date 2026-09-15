// Plain, non-"server-only" module: shared by server-only page files
// (today/page.tsx, tomorrow/page.tsx, market-scope-page.tsx) and the
// client-rendered TodayExperience component for its per-competition
// group headings.
import type { Locale } from "@/i18n/config";
import { marketSlugs } from "@/features/discovery/market-presentation";

export type MarketScope = "today" | "tomorrow";

export { marketSlugs };

export const scopeWord: Record<Locale, Record<MarketScope, string>> = {
  en: { today: "today", tomorrow: "tomorrow" },
  es: { today: "hoy", tomorrow: "mañana" },
  fr: { today: "aujourd’hui", tomorrow: "demain" },
  de: { today: "heute", tomorrow: "morgen" },
  it: { today: "oggi", tomorrow: "domani" },
  pt: { today: "hoje", tomorrow: "amanhã" },
};

// A single colon-separated template reads naturally across all six locales
// regardless of subject length or grammatical gender, without following
// English word order (per V3_LOCALIZATION_STANDARD.md's translation rule).
// Shared by market-scope pages (subject = market name) and Today/Tomorrow's
// per-competition group headings (subject = competition name) so both use
// one proven, real-translated pattern instead of two ad-hoc ones.
export function scopedHeading(locale: Locale, subject: string, scope: MarketScope): string {
  const when = scopeWord[locale][scope];
  switch (locale) {
    case "es": return `${subject}: pronósticos para ${when}`;
    case "fr": return `${subject} : pronostics pour ${when}`;
    case "de": return `${subject}: Prognosen für ${when}`;
    case "it": return `${subject}: pronostici per ${when}`;
    case "pt": return `${subject}: palpites para ${when}`;
    default: return `${subject}: predictions for ${when}`;
  }
}

const SCOPED_DESCRIPTIONS: Record<string, Record<MarketScope, Record<Locale, string>>> = {
  "double-chance": {
    today: {
      en: "Daily double chance football predictions for today. Explore mathematical 1X, X2 and 12 probabilities, recorded odds, and verified team form across global leagues.",
      es: "Pronósticos de fútbol de doble oportunidad para hoy. Consulta probabilidades matemáticas 1X, X2 y 12, cuotas registradas y forma de equipos en todas las ligas.",
      fr: "Pronostics foot double chance pour aujourd’hui. Découvrez les probabilités mathématiques 1X, X2 et 12, les cotes enregistrées et la forme des équipes du jour.",
      de: "Tägliche Doppelte-Chance-Fußballprognosen für heute. Mathematische 1X-, X2- und 12-Wahrscheinlichkeiten, erfasste Quoten und verifizierte Formkurven.",
      it: "Pronostici calcio doppia chance per oggi. Consulta probabilità matematiche 1X, X2 e 12, quote registrate e stato di forma delle squadre per le partite di oggi.",
      pt: "Palpites de futebol de dupla hipótese para hoje. Veja probabilidades matemáticas 1X, X2 e 12, cotações registradas e a forma das equipes em todos os jogos.",
    },
    tomorrow: {
      en: "Double chance football predictions for tomorrow. Compare early mathematical 1X, X2 and 12 probabilities and recorded odds before kickoff.",
      es: "Pronósticos de fútbol de doble oportunidad para mañana. Compara probabilidades matemáticas 1X, X2 y 12 y cuotas registradas antes del inicio.",
      fr: "Pronostics foot double chance pour demain. Comparez à l'avance les probabilités mathématiques 1X, X2 et 12 et les cotes enregistrées avant le coup d'envoi.",
      de: "Doppelte-Chance-Fußballprognosen für morgen. Vergleiche mathematische 1X-, X2- und 12-Wahrscheinlichkeiten und erfasste Quoten vor dem Anpfiff.",
      it: "Pronostici calcio doppia chance per domani. Confronta in anticipo probabilità matematiche 1X, X2 e 12 e quote registrate prima del calcio d'inizio.",
      pt: "Palpites de futebol de dupla hipótese para amanhã. Compare antecipadamente probabilidades matemáticas 1X, X2 e 12 e cotações registradas antes do início.",
    },
  },
  "both-teams-score": {
    today: {
      en: "Both teams to score (BTTS / GG) football predictions for today. Mathematical scoring probabilities, defensive clean-sheet streaks, and recorded odds.",
      es: "Pronósticos de ambos equipos marcan (GG/NG) para hoy. Probabilidades matemáticas de gol, rachas defensivas y cuotas registradas de hoy.",
      fr: "Pronostics les deux équipes marquent (BTTS / GG) pour aujourd’hui. Probabilités statistiques de but, séries défensives et cotes enregistrées du jour.",
      de: "Beide Teams treffen (BTTS / GG) Prognosen für heute. Mathematische Torwahrscheinlichkeiten, Defensivserien und erfasste Quoten von heute.",
      it: "Pronostici entrambe le squadre a segno (GG/NG) per oggi. Probabilità matematiche di gol, serie difensive e quote registrate per le partite di oggi.",
      pt: "Palpites de ambos marcam (BTTS / GG) para hoje. Probabilidades matemáticas de gol, sequências defensivas e cotações registradas de hoje.",
    },
    tomorrow: {
      en: "Both teams to score (BTTS / GG) predictions for tomorrow. Early goal probabilities and recorded odds across tomorrow's fixture schedule.",
      es: "Pronósticos de ambos equipos marcan (GG/NG) para mañana. Probabilidades anticipadas de gol y cuotas registradas para mañana.",
      fr: "Pronostics les deux équipes marquent (BTTS / GG) pour demain. Probabilités anticipées de but et cotes enregistrées pour la journée de demain.",
      de: "Beide Teams treffen (BTTS / GG) Prognosen für morgen. Vorzeitige Torwahrscheinlichkeiten und erfasste Quoten für die morgigen Spiele.",
      it: "Pronostici entrambe le squadre a segno (GG/NG) per domani. Probabilità anticipate e quote registrate per le partite di domani.",
      pt: "Palpites de ambos marcam (BTTS / GG) para amanhã. Probabilidades antecipadas de gol e cotações registradas para os jogos de amanhã.",
    },
  },
  "total-2-5": {
    today: {
      en: "Over / Under 2.5 goals predictions for today. High-probability goal lines, mathematical totals, and recorded odds across today's matches.",
      es: "Pronósticos de más / menos 2.5 goles para hoy. Líneas de gol de alta probabilidad, totales matemáticos y cuotas registradas para hoy.",
      fr: "Pronostics plus / moins 2,5 buts pour aujourd’hui. Lignes de buts à haute probabilité, totaux statistiques et cotes enregistrées du jour.",
      de: "Über / Unter 2,5 Tore Prognosen für heute. Torlinien mit hoher Wahrscheinlichkeit, mathematische Gesamttore und erfasste Quoten von heute.",
      it: "Pronostici over / under 2.5 gol per oggi. Linee gol ad alta probabilità, totali matematici e quote registrate per i match di oggi.",
      pt: "Palpites de mais / menos 2.5 gols para hoje. Linhas de gol de alta probabilidade, totais matemáticos e cotações registradas de hoje.",
    },
    tomorrow: {
      en: "Over / Under 2.5 goals predictions for tomorrow. Detailed goal expectations and recorded bookmaker odds ahead of tomorrow's games.",
      es: "Pronósticos de más / menos 2.5 goles para mañana. Expectativas de gol detalladas y cuotas registradas antes de los partidos de mañana.",
      fr: "Pronostics plus / moins 2,5 buts pour demain. Estimations de buts détaillées et cotes enregistrées avant les matchs de demain.",
      de: "Über / Unter 2,5 Tore Prognosen für morgen. Detaillierte Torerwartungen und erfasste Quoten vor den morgigen Partien.",
      it: "Pronostici over / under 2.5 gol per domani. Aspettative di gol dettagliate e quote registrate prima delle gare di domani.",
      pt: "Palpites de mais / menos 2.5 gols para amanhã. Expectativas de gols detalhadas e cotações registradas antes dos jogos de amanhã.",
    },
  },
  "total-1-5": {
    today: {
      en: "Over / Under 1.5 goals football predictions for today. Baseline goal expectations, team scoring continuity, and verified odds across fixtures.",
      es: "Pronósticos de más / menos 1.5 goles para hoy. Expectativas de gol base, continuidad anotadora y cuotas verificadas para hoy.",
      fr: "Pronostics plus / moins 1,5 but pour aujourd’hui. Seuils de buts de base, constance offensive des équipes et cotes vérifiées du jour.",
      de: "Über / Unter 1,5 Tore Fußballprognosen für heute. Grundlegende Torerwartungen, Trefferserien und verifizierte Quoten von heute.",
      it: "Pronostici over / under 1.5 gol per oggi. Aspettative di gol di base, continuità offensiva e quote verificate per le gare di oggi.",
      pt: "Palpites de mais / menos 1.5 gols para hoje. Expectativas básicas de gols, regularidade ofensiva e cotações verificadas de hoje.",
    },
    tomorrow: {
      en: "Over / Under 1.5 goals predictions for tomorrow. Compare early goal thresholds and recorded odds before tomorrow's fixtures kick off.",
      es: "Pronósticos de más / menos 1.5 goles para mañana. Compara umbrales de gol anticipados y cuotas registradas antes del inicio.",
      fr: "Pronostics plus / moins 1,5 but pour demain. Comparez les seuils de buts anticipés et les cotes enregistrées avant les matchs de demain.",
      de: "Über / Unter 1,5 Tore Prognosen für morgen. Vergleiche vorzeitige Torschwellen und erfasste Quoten vor den morgigen Spielen.",
      it: "Pronostici over / under 1.5 gol per domani. Confronta in anticipo le soglie di gol e le quote registrate prima delle gare di domani.",
      pt: "Palpites de mais / menos 1.5 gols para amanhã. Compare linhas iniciais de gols e cotações registradas antes do início dos jogos.",
    },
  },
  "match-result": {
    today: {
      en: "Match result (1X2) football predictions for today. Algorithmic home win, draw, and away win probabilities with recorded provider odds.",
      es: "Pronósticos de resultado del partido (1X2) para hoy. Probabilidades algorítmicas de victoria local, empate y victoria visitante con cuotas registradas.",
      fr: "Pronostics résultat du match (1X2) pour aujourd’hui. Probabilités statistiques de victoire à domicile, nul et victoire à l'extérieur avec cotes enregistrées.",
      de: "Spielergebnis (1X2) Prognosen für heute. Algorithmische Heimsieg-, Remis- und Auswärtssieg-Wahrscheinlichkeiten mit erfassten Quoten.",
      it: "Pronostici risultato finale (1X2) per oggi. Probabilità algoritmiche di vittoria interna, pareggio e vittoria esterna con quote registrate.",
      pt: "Palpites de resultado da partida (1X2) para hoje. Probabilidades algorítmicas de vitória do mandante, empate e vitória do visitante com cotações.",
    },
    tomorrow: {
      en: "Match result (1X2) football predictions for tomorrow. Detailed win/draw probabilities and recorded odds ahead of tomorrow's matchday.",
      es: "Pronósticos de resultado del partido (1X2) para mañana. Probabilidades de victoria y empate con cuotas registradas antes de la jornada.",
      fr: "Pronostics résultat du match (1X2) pour demain. Probabilités détaillées de victoire et de nul avec cotes enregistrées avant la journée de demain.",
      de: "Spielergebnis (1X2) Prognosen für morgen. Detaillierte Sieg- und Remis-Wahrscheinlichkeiten mit erfassten Quoten für den morgigen Spieltag.",
      it: "Pronostici risultato finale (1X2) per domani. Probabilità di vittoria e pareggio con quote registrate prima delle gare di domani.",
      pt: "Palpites de resultado da partida (1X2) para amanhã. Probabilidades detalhadas de vitória e empate com cotações antes da rodada de amanhã.",
    },
  },
  "halftime-result": {
    today: {
      en: "Half-time result football predictions for today. Model probabilities for first-half home win, draw, and away win outcomes with recorded odds.",
      es: "Pronósticos de resultado al descanso para hoy. Probabilidades de victoria local, empate y visitante en la primera mitad con cuotas registradas.",
      fr: "Pronostics résultat à la mi-temps pour aujourd’hui. Probabilités de victoire à domicile, nul et victoire extérieure en première période.",
      de: "Halbzeitergebnis Prognosen für heute. Modellwahrscheinlichkeiten für Heimsieg, Unentschieden und Auswärtssieg zur Pause mit Quoten.",
      it: "Pronostici risultato primo tempo per oggi. Probabilità del modello per vittoria interna, pareggio ed esterna al 45' con quote registrate.",
      pt: "Palpites de resultado ao intervalo para hoje. Probabilidades do modelo para vitória do mandante, empate e visitante no primeiro tempo.",
    },
    tomorrow: {
      en: "Half-time result predictions for tomorrow. Compare early first-half outcome probabilities and recorded odds ahead of tomorrow's matches.",
      es: "Pronósticos de resultado al descanso para mañana. Compara probabilidades de la primera mitad y cuotas registradas para mañana.",
      fr: "Pronostics résultat à la mi-temps pour demain. Comparez les probabilités de première période et cotes enregistrées pour demain.",
      de: "Halbzeitergebnis Prognosen für morgen. Vergleiche Pausenwahrscheinlichkeiten und erfasste Quoten vor den morgigen Partien.",
      it: "Pronostici risultato primo tempo per domani. Confronta le probabilità al 45' e quote registrate prima dei match di domani.",
      pt: "Palpites de resultado ao intervalo para amanhã. Compare probabilidades para o primeiro tempo e cotações antes dos jogos de amanhã.",
    },
  },
  "value-picks": {
    today: {
      en: "Football value bets for today. Algorithmic selections where calculated match probability exceeds the bookmaker's implied market price.",
      es: "Apuestas de valor de fútbol para hoy. Selecciones algorítmicas donde la probabilidad calculada supera el precio implícito de las cuotas.",
      fr: "Paris de valeur (value bets) de football pour aujourd’hui. Sélections où la probabilité estimée surpasse la cote implicite des bookmakers.",
      de: "Value Bets im Fußball für heute. Algorithmische Prognosen, bei denen die berechnete Wahrscheinlichkeit die implizite Buchmacherquote übersteigt.",
      it: "Scommesse di valore sul calcio per oggi. Selezioni algoritmiche in cui la probabilità calcolata supera la quota implicita dei bookmaker.",
      pt: "Apostas de valor de futebol para hoje. Seleções algorítmicas em que a probabilidade calculada supera a cotação implícita das casas.",
    },
    tomorrow: {
      en: "Football value bets for tomorrow. Early positive-expected-value picks identified by mathematical models before odds drift.",
      es: "Apuestas de valor de fútbol para mañana. Selecciones anticipadas de valor positivo identificadas antes de la fluctuación de cuotas.",
      fr: "Paris de valeur de football pour demain. Sélections anticipées à espérance positive identifiées avant la variation des cotes.",
      de: "Value Bets im Fußball für morgen. Frühzeitig identifizierte Prognosen mit positivem Erwartungswert vor Quotenschwankungen.",
      it: "Scommesse di valore sul calcio per domani. Selezioni a valore atteso positivo individuate prima delle variazioni di quota.",
      pt: "Apostas de valor de futebol para amanhã. Palpites de valor positivo identificados antes da movimentação das cotações.",
    },
  },
  "top-picks": {
    today: {
      en: "Top football picks for today. Highest-confidence algorithmic predictions combining probability above 50% with positive market value.",
      es: "Mejores pronósticos de fútbol para hoy. Predicciones de máxima confianza que combinan probabilidad superior al 50% con valor de mercado.",
      fr: "Meilleurs pronostics foot pour aujourd’hui. Prédictions à plus haute confiance alliant une probabilité supérieure à 50% et une valeur de marché.",
      de: "Top-Fußballtipps für heute. Prognosen mit höchster Zuverlässigkeit, Wahrscheinlichkeit über 50 % und positivem Marktwert.",
      it: "Migliori pronostici calcio per oggi. Previsioni ad alta fiducia che uniscono probabilità oltre il 50% a un favorevole valore di mercato.",
      pt: "Melhores palpites de futebol para hoje. Previsões de máxima confiança que unem probabilidade acima de 50% a valor de mercado.",
    },
    tomorrow: {
      en: "Top football picks for tomorrow. Our strongest analytical predictions for tomorrow's matchday with recorded provider odds.",
      es: "Mejores pronósticos de fútbol para mañana. Nuestras recomendaciones de mayor solidez para los partidos de mañana.",
      fr: "Meilleurs pronostics foot pour demain. Nos prédictions analytiques les plus solides pour les matchs de demain.",
      de: "Top-Fußballtipps für morgen. Unsere stärksten datengestützten Prognosen für den morgigen Spieltag mit erfassten Quoten.",
      it: "Migliori pronostici calcio per domani. I consigli più solidi dei nostri modelli per le gare di domani con quote registrate.",
      pt: "Melhores palpites de futebol para amanhã. Nossos palpites analíticos mais consistentes para as partidas de amanhã.",
    },
  },
};

export function scopedMarketDescription(
  locale: Locale,
  marketSlug: string,
  scope: MarketScope,
  fallback?: string,
): string {
  const target = SCOPED_DESCRIPTIONS[marketSlug]?.[scope]?.[locale];
  if (target) return target;
  return fallback ?? "";
}
