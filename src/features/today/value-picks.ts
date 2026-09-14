import type { Match, PredictionMarket } from './types';

export function valueMarket(match: Match, topOnly: boolean, now = Date.now()): PredictionMarket | null {
  if (match.state !== 'scheduled' || !match.kickoffAt || !Number.isFinite(Date.parse(match.kickoffAt)) || Date.parse(match.kickoffAt) <= now) return null;
  const eligible = Object.entries(match.markets).filter(([, market]) => {
    const value = market.valueAnalysis;
    return market.available && value && Number.isFinite(value.kellyScore) && value.kellyScore > 0
      && value.edge > 0 && value.expectedValue > 0 && (!topOnly || value.probability >= 0.5)
      && now - Date.parse(value.capturedAt) >= 0 && now - Date.parse(value.capturedAt) <= 86_400_000;
  });
  eligible.sort((a, b) => b[1].valueAnalysis!.kellyScore - a[1].valueAnalysis!.kellyScore || a[0].localeCompare(b[0]));
  return eligible[0]?.[0] as PredictionMarket ?? null;
}
