import { cache } from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { DiscoveryExperience } from './discovery-experience';
import { discoveryEntityAlternates } from './entity-resolution';
import { getDiscoveryCatalogSlice } from './discovery-service';
import { getCompetitionData } from './competition-service';
import { CompetitionContent } from './competition-content';
import { competitionLabels } from './competition-labels';
import { discoveryMetadata } from './metadata';
import { interpolateDiscovery } from './labels';
import { encodedEntityId } from './public-id';
import type { CompetitionTab } from './competition-types';
import type { CompetitionEntity, DiscoveryData } from './types';
import { isLocale, type Locale } from '@/i18n/config';

const identity = cache(async (locale: Locale, slug: string) => {
  const id = encodedEntityId(slug);
  if (!id) return null;
  const result = await getDiscoveryCatalogSlice({ locale, section: 'competitions', page: 1, id });
  return (result.items as CompetitionEntity[]).find((item) => item.id === id) ?? null;
});
export async function generateMetadata({ params }: PageProps<'/[locale]/competitions/[competitionSlug]'>) {
  const { locale, competitionSlug } = await params;
  if (!isLocale(locale)) notFound();
  const entity = await identity(locale, competitionSlug);
  if (!entity) return { robots: { index: false, follow: false } };
  const seo = competitionLabels[locale];
  const customImages = entity.emblemUrl ? [{ url: entity.emblemUrl, alt: entity.name }] : undefined;
  return { ...discoveryMetadata(locale, `competitions/${entity.slug}`, interpolateDiscovery(seo.seoTitle, entity.name), interpolateDiscovery(seo.seoDescription, entity.name), customImages),
    alternates: { canonical: `/${locale}/competitions/${entity.slug}`, languages: await discoveryEntityAlternates('competition', entity.slug) } };
}
export default async function CompetitionPage({ params, searchParams }: PageProps<'/[locale]/competitions/[competitionSlug]'>) {
  const { locale, competitionSlug } = await params;
  if (!isLocale(locale)) notFound();
  const entity = await identity(locale, competitionSlug);
  if (!entity) notFound();
  const query = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const rawTab = first(query.tab);
  const tab: CompetitionTab = ['fixtures', 'results', 'predictions', 'standings'].includes(rawTab ?? '') ? rawTab as CompetitionTab : 'overview';
  const rawPage = Number(first(query.page));
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10000 ? rawPage : 1;
  const rawSeason = first(query.seasonId);
  const seasonId = rawSeason && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawSeason) ? rawSeason : undefined;
  const normalized = new URLSearchParams({ tab, page: String(page) });
  if (seasonId) normalized.set('seasonId', seasonId);
  if (competitionSlug !== entity.slug) permanentRedirect(`/${locale}/competitions/${entity.slug}?${normalized}`);
  const emptyCatalog = { loaded: 0, total: 0, nextPage: null, totalPages: 0 };
  const shell: DiscoveryData = { date: '', countries: [], competitions: [entity], teams: [], markets: [], fixtures: [],
    catalog: { countries: emptyCatalog, competitions: { ...emptyCatalog, loaded: 1, total: 1 }, teams: emptyCatalog, markets: emptyCatalog } };
  let data;
  try { data = await getCompetitionData(locale, entity.id, tab, seasonId, page); }
  catch { data = undefined; }
  if (data === null) notFound();
  const copy = competitionLabels[locale];
  return <DiscoveryExperience locale={locale} data={shell} view="competition" slug={entity.slug} entityQuery={normalized.toString()}>
    {data ? <CompetitionContent locale={locale} data={data} /> : <section><h1>{entity.name}</h1><p>{copy.failed}</p><Link href={`/${locale}/competitions/${entity.slug}?${normalized}`} prefetch={false}>{copy.retry}</Link></section>}
  </DiscoveryExperience>;
}
