import type { Locale } from "@/i18n/config";

export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

export interface FooterGroup {
  readonly title: string;
  readonly links: ReadonlyArray<FooterLink>;
}

export interface FooterContent {
  readonly groups: ReadonlyArray<FooterGroup>;
  readonly disclaimer: string;
  readonly copyright: string;
  readonly languageLabel: string;
  readonly backToTop: string;
}

export const VERIFIED_FOOTER_COMPETITIONS = [
  { id: "c8b97cc2-2122-4bcc-a7ab-65274a75d00b", name: "Premier League", slug: "premier-league--yLl8wiEiS8ynq2UnSnXQCw" },
  { id: "92436c91-cf2d-47b6-a133-7c660d6e261a", name: "La Liga", slug: "la-liga--kkNskc8tR7ahM3xmDW4mGg" },
  { id: "390f0f1b-6dc0-4d50-8b4e-87696813bb99", name: "Serie A", slug: "serie-a--OQ8PG23ATVCLTodpaBO7mQ" },
  { id: "1cfc4ef3-0c92-41b4-99c0-0a1fc7cf789f", name: "Bundesliga", slug: "bundesliga--HPxO8wySQbSZwAofx894nw" },
  { id: "f6899004-373f-4eb6-8769-9f6193e35167", name: "Ligue 1", slug: "ligue-1--9omQBDc_TraHaZ9hk-NRZw" },
  { id: "365e4ab3-a9b9-4271-8507-1aa4d985957b", name: "UEFA Champions League", slug: "uefa-champions-league--Nl5Ks6m5QnGFBxqk2YWVew" },
] as const;

export function getFooterContent(locale: Locale): FooterContent {
  switch (locale) {
    case "es":
      return {
        groups: [
          {
            title: "Productos",
            links: [
              { label: "Hoy", href: `/${locale}/today` },
              { label: "Mañana", href: `/${locale}/tomorrow` },
              { label: "Explorar", href: `/${locale}/explore` },
              { label: "Rachas", href: `/${locale}/streaks` },
              { label: "Multi-Picks", href: `/${locale}/multi-picks` },
              { label: "Resultados", href: `/${locale}/results` },
              { label: "Oracle Daily", href: `/${locale}/betslip` },
            ],
          },
          {
            title: "Mercados de predicción",
            links: [
              { label: "Resultado del partido (1X2)", href: `/${locale}/today/match-result` },
              { label: "Ambos marcan (GG/NG)", href: `/${locale}/today/both-teams-score` },
              { label: "Más / Menos 2.5 goles", href: `/${locale}/today/total-2-5` },
              { label: "Más / Menos 1.5 goles", href: `/${locale}/today/total-1-5` },
              { label: "Doble oportunidad", href: `/${locale}/today/double-chance` },
              { label: "Resultado al descanso", href: `/${locale}/today/halftime-result` },
              { label: "Todos los mercados", href: `/${locale}/markets` },
            ],
          },
          {
            title: "Competiciones seleccionadas",
            links: [
              ...VERIFIED_FOOTER_COMPETITIONS.map((c) => ({
                label: c.name,
                href: `/${locale}/competitions/${c.slug}`,
              })),
              { label: "Todas las competiciones", href: `/${locale}/competitions` },
              { label: "Todos los países", href: `/${locale}/countries` },
            ],
          },
          {
            title: "Ayuda y políticas",
            links: [
              { label: "Juego responsable", href: `/${locale}/responsible-play` },
              { label: "Términos de servicio", href: `/${locale}/terms` },
              { label: "Política de privacidad", href: `/${locale}/privacy` },
              { label: "Ayuda y soporte", href: `/${locale}/support` },
            ],
          },
        ],
        disclaimer: "MyBetOracle proporciona inteligencia futbolística algorítmica y evidencia analítica registrada. Las cuotas son evidencia registrada con fines informativos; en esta plataforma no se realizan apuestas ni transacciones de juego.",
        copyright: "© 2026 MyBetOracle. Todos los derechos reservados.",
        languageLabel: "Idioma",
        backToTop: "Volver arriba",
      };

    case "fr":
      return {
        groups: [
          {
            title: "Produits",
            links: [
              { label: "Aujourd'hui", href: `/${locale}/today` },
              { label: "Demain", href: `/${locale}/tomorrow` },
              { label: "Explorer", href: `/${locale}/explore` },
              { label: "Séries", href: `/${locale}/streaks` },
              { label: "Multi-Picks", href: `/${locale}/multi-picks` },
              { label: "Résultats", href: `/${locale}/results` },
              { label: "Oracle Daily", href: `/${locale}/betslip` },
            ],
          },
          {
            title: "Marchés de pronostics",
            links: [
              { label: "Résultat du match (1X2)", href: `/${locale}/today/match-result` },
              { label: "Les deux marquent (GG/NG)", href: `/${locale}/today/both-teams-score` },
              { label: "Plus / Moins 2,5 buts", href: `/${locale}/today/total-2-5` },
              { label: "Plus / Moins 1,5 buts", href: `/${locale}/today/total-1-5` },
              { label: "Double chance", href: `/${locale}/today/double-chance` },
              { label: "Résultat à la mi-temps", href: `/${locale}/today/halftime-result` },
              { label: "Tous les marchés", href: `/${locale}/markets` },
            ],
          },
          {
            title: "Compétitions sélectionnées",
            links: [
              ...VERIFIED_FOOTER_COMPETITIONS.map((c) => ({
                label: c.name,
                href: `/${locale}/competitions/${c.slug}`,
              })),
              { label: "Toutes les compétitions", href: `/${locale}/competitions` },
              { label: "Tous les pays", href: `/${locale}/countries` },
            ],
          },
          {
            title: "Aide et politiques",
            links: [
              { label: "Jeu responsable", href: `/${locale}/responsible-play` },
              { label: "Conditions d'utilisation", href: `/${locale}/terms` },
              { label: "Politique de confidentialité", href: `/${locale}/privacy` },
              { label: "Aide et support", href: `/${locale}/support` },
            ],
          },
        ],
        disclaimer: "MyBetOracle fournit une analyse algorithmique du football et des données analytiques vérifiées. Les cotes constituent des données enregistrées à des fins d'information ; aucun pari ni transaction de jeu n'est effectué sur cette plateforme.",
        copyright: "© 2026 MyBetOracle. Tous droits réservés.",
        languageLabel: "Langue",
        backToTop: "Retour en haut",
      };

    case "de":
      return {
        groups: [
          {
            title: "Produkte",
            links: [
              { label: "Heute", href: `/${locale}/today` },
              { label: "Morgen", href: `/${locale}/tomorrow` },
              { label: "Entdecken", href: `/${locale}/explore` },
              { label: "Serien", href: `/${locale}/streaks` },
              { label: "Multi-Picks", href: `/${locale}/multi-picks` },
              { label: "Ergebnisse", href: `/${locale}/results` },
              { label: "Oracle Daily", href: `/${locale}/betslip` },
            ],
          },
          {
            title: "Prognosemärkte",
            links: [
              { label: "Spielergebnis (1X2)", href: `/${locale}/today/match-result` },
              { label: "Beide treffen (GG/NG)", href: `/${locale}/today/both-teams-score` },
              { label: "Über / Unter 2,5 Tore", href: `/${locale}/today/total-2-5` },
              { label: "Über / Unter 1,5 Tore", href: `/${locale}/today/total-1-5` },
              { label: "Doppelte Chance", href: `/${locale}/today/double-chance` },
              { label: "Halbzeitergebnis", href: `/${locale}/today/halftime-result` },
              { label: "Alle Prognosemärkte", href: `/${locale}/markets` },
            ],
          },
          {
            title: "Ausgewählte Wettbewerbe",
            links: [
              ...VERIFIED_FOOTER_COMPETITIONS.map((c) => ({
                label: c.name,
                href: `/${locale}/competitions/${c.slug}`,
              })),
              { label: "Alle Wettbewerbe", href: `/${locale}/competitions` },
              { label: "Alle Länder", href: `/${locale}/countries` },
            ],
          },
          {
            title: "Hilfe und Richtlinien",
            links: [
              { label: "Verantwortungsvolles Spielen", href: `/${locale}/responsible-play` },
              { label: "Nutzungsbedingungen", href: `/${locale}/terms` },
              { label: "Datenschutzrichtlinie", href: `/${locale}/privacy` },
              { label: "Hilfe und Support", href: `/${locale}/support` },
            ],
          },
        ],
        disclaimer: "MyBetOracle bietet algorithmische Fußballanalysen und verifizierte statistische Daten. Quoten dienen ausschließlich als dokumentierte Informationsgrundlage; auf dieser Plattform finden keine Wetten oder Glücksspieltransaktionen statt.",
        copyright: "© 2026 MyBetOracle. Alle Rechte vorbehalten.",
        languageLabel: "Sprache",
        backToTop: "Nach oben",
      };

    case "it":
      return {
        groups: [
          {
            title: "Prodotti",
            links: [
              { label: "Oggi", href: `/${locale}/today` },
              { label: "Domani", href: `/${locale}/tomorrow` },
              { label: "Esplora", href: `/${locale}/explore` },
              { label: "Serie", href: `/${locale}/streaks` },
              { label: "Multi-Picks", href: `/${locale}/multi-picks` },
              { label: "Risultati", href: `/${locale}/results` },
              { label: "Oracle Daily", href: `/${locale}/betslip` },
            ],
          },
          {
            title: "Mercati di pronostico",
            links: [
              { label: "Risultato finale (1X2)", href: `/${locale}/today/match-result` },
              { label: "Entrambe a segno (GG/NG)", href: `/${locale}/today/both-teams-score` },
              { label: "Under / Over 2.5 gol", href: `/${locale}/today/total-2-5` },
              { label: "Under / Over 1.5 gol", href: `/${locale}/today/total-1-5` },
              { label: "Doppia chance", href: `/${locale}/today/double-chance` },
              { label: "Risultato primo tempo", href: `/${locale}/today/halftime-result` },
              { label: "Tutti i mercati", href: `/${locale}/markets` },
            ],
          },
          {
            title: "Competizioni selezionate",
            links: [
              ...VERIFIED_FOOTER_COMPETITIONS.map((c) => ({
                label: c.name,
                href: `/${locale}/competitions/${c.slug}`,
              })),
              { label: "Tutte le competizioni", href: `/${locale}/competitions` },
              { label: "Tutti i paesi", href: `/${locale}/countries` },
            ],
          },
          {
            title: "Assistenza e note legali",
            links: [
              { label: "Gioco responsabile", href: `/${locale}/responsible-play` },
              { label: "Termini di servizio", href: `/${locale}/terms` },
              { label: "Informativa sulla privacy", href: `/${locale}/privacy` },
              { label: "Assistenza", href: `/${locale}/support` },
            ],
          },
        ],
        disclaimer: "MyBetOracle fornisce analisi calcistica algoritmica ed evidenze analitiche registrate. Le quote rappresentano dati registrati a scopo informativo; su questa piattaforma non si effettuano scommesse o transazioni di gioco.",
        copyright: "© 2026 MyBetOracle. Tutti i diritti riservati.",
        languageLabel: "Lingua",
        backToTop: "Torna su",
      };

    case "pt":
      return {
        groups: [
          {
            title: "Produtos",
            links: [
              { label: "Hoje", href: `/${locale}/today` },
              { label: "Amanhã", href: `/${locale}/tomorrow` },
              { label: "Explorar", href: `/${locale}/explore` },
              { label: "Sequências", href: `/${locale}/streaks` },
              { label: "Multi-Picks", href: `/${locale}/multi-picks` },
              { label: "Resultados", href: `/${locale}/results` },
              { label: "Oracle Daily", href: `/${locale}/betslip` },
            ],
          },
          {
            title: "Mercados de palpites",
            links: [
              { label: "Resultado da partida (1X2)", href: `/${locale}/today/match-result` },
              { label: "Ambos marcam (GG/NG)", href: `/${locale}/today/both-teams-score` },
              { label: "Mais / Menos 2.5 gols", href: `/${locale}/today/total-2-5` },
              { label: "Mais / Menos 1.5 gols", href: `/${locale}/today/total-1-5` },
              { label: "Dupla chance", href: `/${locale}/today/double-chance` },
              { label: "Resultado no intervalo", href: `/${locale}/today/halftime-result` },
              { label: "Todos os mercados", href: `/${locale}/markets` },
            ],
          },
          {
            title: "Competições selecionadas",
            links: [
              ...VERIFIED_FOOTER_COMPETITIONS.map((c) => ({
                label: c.name,
                href: `/${locale}/competitions/${c.slug}`,
              })),
              { label: "Todas as competições", href: `/${locale}/competitions` },
              { label: "Todos os países", href: `/${locale}/countries` },
            ],
          },
          {
            title: "Ajuda e políticas",
            links: [
              { label: "Jogo responsável", href: `/${locale}/responsible-play` },
              { label: "Termos de serviço", href: `/${locale}/terms` },
              { label: "Política de privacidade", href: `/${locale}/privacy` },
              { label: "Ajuda e suporte", href: `/${locale}/support` },
            ],
          },
        ],
        disclaimer: "O MyBetOracle fornece inteligência algorítmica de futebol e evidências analíticas registradas. As odds constituem dados registrados para fins informativos; não são realizadas apostas nem transações de jogo nesta plataforma.",
        copyright: "© 2026 MyBetOracle. Todos os direitos reservados.",
        languageLabel: "Idioma",
        backToTop: "Voltar ao topo",
      };

    default: // "en"
      return {
        groups: [
          {
            title: "Products",
            links: [
              { label: "Today", href: `/${locale}/today` },
              { label: "Tomorrow", href: `/${locale}/tomorrow` },
              { label: "Explore", href: `/${locale}/explore` },
              { label: "Streaks", href: `/${locale}/streaks` },
              { label: "Multi-Picks", href: `/${locale}/multi-picks` },
              { label: "Results", href: `/${locale}/results` },
              { label: "Oracle Daily", href: `/${locale}/betslip` },
            ],
          },
          {
            title: "Prediction Markets",
            links: [
              { label: "Match Result (1X2)", href: `/${locale}/today/match-result` },
              { label: "Both Teams to Score", href: `/${locale}/today/both-teams-score` },
              { label: "Over / Under 2.5 Goals", href: `/${locale}/today/total-2-5` },
              { label: "Over / Under 1.5 Goals", href: `/${locale}/today/total-1-5` },
              { label: "Double Chance", href: `/${locale}/today/double-chance` },
              { label: "Half-time Result", href: `/${locale}/today/halftime-result` },
              { label: "All Prediction Markets", href: `/${locale}/markets` },
            ],
          },
          {
            title: "Selected Competitions",
            links: [
              ...VERIFIED_FOOTER_COMPETITIONS.map((c) => ({
                label: c.name,
                href: `/${locale}/competitions/${c.slug}`,
              })),
              { label: "All Competitions", href: `/${locale}/competitions` },
              { label: "All Countries", href: `/${locale}/countries` },
            ],
          },
          {
            title: "Help & Policies",
            links: [
              { label: "Responsible Play", href: `/${locale}/responsible-play` },
              { label: "Terms of Service", href: `/${locale}/terms` },
              { label: "Privacy Policy", href: `/${locale}/privacy` },
              { label: "Help & Support", href: `/${locale}/support` },
            ],
          },
        ],
        disclaimer: "MyBetOracle provides algorithmic football intelligence and recorded analytical evidence. Odds are recorded evidence for informational purposes; no gambling or wagering transactions occur on this platform.",
        copyright: "© 2026 MyBetOracle. All rights reserved.",
        languageLabel: "Language",
        backToTop: "Back to top",
      };
  }
}
