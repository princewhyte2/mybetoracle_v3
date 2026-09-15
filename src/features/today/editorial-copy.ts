import type { Locale } from "@/i18n/config";

export interface EditorialLink {
  readonly label: string;
  readonly href: string;
}

export interface PageEditorialContent {
  readonly heading: string;
  readonly paragraphs: ReadonlyArray<string>;
  readonly relatedLinksTitle: string;
  readonly relatedLinks: ReadonlyArray<EditorialLink>;
}

export type EditorialScope = "today" | "tomorrow" | string;

export function getEditorialContent(locale: Locale, key: EditorialScope): PageEditorialContent {
  const isTomorrow = key === "tomorrow";
  const marketKey = isTomorrow || key === "today" ? null : key;

  switch (locale) {
    case "es":
      if (isTomorrow) {
        return {
          heading: "Sobre los partidos y pronósticos de mañana",
          paragraphs: [
            "Esta página reúne el programa de partidos previsto para mañana según la zona horaria de referencia (África/Lagos). Las evaluaciones analíticas del motor Oracle se calculan con antelación para que puedas revisar las probabilidades antes de la jornada.",
            "Cada partido cuenta con probabilidades de mercado, cuotas registradas y métricas de solidez. Al confirmarse las alineaciones y los datos previos, las proyecciones se ajustan sin alterar el registro histórico de la publicación.",
          ],
          relatedLinksTitle: "Exploración relacionada",
          relatedLinks: [
            { label: "Partidos de hoy", href: `/${locale}/today` },
            { label: "Mercados de predicción", href: `/${locale}/markets` },
            { label: "Explorador de rachas", href: `/${locale}/streaks` },
            { label: "Multi-Picks publicados", href: `/${locale}/multi-picks` },
          ],
        };
      }

      if (!marketKey || marketKey === "today") {
        return {
          heading: "Inteligencia futbolística y pronósticos de hoy",
          paragraphs: [
            "MyBetOracle analiza la jornada de hoy mediante modelos predictivos independientes y seguimiento estadístico de cada competición. Cada recomendación incluye una puntuación de confianza analítica y cuotas registradas con fines informativos.",
            "Para examinar un encuentro en detalle, pulsa en cualquier tarjeta de partido: accederás al historial cara a cara, rachas activas de cada equipo, estadísticas de goles y alineaciones probables. Los pronósticos se emiten antes del inicio y se resuelven de forma transparente tras el resultado oficial a tiempo completo.",
          ],
          relatedLinksTitle: "Secciones recomendadas",
          relatedLinks: [
            { label: "Partidos de mañana", href: `/${locale}/tomorrow` },
            { label: "Mercados de predicción", href: `/${locale}/markets` },
            { label: "Resultados y precisión verificada", href: `/${locale}/results` },
            { label: "Multi-Picks del día", href: `/${locale}/multi-picks` },
          ],
        };
      }

      return getMarketEditorial(locale, marketKey);

    case "fr":
      if (isTomorrow) {
        return {
          heading: "À propos des matchs et pronostics de demain",
          paragraphs: [
            "Cette page présente les rencontres prévues pour demain selon le fuseau horaire de référence (Afrique/Lagos). Les analyses du moteur Oracle sont générées à l'avance pour permettre une évaluation précoce des marchés avant le coup d'envoi.",
            "Chaque match indique les probabilités modélisées, les cotes enregistrées et les indices de confiance. Les informations sont consolidées au fil de la publication des compositions d'équipes officielles.",
          ],
          relatedLinksTitle: "Exploration associée",
          relatedLinks: [
            { label: "Matchs d'aujourd'hui", href: `/${locale}/today` },
            { label: "Marchés de pronostics", href: `/${locale}/markets` },
            { label: "Explorateur de séries", href: `/${locale}/streaks` },
            { label: "Multi-Picks publiés", href: `/${locale}/multi-picks` },
          ],
        };
      }

      if (!marketKey || marketKey === "today") {
        return {
          heading: "Analyses et pronostics football d'aujourd'hui",
          paragraphs: [
            "MyBetOracle analyse l'ensemble des matchs du jour à l'aide de modèles statistiques indépendants et de données historiques vérifiées. Chaque sélection affiche un score de confiance Oracle ainsi que des cotes enregistrées à titre informatif.",
            "Cliquez sur une rencontre pour consulter l'analyse approfondie : confrontations directes, séries en cours à domicile et à l'extérieur, statistiques de buts et compositions probables. Les pronostics sont arrêtés avant le coup d'envoi et réglés dès l'officialisation du score à la fin du temps réglementaire.",
          ],
          relatedLinksTitle: "Sections recommandées",
          relatedLinks: [
            { label: "Matchs de demain", href: `/${locale}/tomorrow` },
            { label: "Marchés de pronostics", href: `/${locale}/markets` },
            { label: "Résultats et historique vérifié", href: `/${locale}/results` },
            { label: "Multi-Picks du jour", href: `/${locale}/multi-picks` },
          ],
        };
      }

      return getMarketEditorial(locale, marketKey);

    case "de":
      if (isTomorrow) {
        return {
          heading: "Über die Spiele und Prognosen von morgen",
          paragraphs: [
            "Diese Übersicht zeigt die für morgen angesetzten Begegnungen auf Basis der Referenzzeitzone (Afrika/Lagos). Die Modellberechnungen der Oracle-Engine werden am Vortag bereitgestellt, um fundierte Vergleiche vor dem Spieltag zu ermöglichen.",
            "Zu jeder Partie werden errechnete Wahrscheinlichkeiten, dokumentierte Quoten und statistische Trendindikatoren ausgewiesen. Alle Prognosen bleiben nach Anstoß unverändert im Archiv dokumentiert.",
          ],
          relatedLinksTitle: "Weiterführende Bereiche",
          relatedLinks: [
            { label: "Heutige Spiele", href: `/${locale}/today` },
            { label: "Prognosemärkte", href: `/${locale}/markets` },
            { label: "Serien-Explorer", href: `/${locale}/streaks` },
            { label: "Veröffentlichte Multi-Picks", href: `/${locale}/multi-picks` },
          ],
        };
      }

      if (!marketKey || marketKey === "today") {
        return {
          heading: "Fußballanalysen und Prognosen von heute",
          paragraphs: [
            "MyBetOracle wertet die heutigen Spielpläne mit mathematischen Vorhersagemodellen und historischen Leistungsdaten aus. Zu jeder Empfehlung gehört ein Oracle Score sowie eine dokumentierte Quote als Referenzwert.",
            "Ein Klick auf ein Spiel öffnet die Detailanalyse mit direktem Vergleich, aktiven Teamserien für Heim- und Auswärtsspiele, Torstatistiken und voraussichtlichen Aufstellungen. Prognosen werden vor Anpfiff festgelegt und nach Bestätigung des regulären Endstands abgerechnet.",
          ],
          relatedLinksTitle: "Empfohlene Bereiche",
          relatedLinks: [
            { label: "Spiele von morgen", href: `/${locale}/tomorrow` },
            { label: "Prognosemärkte", href: `/${locale}/markets` },
            { label: "Ergebnisse und Trefferquote", href: `/${locale}/results` },
            { label: "Multi-Picks des Tages", href: `/${locale}/multi-picks` },
          ],
        };
      }

      return getMarketEditorial(locale, marketKey);

    case "it":
      if (isTomorrow) {
        return {
          heading: "Informazioni sulle partite e i pronostici di domani",
          paragraphs: [
            "Questa pagina raccoglie le partite in programma per domani secondo il fuso orario di riferimento (Africa/Lagos). Le elaborazioni del motore Oracle vengono calcolate con un giorno di anticipo per facilitare la consultazione prima dell'inizio delle gare.",
            "Ciascuna partita include probabilità stimate, quote registrate ed evidenze statistiche. L'archivio conserva la registrazione originale senza modifiche post-gara.",
          ],
          relatedLinksTitle: "Esplorazione correlata",
          relatedLinks: [
            { label: "Partite di oggi", href: `/${locale}/today` },
            { label: "Mercati di pronostico", href: `/${locale}/markets` },
            { label: "Esplora serie", href: `/${locale}/streaks` },
            { label: "Multi-Picks pubblicate", href: `/${locale}/multi-picks` },
          ],
        };
      }

      if (!marketKey || marketKey === "today") {
        return {
          heading: "Analisi e pronostici calcistici di oggi",
          paragraphs: [
            "MyBetOracle esamina le partite odierne attraverso modelli predittivi statistici e dati storici verificati. A ogni selezione è associato un punteggio di confidenza Oracle e quote rilevate a scopo documentale.",
            "Selezionando una partita è possibile consultare i precedenti diretti, le serie aperte in casa e in trasferta, le medie realizzative e le formazioni probabili. I pronostici sono pubblicati prima dell'inizio e refertati al termine del tempo regolamentare.",
          ],
          relatedLinksTitle: "Sezioni consigliate",
          relatedLinks: [
            { label: "Partite di domani", href: `/${locale}/tomorrow` },
            { label: "Mercati di pronostico", href: `/${locale}/markets` },
            { label: "Risultati e rendimento verificato", href: `/${locale}/results` },
            { label: "Multi-Picks del giorno", href: `/${locale}/multi-picks` },
          ],
        };
      }

      return getMarketEditorial(locale, marketKey);

    case "pt":
      if (isTomorrow) {
        return {
          heading: "Sobre os jogos e palpites de amanhã",
          paragraphs: [
            "Esta página apresenta as partidas agendadas para amanhã com base no fuso horário de referência (África/Lagos). As avaliações do modelo Oracle são processadas com antecedência para permitir o acompanhamento antes da abertura da rodada.",
            "Cada partida apresenta probabilidades calculadas, odds registradas e métricas de desempenho. O registro da publicação permanece inalterado para fins de transparência analítica.",
          ],
          relatedLinksTitle: "Navegação relacionada",
          relatedLinks: [
            { label: "Jogos de hoje", href: `/${locale}/today` },
            { label: "Mercados de palpites", href: `/${locale}/markets` },
            { label: "Explorador de sequências", href: `/${locale}/streaks` },
            { label: "Multi-Picks publicados", href: `/${locale}/multi-picks` },
          ],
        };
      }

      if (!marketKey || marketKey === "today") {
        return {
          heading: "Análises e palpites de futebol de hoje",
          paragraphs: [
            "O MyBetOracle processa a programação de futebol de hoje por meio de modelos preditivos e métricas históricas apuradas. Cada palpite inclui uma pontuação de confiança Oracle e odds registradas exclusivamente para fins informativos.",
            "Clique em qualquer confronto para inspecionar o histórico direto, sequências ativas como mandante e visitante, médias de gols e prováveis escalações. Os palpites são emitidos antes do apito inicial e apurados após o encerramento do tempo regulamentar.",
          ],
          relatedLinksTitle: "Seções recomendadas",
          relatedLinks: [
            { label: "Jogos de amanhã", href: `/${locale}/tomorrow` },
            { label: "Mercados de palpites", href: `/${locale}/markets` },
            { label: "Resultados e taxa de acerto", href: `/${locale}/results` },
            { label: "Multi-Picks do dia", href: `/${locale}/multi-picks` },
          ],
        };
      }

      return getMarketEditorial(locale, marketKey);

    default: // "en"
      if (isTomorrow) {
        return {
          heading: "About Tomorrow's Football Predictions & Fixtures",
          paragraphs: [
            "This view displays scheduled matches for tomorrow published a day ahead of kick-off, referenced to the Africa/Lagos product calendar. Analytical scores and market evaluations are computed in advance to enable early preparation before matchday lines move.",
            "Each scheduled match presents model-derived probabilities, recorded provider odds, and relevant historical context. Selections remain permanently documented in our archive and settle once official regulation-time scores are confirmed.",
          ],
          relatedLinksTitle: "Related exploration",
          relatedLinks: [
            { label: "Today's matches", href: `/${locale}/today` },
            { label: "Prediction markets", href: `/${locale}/markets` },
            { label: "Streak Explorer", href: `/${locale}/streaks` },
            { label: "Published Multi-Picks", href: `/${locale}/multi-picks` },
          ],
        };
      }

      if (!marketKey || marketKey === "today") {
        return {
          heading: "Today's Football Predictions & Match Intelligence",
          paragraphs: [
            "MyBetOracle provides algorithmic evaluations of today's football fixtures across covered domestic leagues and international tournaments. Each fixture highlights the strongest evaluated market alongside its recorded confidence score and reference decimal odds.",
            "To inspect any matchup, click the fixture row to review head-to-head records, verified team streaks across home and away venue scopes, probable lineups, and match-level statistics. All recommendations settle strictly against official 90-minute regulation scores.",
          ],
          relatedLinksTitle: "Recommended sections",
          relatedLinks: [
            { label: "Tomorrow's matches", href: `/${locale}/tomorrow` },
            { label: "Prediction markets", href: `/${locale}/markets` },
            { label: "Settled accuracy & results", href: `/${locale}/results` },
            { label: "Daily Multi-Picks", href: `/${locale}/multi-picks` },
          ],
        };
      }

      return getMarketEditorial(locale, marketKey);
  }
}

function getMarketEditorial(locale: Locale, marketSlug: string): PageEditorialContent {
  const commonLinks: ReadonlyArray<EditorialLink> = [
    { label: locale === "es" ? "Partidos de hoy" : locale === "fr" ? "Matchs d'aujourd'hui" : locale === "de" ? "Heutige Spiele" : locale === "it" ? "Partite di oggi" : locale === "pt" ? "Jogos de hoje" : "Today's matches", href: `/${locale}/today` },
    { label: locale === "es" ? "Todos los mercados" : locale === "fr" ? "Tous les marchés" : locale === "de" ? "Alle Märkte" : locale === "it" ? "Tutti i mercati" : locale === "pt" ? "Todos os mercados" : "All prediction markets", href: `/${locale}/markets` },
    { label: locale === "es" ? "Resultados verificados" : locale === "fr" ? "Résultats vérifiés" : locale === "de" ? "Verifizierte Ergebnisse" : locale === "it" ? "Risultati verificati" : locale === "pt" ? "Resultados apurados" : "Settled accuracy & results", href: `/${locale}/results` },
  ];

  switch (marketSlug) {
    case "match-result":
    case "regular":
      return {
        heading: getMarketTitle(locale, "match-result"),
        paragraphs: [
          getMarketText(locale, "match-result", 0),
          getMarketText(locale, "match-result", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    case "both-teams-score":
    case "btts":
      return {
        heading: getMarketTitle(locale, "both-teams-score"),
        paragraphs: [
          getMarketText(locale, "both-teams-score", 0),
          getMarketText(locale, "both-teams-score", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    case "total-2-5":
      return {
        heading: getMarketTitle(locale, "total-2-5"),
        paragraphs: [
          getMarketText(locale, "total-2-5", 0),
          getMarketText(locale, "total-2-5", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    case "total-1-5":
      return {
        heading: getMarketTitle(locale, "total-1-5"),
        paragraphs: [
          getMarketText(locale, "total-1-5", 0),
          getMarketText(locale, "total-1-5", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    case "double-chance":
      return {
        heading: getMarketTitle(locale, "double-chance"),
        paragraphs: [
          getMarketText(locale, "double-chance", 0),
          getMarketText(locale, "double-chance", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    case "halftime-result":
      return {
        heading: getMarketTitle(locale, "halftime-result"),
        paragraphs: [
          getMarketText(locale, "halftime-result", 0),
          getMarketText(locale, "halftime-result", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    case "value-picks":
      return {
        heading: getMarketTitle(locale, "value-picks"),
        paragraphs: [
          getMarketText(locale, "value-picks", 0),
          getMarketText(locale, "value-picks", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    case "top-picks":
      return {
        heading: getMarketTitle(locale, "top-picks"),
        paragraphs: [
          getMarketText(locale, "top-picks", 0),
          getMarketText(locale, "top-picks", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };

    default:
      return {
        heading: getMarketTitle(locale, marketSlug),
        paragraphs: [
          getMarketText(locale, "generic", 0),
          getMarketText(locale, "generic", 1),
        ],
        relatedLinksTitle: getRelatedTitle(locale),
        relatedLinks: commonLinks,
      };
  }
}

const MARKET_EDITORIAL_TITLES: Record<string, Record<Locale, string>> = {
  "double-chance": {
    en: "Double Chance Predictions (1X, X2, 12)",
    es: "Pronósticos de Doble Oportunidad (1X, X2, 12)",
    fr: "Pronostics Double Chance (1X, X2, 12)",
    de: "Doppelte-Chance-Prognosen (1X, X2, 12)",
    it: "Pronostici Doppia Chance (1X, X2, 12)",
    pt: "Palpites de Dupla Hipótese (1X, X2, 12)",
  },
  "match-result": {
    en: "Match Result Predictions (1X2)",
    es: "Pronósticos de Resultado del Partido (1X2)",
    fr: "Pronostics Résultat du Match (1X2)",
    de: "Prognosen zum Spielergebnis (1X2)",
    it: "Pronostici Risultato Finale (1X2)",
    pt: "Palpites de Resultado da Partida (1X2)",
  },
  "both-teams-score": {
    en: "Both Teams to Score Predictions (GG/NG)",
    es: "Pronósticos de Ambos Equipos Marcan (GG/NG)",
    fr: "Pronostics Les Deux Équipes Marquent (GG/NG)",
    de: "Prognosen für Beide Teams Treffen (GG/NG)",
    it: "Pronostici Entrambe a Segno (GG/NG)",
    pt: "Palpites de Ambos Marcam (GG/NG)",
  },
  "total-2-5": {
    en: "Over / Under 2.5 Goals Predictions",
    es: "Pronósticos de Más / Menos 2.5 Goles",
    fr: "Pronostics Plus / Moins 2,5 Buts",
    de: "Über / Unter 2,5 Tore Prognosen",
    it: "Pronostici Over / Under 2.5 Gol",
    pt: "Palpites de Mais / Menos 2.5 Gols",
  },
  "total-1-5": {
    en: "Over / Under 1.5 Goals Predictions",
    es: "Pronósticos de Más / Menos 1.5 Goles",
    fr: "Pronostics Plus / Moins 1,5 But",
    de: "Über / Unter 1,5 Tore Prognosen",
    it: "Pronostici Over / Under 1.5 Gol",
    pt: "Palpites de Mais / Menos 1.5 Gols",
  },
  "halftime-result": {
    en: "Half-time Result Predictions",
    es: "Pronósticos de Resultado al Descanso",
    fr: "Pronostics Résultat à la Mi-temps",
    de: "Halbzeitergebnis Prognosen",
    it: "Pronostici Risultato Primo Tempo",
    pt: "Palpites de Resultado ao Intervalo",
  },
  "value-picks": {
    en: "Value Picks & Market Probability",
    es: "Apuestas de Valor y Probabilidad de Mercado",
    fr: "Sélections de Valeur et Probabilités de Marché",
    de: "Value Picks und Marktwahrscheinlichkeiten",
    it: "Scommesse di Valore e Probabilità di Mercato",
    pt: "Apostas de Valor e Probabilidade de Mercado",
  },
  "top-picks": {
    en: "Top Picks & High Confidence Predictions",
    es: "Mejores Pronósticos y Mayor Confianza",
    fr: "Meilleurs Pronostics et Haute Confiance",
    de: "Top-Tipps mit hoher Wahrscheinlichkeit",
    it: "Migliori Pronostici ad Alta Fiducia",
    pt: "Melhores Palpites com Alta Confiança",
  },
};

function getRelatedTitle(locale: Locale): string {
  switch (locale) {
    case "es": return "Navegación relacionada";
    case "fr": return "Exploration associée";
    case "de": return "Verwandte Bereiche";
    case "it": return "Navigazione correlata";
    case "pt": return "Navegação relacionada";
    default: return "Related navigation";
  }
}

function getMarketTitle(locale: Locale, marketSlug: string): string {
  const custom = MARKET_EDITORIAL_TITLES[marketSlug]?.[locale];
  if (custom) return custom;
  const readable = marketSlug.replaceAll("-", " ");
  switch (locale) {
    case "es": return `Pronósticos para ${readable}`;
    case "fr": return `Pronostics pour ${readable}`;
    case "de": return `Prognosen für ${readable}`;
    case "it": return `Pronostici per ${readable}`;
    case "pt": return `Palpites para ${readable}`;
    default: return `Predictions for ${readable}`;
  }
}

function getMarketText(locale: Locale, market: string, index: number): string {
  const texts: Record<string, Record<Locale, [string, string]>> = {
    "match-result": {
      en: [
        "The Match Result (1X2) market covers the three primary regulation-time outcomes: Home Win (1), Draw (X), and Away Win (2). Settlement is determined by the score at the end of 90 minutes plus official stoppage time, excluding extra time.",
        "Our engine computes independent win and draw probabilities by weighing recent team form, venue performance, and historical head-to-head records across eligible fixtures.",
      ],
      es: [
        "El mercado de Resultado del partido (1X2) abarca los tres desenlaces principales en tiempo reglamentario: Victoria local (1), Empate (X) y Victoria visitante (2). La resolución se basa en el marcador a los 90 minutos más el descuento oficial.",
        "El modelo predictivo calcula probabilidades independientes de victoria y empate considerando el estado de forma reciente, el rendimiento como local o visitante y los antecedentes directos.",
      ],
      fr: [
        "Le marché Résultat du match (1X2) couvre les trois issues du temps réglementaire : Victoire à domicile (1), Match nul (X) et Victoire à l'extérieur (2). Le règlement s'appuie sur le score officiel à la fin des 90 minutes et du temps additionnel.",
        "Notre algorithme calcule des probabilités distinctes pour chaque issue en intégrant la forme récente, l'avantage du terrain et l'historique des confrontations directes.",
      ],
      de: [
        "Der Markt Spielergebnis (1X2) umfasst Heimsieg (1), Unentschieden (X) und Auswärtssieg (2) nach der regulären Spielzeit von 90 Minuten inklusive Nachspielzeit. Eine Verlängerung wird nicht berücksichtigt.",
        "Die Engine ermittelt eigenständige Ergebniswahrscheinlichkeiten auf Basis aktueller Formdaten, Heim- und Auswärtsbilanzen sowie historischer direkter Duelle.",
      ],
      it: [
        "Il mercato Risultato finale (1X2) copre le tre opzioni regolamentari: Vittoria interna (1), Pareggio (X) e Vittoria esterna (2). Il referto si basa sul risultato al termine dei 90 minuti più eventuale recupero.",
        "Il nostro modello calcola probabilità indipendenti per ciascun esito ponderando lo stato di forma recente, il rendimento sul campo e i precedenti storici tra le squadre.",
      ],
      pt: [
        "O mercado Resultado da partida (1X2) contempla os três desfechos no tempo regulamentar: Vitória do mandante (1), Empate (X) e Vitória do visitante (2). A apuração considera o placar ao fim dos 90 minutos acrescidos dos acréscimos oficiais.",
        "Nosso motor calcula probabilidades independentes avaliando o momento das equipes, o mando de campo e o retrospecto dos confrontos diretos.",
      ],
    },
    "both-teams-score": {
      en: [
        "Both Teams to Score (GG/NG) assesses whether both clubs will score at least one goal during regulation play (Yes) or if at least one side will keep a clean sheet (No). Own goals count toward the opposing team's total.",
        "Evaluation relies on attacking output continuity, defensive concession patterns, and verified scoring streaks across previous competitive fixtures.",
      ],
      es: [
        "Ambos marcan (GG/NG) evalúa si los dos equipos anotarán al menos un gol durante el tiempo reglamentario (Sí) o si al menos uno mantendrá su portería a cero (No).",
        "La proyección se fundamenta en la frecuencia goleadora reciente, los patrones de goles encajados y las rachas históricas verificadas de cada club.",
      ],
      fr: [
        "Le marché Les deux marquent (GG/NG) détermine si les deux équipes marqueront au moins un but dans le temps réglementaire (Oui) ou si l'une d'elles gardera sa cage inviolée (Non).",
        "L'estimation repose sur la régularité offensive, les faiblesses défensives observées et les séries statistiques enregistrées sur les matchs précédents.",
      ],
      de: [
        "Der Markt Beide treffen (GG/NG) prognostiziert, ob beide Mannschaften mindestens ein reguläres Tor erzielen (Ja) oder mindestens ein Team ohne Torerfolg bleibt (Nein).",
        "Die Berechnung basiert auf der offensiven Taktung, Defensivstatistiken und verifizierten Torserien der beteiligten Mannschaften.",
      ],
      it: [
        "Il mercato Entrambe a segno (GG/NG) valuta se entrambe le squadre segneranno almeno una rete entro i tempi regolamentari (Sì) o se almeno una manterrà la porta inviolata (No).",
        "La stima considera l'efficacia offensiva continuativa, i gol subiti e le serie statistiche verificate negli incontri recenti.",
      ],
      pt: [
        "Ambos marcam (GG/NG) analisa se as duas equipes farão ao menos um gol no tempo normal (Sim) ou se pelo menos uma passará em branco (Não).",
        "A avaliação considera a constância ofensiva, a vulnerabilidade defensiva e as sequências de gols verificadas nas rodadas anteriores.",
      ],
    },
    "total-2-5": {
      en: [
        "The Over / Under 2.5 Goals market partitions full-time goal totals: Over 2.5 requires three or more combined goals, while Under 2.5 requires two or fewer goals during 90 minutes of regulation play.",
        "Projections combine expected goal rates, pace metrics, and defensive stability indicators to estimate likelihood without relying on speculative narration.",
      ],
      es: [
        "El mercado Más / Menos 2.5 goles divide el total de goles anotados: Más de 2.5 exige tres o más goles combinados; Menos de 2.5 se cumple con dos o menos goles en 90 minutos.",
        "El cálculo integra ritmos de juego, medias de ocasiones creadas y consistencia defensiva para fundamentar cada pronóstico.",
      ],
      fr: [
        "Le seuil Plus / Moins 2,5 buts sépare le nombre total de buts inscrits : Plus de 2,5 requiert 3 buts ou plus ; Moins de 2,5 valide un total de 2 buts ou moins sur 90 minutes.",
        "Les prévisions croisent l'efficacité offensive attendue, le tempo moyen des matchs et la solidité défensive observée.",
      ],
      de: [
        "Die Torlinie Über / Unter 2,5 Tore trennt die Gesamttore beider Teams: Über 2,5 verlangt mindestens 3 Tore; Unter 2,5 ist bei maximal 2 Toren erfüllt.",
        "Die Modellierung kombiniert durchschnittliche Trefferquoten, Spieltempo und defensive Stabilitätswerte ohne spekulative Annahmen.",
      ],
      it: [
        "La soglia Under / Over 2.5 gol divide il totale reti dell'incontro: Over 2.5 richiede tre o più reti complessive; Under 2.5 è soddisfatto con due o meno reti al 90'.",
        "I modelli integrano volumi realizzativi attesi, ritmo di gioco e solidità difensiva per stimare la distribuzione più probabile.",
      ],
      pt: [
        "A linha Mais / Menos 2.5 gols divide a contagem total de gols: Mais de 2.5 exige três ou mais gols no confronto; Menos de 2.5 se confirma com dois ou menos gols no tempo normal.",
        "O modelo cruza médias de finalizações, ritmo de jogo e consistência defensiva para projetar a probabilidade do mercado.",
      ],
    },
    "total-1-5": {
      en: [
        "Over / Under 1.5 Goals provides a lower goal-line baseline. Over 1.5 settles as won with two or more total goals, while Under 1.5 requires a 0-0 or 1-0/0-1 scoreline at the end of regulation.",
        "This market is frequently examined for matches with strong attacking baselines or defensive setups with low variance.",
      ],
      es: [
        "Más / Menos 1.5 goles ofrece una línea de referencia más baja: Más de 1.5 requiere dos o más goles en el partido; Menos de 1.5 solo se cumple con marcadores 0-0 o 1-0/0-1.",
        "Este mercado se utiliza para evaluar encuentros con alta probabilidad ofensiva o estilos de juego de escasa variabilidad.",
      ],
      fr: [
        "Le seuil Plus / Moins 1,5 buts propose une ligne de référence accessible : Plus de 1,5 nécessite 2 buts ou plus ; Moins de 1,5 exige un score de 0-0 ou 1-0/0-1 au coup de sifflet final.",
        "Ce seuil sert couramment à identifier les confrontations à haut potentiel offensif ou à forte rigueur défensive.",
      ],
      de: [
        "Die Linie Über / Unter 1,5 Tore setzt eine niedrigere Torschwelle: Über 1,5 erfordert mindestens 2 Tore; Unter 1,5 wird nur bei 0:0 oder 1:0/0:1 abgerechnet.",
        "Dieser Markt eignet sich zur systematischen Analyse von Spielen mit hoher Grundwahrscheinlichkeit für Tore.",
      ],
      it: [
        "La soglia Under / Over 1.5 gol offre un riferimento di base: Over 1.5 richiede due o più reti; Under 1.5 necessita di un punteggio finale di 0-0 o 1-0/0-1.",
        "È impiegato per esaminare partite con elevata regolarità realizzativa o configurazioni tattiche a bassa varianza.",
      ],
      pt: [
        "A linha Mais / Menos 1.5 gols estabelece um patamar inicial: Mais de 1.5 requer dois ou mais gols; Menos de 1.5 se cumpre com placares de 0x0 ou 1x0/0x1 no tempo regulamentar.",
        "Esse mercado é analisado para identificar confrontos com consistência ofensiva expressiva ou defesas de baixa oscilação.",
      ],
    },
    "double-chance": {
      en: [
        "Double Chance allows covering two of the three possible full-time match outcomes (1X: Home or Draw; X2: Away or Draw; 12: Home or Away) within a single selection.",
        "Our models recommend Double Chance when draw likelihood is prominent or when underdog strength indicates a resilient competitive profile.",
      ],
      es: [
        "La Doble oportunidad permite cubrir dos de los tres resultados posibles en tiempo reglamentario (1X: Local o Empate; X2: Visitante o Empate; 12: Local o Visitante).",
        "El motor selecciona esta opción cuando el riesgo de empate es significativo o cuando el equipo visitante muestra solidez competitiva.",
      ],
      fr: [
        "La Double chance couvre deux des trois dénouements possibles (1X : Domicile ou Nul ; X2 : Extérieur ou Nul ; 12 : Domicile ou Extérieur) en une seule sélection.",
        "Le modèle préconise ce marché lorsque le risque de match nul est marqué ou lorsque l'équipe outsider présente une résilience avérée.",
      ],
      de: [
        "Die Doppelte Chance deckt zwei von drei Spielausgängen ab (1X: Heimsieg oder Remis; X2: Auswärtssieg oder Remis; 12: Heimsieg oder Auswärtssieg).",
        "Diese Option wird herangezogen, wenn das Remis-Risiko substanziell ist oder ein Außenseiter defensive Stabilität aufweist.",
      ],
      it: [
        "La Doppia chance consente di coprire due dei tre esiti finali regolamentari (1X: Casa o Pareggio; X2: Trasferta o Pareggio; 12: Casa o Trasferta).",
        "I modelli evidenziano questa soluzione quando il rischio di pareggio è consistente o quando la squadra sfavorita dimostra solidità.",
      ],
      pt: [
        "A Dupla chance permite cobrir dois dos três desfechos do tempo regulamentar (1X: Mandante ou Empate; X2: Visitante ou Empate; 12: Mandante ou Visitante).",
        "O sistema seleciona este mercado quando a probabilidade de empate é relevante ou quando o visitante demonstra competitividade sólida.",
      ],
    },
    "halftime-result": {
      en: [
        "Half-time Result predicts the match score standing strictly at the end of the first 45 minutes plus added stoppage time. Second-half goals do not influence settlement.",
        "Evaluations emphasize early-match scoring profiles, first-half goal concessions, and first-half defensive discipline.",
      ],
      es: [
        "El Resultado al descanso pronostica el marcador al término de los primeros 45 minutos más el descuento inicial. Los goles de la segunda parte no afectan a este mercado.",
        "El análisis prioriza el comportamiento en las primeras partes, los goles encajados antes del descanso y el orden táctico inicial.",
      ],
      fr: [
        "Le marché Résultat à la mi-temps porte exclusivement sur le score au terme des 45 premières minutes et des arrêts de jeu de la première période.",
        "L'évaluation met l'accent sur les profils de jeu en première mi-temps, la précocité des buts et l'organisation tactique initiale.",
      ],
      de: [
        "Das Halbzeitergebnis betrachtet ausschließlich den Spielstand nach den ersten 45 Minuten plus Nachspielzeit. Tore der zweiten Halbzeit spielen keine Rolle.",
        "Die Analyse bewertet Anlaufphasen, frühe Torhäufigkeiten und die defensive Disziplin beider Teams vor dem Pausenpfiff.",
      ],
      it: [
        "Il Risultato primo tempo pronostica l'esito al termine dei primi 45 minuti più recupero. Gli sviluppi della ripresa non influiscono sulla refertazione.",
        "Le valutazioni evidenziano i comportamenti tattici iniziali, la frequenza di reti precoci e la tenuta difensiva prima dell'intervallo.",
      ],
      pt: [
        "O Resultado no intervalo analisa o placar estritamente ao final dos primeiros 45 minutos mais acréscimos. Gols do segundo tempo não afetam este mercado.",
        "A avaliação destaca o padrão de jogo no primeiro tempo, a incidência de gols precoces e o comportamento defensivo inicial.",
      ],
    },
    "value-picks": {
      en: [
        "Value Picks identify fixtures where the model-estimated analytical probability exceeds the probability implied by recorded bookmaker odds, indicating a positive mathematical edge.",
        "Odds are captured from verified providers at snapshot timestamps. Value selections reflect mathematical expectancy, not guaranteed outcomes.",
      ],
      es: [
        "Las selecciones de Valor identifican partidos donde la probabilidad analítica estimada supera a la probabilidad implícita en las cuotas registradas, indicando una ventaja matemática positiva.",
        "Las cuotas proceden de proveedores oficiales en momentos de captura concretos. Las selecciones de valor expresan expectativa matemática, no resultados seguros.",
      ],
      fr: [
        "Les sélections Valeur repèrent les matchs où la probabilité calculée par le modèle surpasse la probabilité implicite des cotes enregistrées, signalant un avantage mathématique positif.",
        "Les cotes proviennent de flux vérifiés à des horodatages précis. Une sélection de valeur exprime une espérance mathématique, non une certitude.",
      ],
      de: [
        "Value-Picks heben Partien hervor, bei denen die modellierte Wahrscheinlichkeit über der durch dokumentierte Quoten implizierten Wahrscheinlichkeit liegt und ein mathematischer Vorteil entsteht.",
        "Quoten stammen von verifizierten Anbietern zu festen Erfassungszeitpunkten. Value-Tipps beschreiben eine mathematische Erwartung, keine Ergebnisgarantien.",
      ],
      it: [
        "Le selezioni Valore individuano gli incontri in cui la probabilità stimata dal modello supera la probabilità implicita nelle quote registrate, evidenziando un vantaggio matematico positivo.",
        "Le quote provengono da fornitori verificati a precisi orari di rilevamento. Il valore riflette un'aspettativa matematica, mai un esito garantito.",
      ],
      pt: [
        "As seleções de Valor apontam partidas em que a probabilidade calculada pelo modelo supera a probabilidade implícita nas odds registradas, sinalizando vantagem matemática positiva.",
        "As odds derivam de fontes verificadas em momentos de captura definidos. As escolhas de valor representam expectativa matemática, não certeza de resultado.",
      ],
    },
    "top-picks": {
      en: [
        "Top Picks feature our highest-confidence recommendations of the day across all candidate markets, requiring rigorous probability thresholds before qualification.",
        "These selections reflect the strongest historical and statistical alignment produced by the DoubleEngine prediction framework.",
      ],
      es: [
        "Las Selecciones destacadas reúnen las recomendaciones de mayor confianza del día en todos los mercados evaluados, exigiendo umbrales de probabilidad estrictos.",
        "Reflejan la mayor convergencia estadística e histórica generada por el motor analítico de DoubleEngine.",
      ],
      fr: [
        "Les Meilleures sélections regroupent les pronostics affichant les indices de confiance les plus élevés de la journée, selon des seuils de probabilité stricts.",
        "Elles représentent l'alignement statistique le plus solide produit par le cadre prédictif de DoubleEngine.",
      ],
      de: [
        "Die Top-Auswahl bündelt die tagesweit stärksten Empfehlungen über alle bewerteten Märkte hinweg unter Einhaltung strenger Wahrscheinlichkeitsschwellen.",
        "Diese Tipps spiegeln die höchste statistische Übereinstimmung wider, die das DoubleEngine-Modell ermittelt.",
      ],
      it: [
        "Le Migliori selezioni evidenziano le raccomandazioni a più alta confidenza della giornata tra tutti i mercati, nel rispetto di rigorose soglie probabilistiche.",
        "Rappresentano la convergenza statistica e storica più consistente elaborata dal motore analitico di DoubleEngine.",
      ],
      pt: [
        "As Melhores seleções reúnem as indicações de maior nível de confiança do dia entre todos os mercados, respeitando critérios probabilísticos rigorosos.",
        "Representam o alinhamento estatístico e histórico mais consistente apurado pelo motor analítico do DoubleEngine.",
      ],
    },
    "generic": {
      en: [
        "This view presents algorithmic evaluations for the selected market, calculated against full regulation-time match parameters.",
        "Inspect individual fixture rows to evaluate team streak histories, head-to-head records, and published confidence ratings.",
      ],
      es: [
        "Esta vista presenta evaluaciones algorítmicas para el mercado seleccionado, calculadas sobre el tiempo reglamentario completo.",
        "Consulta cada partido para revisar las rachas de los equipos, los antecedentes directos y las puntuaciones de confianza.",
      ],
      fr: [
        "Cette vue présente les évaluations de notre modèle pour le marché sélectionné, calculées sur la durée du temps réglementaire.",
        "Consultez chaque rencontre pour inspecter les séries en cours, les confrontations directes et les indices de confiance.",
      ],
      de: [
        "Diese Ansicht stellt Modellbewertungen für den gewählten Markt auf Basis der regulären 90-minütigen Spielzeit bereit.",
        "Öffne einzelne Begegnungen, um Serientrends, den direkten Vergleich und die jeweiligen Konfidenzwerte zu prüfen.",
      ],
      it: [
        "Questa schermata mostra le valutazioni algoritmiche per il mercato selezionato, calcolate sui tempi regolamentari dell'incontro.",
        "Apri le singole partite per esaminare le serie delle squadre, i precedenti storici e i livelli di confidenza attribuiti.",
      ],
      pt: [
        "Esta tela apresenta as avaliações do modelo para o mercado selecionado, calculadas sobre o tempo regulamentar do jogo.",
        "Consulte cada partida para analisar as sequências dos times, o retrospecto direto e os índices de confiança atribuídos.",
      ],
    },
  };

  const selected = texts[market] ?? texts["generic"];
  return selected[locale][index];
}
