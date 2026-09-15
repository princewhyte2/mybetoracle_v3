import type { Locale } from "@/i18n/config";

export const valueViewLabels: Record<Locale, Record<"value" | "top", string>> = {
  en: { value: 'Value', top: 'Top Picks' }, es: { value: 'Valor', top: 'Selecciones destacadas' },
  fr: { value: 'Valeur', top: 'Meilleures sélections' }, de: { value: 'Value-Chancen', top: 'Top-Auswahl' },
  it: { value: 'Valore', top: 'Migliori selezioni' }, pt: { value: 'Valor', top: 'Melhores seleções' },
};
export function rankedViewForSlug(slug: string) { return slug === "value-picks" ? "value" : slug === "top-picks" ? "top" : null; }

// Plain data, deliberately without "server-only" -- both server components
// (discovery-service.ts, market-scope-page.tsx) and the client-rendered
// TodayExperience need this real curated market list and its slug mapping.
export const marketPresentation: Record<string, { slug: string; name: string; shortName: string }> = {
  ORACLE_PICK: { slug: "oracle-pick", name: "Oracle Pick", shortName: "Oracle Pick" },
  MIXED: { slug: "mixed", name: "Mixed Markets", shortName: "Mixed" },
  REGULAR: { slug: "match-result", name: "Match Result", shortName: "1X2" },
  DOUBLE_CHANCE: { slug: "double-chance", name: "Double Chance", shortName: "DC" },
  BTTS: { slug: "both-teams-score", name: "Both Teams to Score", shortName: "BTTS" },
  TOTAL_1_5: { slug: "total-1-5", name: "Over / Under 1.5", shortName: "O/U 1.5" },
  TOTAL_2_5: { slug: "total-2-5", name: "Over / Under 2.5", shortName: "O/U 2.5" },
  TOTAL_3_5: { slug: "total-3-5", name: "Over / Under 3.5", shortName: "O/U 3.5" },
  GOALS_BAND: { slug: "goals-band", name: "Goals Band", shortName: "Goals" },
  HALFTIME_RESULT: { slug: "halftime-result", name: "Half-time Result", shortName: "HT" },
  HALFTIME_FULLTIME: { slug: "halftime-fulltime", name: "Half-time / Full-time", shortName: "HT/FT" },
  HANDICAP: { slug: "handicap", name: "Handicap", shortName: "HCP" },
  CORRECT_SCORE: { slug: "correct-score", name: "Correct Score", shortName: "Score" },
  CORNERS: { slug: "corners", name: "Corners", shortName: "Corners" },
  CARDS: { slug: "cards", name: "Cards", shortName: "Cards" },
  TEAM_TO_SCORE: { slug: "team-to-score", name: "Team to Score", shortName: "TTS" },
};

const marketGroupBySlug = new Map(
  Object.entries(marketPresentation).map(([group, presentation]) => [presentation.slug, group]),
);

// Product categories retain their own exact filtered feed, including Mixed.
export function marketGroupForSlug(slug: string): string | null {
  return marketGroupBySlug.get(slug) ?? null;
}

export function marketSlugs(): string[] {
  return Object.values(marketPresentation)
    .map((item) => item.slug);
}
