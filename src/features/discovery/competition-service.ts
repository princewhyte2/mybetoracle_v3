import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type { CompetitionData, CompetitionTab } from './competition-types';

export const getCompetitionData = cache(async (locale: Locale, id: string, tab: CompetitionTab = 'overview', seasonId?: string, page = 1): Promise<CompetitionData | null> => {
  const base = process.env.MYBETORACLE_SERVER_BASE_URL?.replace(/\/$/, '');
  const key = process.env.MYBETORACLE_SERVER_SERVICE_KEY;
  if (!base || !key) throw new Error('COMPETITION_CONFIGURATION_ERROR');
  const url = new URL(`${base}/api/v3/discovery/competitions/${id}`);
  url.searchParams.set('locale', locale);
  url.searchParams.set('tab', tab);
  url.searchParams.set('page', String(page));
  if (seasonId) url.searchParams.set('seasonId', seasonId);
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000), headers: {
    Accept: 'application/json', 'X-MyBetOracle-V3-Key': key,
  } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('COMPETITION_SERVICE_UNAVAILABLE');
  const data = await response.json() as CompetitionData;
  if (data.schemaVersion !== 'mbo-competition-v1' || data.competition?.id !== id || data.locale !== locale || data.tab !== tab ||
    (seasonId && data.season?.id !== seasonId) || !Array.isArray(data.fixtures) || !Array.isArray(data.seasons) || !data.pagination)
    throw new Error('COMPETITION_INVALID_RESPONSE');
  return data;
});
