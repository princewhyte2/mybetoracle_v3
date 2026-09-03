import type { Locale } from "@/i18n/config";

type Labels = {
  title: string;
  subtitle: string;
  daily: string;
  weekly: string;
  history: string;
  method: string;
  published: string;
  target: string;
  actualTotal: string;
  selections: string;
  averageConfidence: string;
  option: string;
  locked: string;
  unavailable: string;
};

export const accumulatorLabels: Record<Locale, Labels> = {
  en: { title: "Accumulators", subtitle: "Published daily and weekly accas with evidence-backed selections and frozen bookmaker odds.", daily: "Daily Acca", weekly: "Weekly Accas", history: "Results", method: "How selections are chosen", published: "Published", target: "Target", actualTotal: "Actual total", selections: "selections", averageConfidence: "Average leg confidence", option: "Option", locked: "Odds locked at publication", unavailable: "No qualifying combination" },
  es: { title: "Multi-Picks", subtitle: "Combinaciones de fútbol seleccionadas con evidencia y cuotas fijadas.", daily: "Diarias", weekly: "Semanales", history: "Resultados", method: "Cómo se eligen", published: "Publicado", target: "Objetivo", actualTotal: "Total real", selections: "selecciones", averageConfidence: "Confianza media por selección", option: "Opción", locked: "Cuotas fijadas al publicar", unavailable: "Sin combinación apta" },
  fr: { title: "Multi-Picks", subtitle: "Combinaisons de football sélectionnées avec preuves et cotes figées.", daily: "Quotidiennes", weekly: "Hebdomadaires", history: "Résultats", method: "Méthode de sélection", published: "Publié", target: "Objectif", actualTotal: "Total réel", selections: "sélections", averageConfidence: "Confiance moyenne par sélection", option: "Option", locked: "Cotes figées à la publication", unavailable: "Aucune combinaison éligible" },
  de: { title: "Multi-Picks", subtitle: "Kuratierte Fußball-Kombinationen mit belegten Tipps und fixierten Quoten.", daily: "Täglich", weekly: "Wöchentlich", history: "Ergebnisse", method: "Auswahlmethode", published: "Veröffentlicht", target: "Ziel", actualTotal: "Tatsächliche Quote", selections: "Tipps", averageConfidence: "Durchschnittliche Tipp-Konfidenz", option: "Option", locked: "Quoten bei Veröffentlichung fixiert", unavailable: "Keine qualifizierte Kombination" },
  it: { title: "Multi-Picks", subtitle: "Combinazioni di calcio curate con selezioni basate sui dati e quote bloccate.", daily: "Giornaliere", weekly: "Settimanali", history: "Risultati", method: "Come vengono scelte", published: "Pubblicato", target: "Obiettivo", actualTotal: "Totale reale", selections: "selezioni", averageConfidence: "Confidenza media per selezione", option: "Opzione", locked: "Quote bloccate alla pubblicazione", unavailable: "Nessuna combinazione idonea" },
  pt: { title: "Multi-Picks", subtitle: "Combinações de futebol selecionadas com evidências e odds fixadas.", daily: "Diárias", weekly: "Semanais", history: "Resultados", method: "Como são escolhidas", published: "Publicado", target: "Meta", actualTotal: "Total real", selections: "seleções", averageConfidence: "Confiança média por seleção", option: "Opção", locked: "Odds fixadas na publicação", unavailable: "Sem combinação qualificada" },
};
