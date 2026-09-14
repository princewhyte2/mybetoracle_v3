import "server-only";

import { cache } from "react";
import { locales, type Locale } from "@/i18n/config";
import { getCachedDiscoveryData, getDiscoveryCatalogSlice } from "./discovery-service";
import { encodedEntityId } from "./public-id";
import type {
  CompetitionEntity,
  CountryEntity,
  DiscoveryData,
  MarketEntity,
  TeamEntity,
} from "./types";

export type DiscoveryEntityKind = "competition" | "team" | "country" | "market";
export type DiscoveryEntity = CompetitionEntity | TeamEntity | CountryEntity | MarketEntity;

async function resolveDiscoveryEntityUncached(
  locale: Locale,
  kind: DiscoveryEntityKind,
  requestedSlug: string,
): Promise<{ data: DiscoveryData; entity: DiscoveryEntity } | null> {
  const data = await getCachedDiscoveryData(locale);
  if (kind === "competition" || kind === "team") {
    const id = encodedEntityId(requestedSlug);
    if (!id) return null;
    let entity = (kind === "competition" ? data.competitions : data.teams).find(
      (item) => item.id === id,
    );
    if (!entity) {
      const section = kind === "competition" ? "competitions" : "teams";
      const result = await getDiscoveryCatalogSlice({ locale, section, page: 1, id });
      const candidates = result.items as Array<CompetitionEntity | TeamEntity>;
      entity = candidates.find((item) => item.id === id);
    }
    if (!entity) return null;
    const resolvedData = kind === "competition"
      ? { ...data, competitions: data.competitions.some((item) => item.id === id) ? data.competitions : [entity as CompetitionEntity, ...data.competitions] }
      : { ...data, teams: data.teams.some((item) => item.id === id) ? data.teams : [entity as TeamEntity, ...data.teams] };
    return { data: resolvedData, entity };
  }
  if (kind === "country") {
    const code = requestedSlug.split("--").at(-1)?.toUpperCase();
    if (!code) return null;
    const entity = data.countries.find((item) => item.code.toUpperCase() === code);
    return entity ? { data, entity } : null;
  }
  const entity = data.markets.find((item) => item.slug === requestedSlug);
  return entity ? { data, entity } : null;
}

export const resolveDiscoveryEntity = cache(resolveDiscoveryEntityUncached);

export async function discoveryEntityAlternates(
  kind: DiscoveryEntityKind,
  requestedSlug: string,
): Promise<Record<string, string>> {
  const segment = kind === "competition" ? "competitions" : kind === "team" ? "teams" : kind === "country" ? "countries" : "markets";
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com";
  if (kind === "market") {
    return { ...Object.fromEntries(locales.map((locale) => [locale, `${origin}/${locale}/${segment}/${requestedSlug}`])), "x-default": `${origin}/en/${segment}/${requestedSlug}` };
  }
  const id = kind === "country"
    ? requestedSlug.split("--").at(-1)?.toUpperCase() ?? null
    : encodedEntityId(requestedSlug);
  if (!id) return {};
  const section = kind === "competition" ? "competitions" : kind === "team" ? "teams" : "countries";
  const resolved = await Promise.all(locales.map(async (locale) => {
    try {
      const result = await getDiscoveryCatalogSlice({ locale, section, page: 1, id });
      const entity = result.items[0];
      return entity ? [locale, `${origin}/${locale}/${segment}/${entity.slug}`] as const : null;
    } catch {
      return null;
    }
  }));
  const languages = Object.fromEntries(resolved.filter((item): item is NonNullable<typeof item> => item !== null));
  if (languages.en) languages["x-default"] = languages.en;
  return languages;
}
