import type { Locale } from './config';

const labels: Record<Locale, Record<string, string>> = {
  en: { REGULAR: 'Regular', BTTS: 'GG/NG', TOTAL_2_5: 'O/U 2.5', MIXED: 'Mixed', CORRECT_SCORE: 'Correct score', ORACLE_PICK: 'Oracle Pick', DOUBLE_CHANCE: 'Double chance', TEAM_TO_SCORE: 'Team to score', TOTAL_1_5: 'O/U 1.5', TOTAL_3_5: 'O/U 3.5', GOALS_BAND: 'Goal lines', HALFTIME_RESULT: 'Half-time result', CORNERS: 'Corners 9.5', HANDICAP: 'Handicap ±1.5' },
  es: { REGULAR: 'Resultado', BTTS: 'Ambos marcan', TOTAL_2_5: 'O/U 2.5', MIXED: 'Mixto', CORRECT_SCORE: 'Marcador exacto', ORACLE_PICK: 'Oracle Pick', DOUBLE_CHANCE: 'Doble oportunidad', TEAM_TO_SCORE: 'Equipo que marca', TOTAL_1_5: 'O/U 1.5', TOTAL_3_5: 'O/U 3.5', GOALS_BAND: 'Líneas de goles', HALFTIME_RESULT: 'Resultado al descanso', CORNERS: 'Córneres 9,5', HANDICAP: 'Hándicap ±1,5' },
  fr: { REGULAR: 'Résultat', BTTS: 'Les deux marquent', TOTAL_2_5: 'O/U 2.5', MIXED: 'Mixte', CORRECT_SCORE: 'Score exact', ORACLE_PICK: 'Oracle Pick', DOUBLE_CHANCE: 'Double chance', TEAM_TO_SCORE: 'Équipe qui marque', TOTAL_1_5: 'O/U 1.5', TOTAL_3_5: 'O/U 3.5', GOALS_BAND: 'Seuils de buts', HALFTIME_RESULT: 'Résultat à la mi-temps', CORNERS: 'Corners 9,5', HANDICAP: 'Handicap ±1,5' },
  de: { REGULAR: 'Ergebnis', BTTS: 'Beide treffen', TOTAL_2_5: 'O/U 2.5', MIXED: 'Gemischt', CORRECT_SCORE: 'Genaues Ergebnis', ORACLE_PICK: 'Oracle Pick', DOUBLE_CHANCE: 'Doppelte Chance', TEAM_TO_SCORE: 'Team trifft', TOTAL_1_5: 'O/U 1.5', TOTAL_3_5: 'O/U 3.5', GOALS_BAND: 'Torlinien', HALFTIME_RESULT: 'Halbzeitergebnis', CORNERS: 'Ecken 9,5', HANDICAP: 'Handicap ±1,5' },
  it: { REGULAR: 'Risultato', BTTS: 'Entrambe a segno', TOTAL_2_5: 'O/U 2.5', MIXED: 'Misto', CORRECT_SCORE: 'Risultato esatto', ORACLE_PICK: 'Oracle Pick', DOUBLE_CHANCE: 'Doppia chance', TEAM_TO_SCORE: 'Squadra a segno', TOTAL_1_5: 'O/U 1.5', TOTAL_3_5: 'O/U 3.5', GOALS_BAND: 'Soglie gol', HALFTIME_RESULT: 'Risultato primo tempo', CORNERS: 'Corner 9,5', HANDICAP: 'Handicap ±1,5' },
  pt: { REGULAR: 'Resultado', BTTS: 'Ambos marcam', TOTAL_2_5: 'O/U 2.5', MIXED: 'Misto', CORRECT_SCORE: 'Placar exato', ORACLE_PICK: 'Oracle Pick', DOUBLE_CHANCE: 'Dupla chance', TEAM_TO_SCORE: 'Time marca', TOTAL_1_5: 'O/U 1.5', TOTAL_3_5: 'O/U 3.5', GOALS_BAND: 'Linhas de gols', HALFTIME_RESULT: 'Resultado no intervalo', CORNERS: 'Escanteios 9,5', HANDICAP: 'Handicap ±1,5' },
};
export function predictionMarketLabel(locale: Locale, market: string): string {
  return expandedLabels[locale][market] ?? labels[locale][market] ?? '';
}

const expandedLabels: Record<Locale, Record<string,string>> = {
  en: { HALFTIME_FULLTIME:'Half-time / Full-time', CARDS:'Cards', CORNERS:'Corners', HANDICAP:'Asian handicap' },
  es: { HALFTIME_FULLTIME:'Descanso / Final', CARDS:'Tarjetas', CORNERS:'Córneres', HANDICAP:'Hándicap asiático' },
  fr: { HALFTIME_FULLTIME:'Mi-temps / Fin du match', CARDS:'Cartons', CORNERS:'Corners', HANDICAP:'Handicap asiatique' },
  de: { HALFTIME_FULLTIME:'Halbzeit / Spielende', CARDS:'Karten', CORNERS:'Ecken', HANDICAP:'Asiatisches Handicap' },
  it: { HALFTIME_FULLTIME:'Primo tempo / Finale', CARDS:'Cartellini', CORNERS:'Corner', HANDICAP:'Handicap asiatico' },
  pt: { HALFTIME_FULLTIME:'Intervalo / Final', CARDS:'Cartões', CORNERS:'Escanteios', HANDICAP:'Handicap asiático' },
};
