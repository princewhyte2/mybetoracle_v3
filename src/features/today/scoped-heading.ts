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
