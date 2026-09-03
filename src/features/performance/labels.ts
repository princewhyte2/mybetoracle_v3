import type { Locale } from "@/i18n/config";

type PerformanceLabels = {
  title: string;
  subtitle: string;
  results: string;
  methodology: string;
  published: string;
  settled: string;
  won: string;
  lost: string;
  void: string;
  hitRate: string;
  sample: string;
};

export const performanceLabels: Record<Locale, PerformanceLabels> = {
  en: { title: "Performance", subtitle: "Transparent settled results with sample sizes, market breakdowns and publication methodology.", results: "Results ledger", methodology: "Methodology", published: "Published", settled: "Settled", won: "Won", lost: "Lost", void: "Void", hitRate: "Hit rate", sample: "sample" },
  es: { title: "Rendimiento", subtitle: "Resultados liquidados transparentes con muestras y desglose por mercado.", results: "Historial de resultados", methodology: "Metodología", published: "Publicadas", settled: "Liquidadas", won: "Ganadas", lost: "Perdidas", void: "Anuladas", hitRate: "Tasa de acierto", sample: "muestra" },
  fr: { title: "Performance", subtitle: "Résultats réglés transparents avec échantillons et ventilation par marché.", results: "Historique des résultats", methodology: "Méthodologie", published: "Publiés", settled: "Réglés", won: "Gagnés", lost: "Perdus", void: "Annulés", hitRate: "Taux de réussite", sample: "échantillon" },
  de: { title: "Performance", subtitle: "Transparente abgerechnete Ergebnisse mit Stichproben und Marktaufschlüsselung.", results: "Ergebnisverlauf", methodology: "Methodik", published: "Veröffentlicht", settled: "Abgerechnet", won: "Gewonnen", lost: "Verloren", void: "Storniert", hitRate: "Trefferquote", sample: "Stichprobe" },
  it: { title: "Rendimento", subtitle: "Risultati liquidati trasparenti con campioni e analisi per mercato.", results: "Storico risultati", methodology: "Metodologia", published: "Pubblicati", settled: "Liquidati", won: "Vinti", lost: "Persi", void: "Annullati", hitRate: "Tasso di successo", sample: "campione" },
  pt: { title: "Desempenho", subtitle: "Resultados liquidados transparentes com amostras e análise por mercado.", results: "Histórico de resultados", methodology: "Metodologia", published: "Publicadas", settled: "Liquidadas", won: "Ganhas", lost: "Perdidas", void: "Anuladas", hitRate: "Taxa de acerto", sample: "amostra" },
};
