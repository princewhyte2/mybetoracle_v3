import type { Locale } from "@/i18n/config";
import { interpolateSystem, systemLabels } from "@/i18n/system-labels";
import type { MatchDetail } from "./types";

interface MatchSeoContent {
  rawTitle: string;
  fullTitle: string;
  description: string;
}

export function buildMatchSeo(match: MatchDetail, locale: Locale): MatchSeoContent {
  const copy = systemLabels[locale];
  const fields = { home: match.home.name, away: match.away.name };
  const hasScore = Boolean(match.score && (match.score[0] !== null || match.score[1] !== null));
  const homeScore = match.score?.[0] ?? 0;
  const awayScore = match.score?.[1] ?? 0;
  const elapsed = match.elapsedMinute !== null ? `${match.elapsedMinute}'` : match.statusCode;
  const pick = match.oracleMarket.available ? match.oracleMarket.selection : null;
  const confidence = match.oracleScore;

  if (match.status === "live" && hasScore) {
    switch (locale) {
      case "es": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (En directo ${elapsed}) | Pronóstico y Estadísticas`;
        const description = `Marcador en directo: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (${elapsed}).${pick ? ` Pronóstico Oracle: ${pick} (${confidence}/100).` : ""} Cronología en directo, rachas, estadísticas y alineaciones.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "fr": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (En direct ${elapsed}) | Pronostic et Stats`;
        const description = `Score en direct : ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (${elapsed}).${pick ? ` Pronostic Oracle : ${pick} (${confidence}/100).` : ""} Déroulement en direct, séries, statistiques et compositions.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "de": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Live ${elapsed}) | Prognose und Statistiken`;
        const description = `Live-Spielstand: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (${elapsed}).${pick ? ` Oracle-Tipp: ${pick} (${confidence}/100).` : ""} Live-Timeline, Serien, Statistiken und Aufstellungen.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "it": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Diretta ${elapsed}) | Pronostico e Statistiche`;
        const description = `Risultato in diretta: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (${elapsed}).${pick ? ` Pronostico Oracle: ${pick} (${confidence}/100).` : ""} Cronaca in tempo reale, serie, statistiche e formazioni.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "pt": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Ao vivo ${elapsed}) | Palpites e Estatísticas`;
        const description = `Placar ao vivo: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (${elapsed}).${pick ? ` Palpite Oracle: ${pick} (${confidence}/100).` : ""} Linha do tempo, sequências, estatísticas e escalações.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      default: {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Live ${elapsed}) | Predictions & Live Stats`;
        const description = `Live score: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (${elapsed}).${pick ? ` Oracle pick: ${pick} (${confidence}/100).` : ""} Real-time match timeline, verified streaks, head-to-head, and lineups.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
    }
  }

  if (match.status === "finished" && hasScore) {
    const htText = match.halfTimeScore && (match.halfTimeScore[0] !== null || match.halfTimeScore[1] !== null)
      ? `HT ${match.halfTimeScore[0]}-${match.halfTimeScore[1]}`
      : null;
    const outcomeText = match.oracleMarket.outcome ? match.oracleMarket.outcome.toUpperCase() : null;

    switch (locale) {
      case "es": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Final) | Resultado y Estadísticas`;
        const description = `Resultado final: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (Final${htText ? `, ${htText}` : ""}).${pick ? ` Pronóstico Oracle: ${pick}${outcomeText ? ` (${outcomeText})` : ""}.` : ""} Resumen, estadísticas completas y alineaciones.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "fr": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Score final) | Résultat et Stats`;
        const description = `Score final : ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (Fin${htText ? `, ${htText}` : ""}).${pick ? ` Pronostic Oracle : ${pick}${outcomeText ? ` (${outcomeText})` : ""}.` : ""} Résumé du match, statistiques complètes et compositions.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "de": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Endstand) | Ergebnis und Statistiken`;
        const description = `Endergebnis: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (Endstand${htText ? `, ${htText}` : ""}).${pick ? ` Oracle-Tipp: ${pick}${outcomeText ? ` (${outcomeText})` : ""}.` : ""} Spielbericht, Statistiken und Aufstellungen.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "it": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Finale) | Risultato e Statistiche`;
        const description = `Risultato finale: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (Finale${htText ? `, ${htText}` : ""}).${pick ? ` Pronostico Oracle: ${pick}${outcomeText ? ` (${outcomeText})` : ""}.` : ""} Cronaca finale, statistiche e formazioni.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      case "pt": {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (Fim de jogo) | Resultado e Estatísticas`;
        const description = `Resultado final: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (Final${htText ? `, ${htText}` : ""}).${pick ? ` Palpite Oracle: ${pick}${outcomeText ? ` (${outcomeText})` : ""}.` : ""} Resumo do jogo, estatísticas e escalações.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
      default: {
        const rawTitle = `${match.home.name} ${homeScore}-${awayScore} ${match.away.name} (FT) | Match Result & Stats`;
        const description = `Final score: ${match.home.name} ${homeScore} - ${awayScore} ${match.away.name} (FT${htText ? `, ${htText}` : ""}).${pick ? ` Oracle pick: ${pick}${outcomeText ? ` (${outcomeText})` : ""}.` : ""} Full match statistics, recap and lineups.`;
        return { rawTitle, fullTitle: `${rawTitle} | MyBetOracle`, description };
      }
    }
  }

  // Scheduled / Pre-match:
  const baseTitle = interpolateSystem(copy.matchTitle, fields);
  const baseDesc = interpolateSystem(copy.matchDescription, fields);
  const oracleAddon = pick ? ` Oracle pick: ${pick} (${confidence}/100).` : "";
  return {
    rawTitle: baseTitle,
    fullTitle: `${baseTitle} | MyBetOracle`,
    description: `${baseDesc}${oracleAddon}`,
  };
}
