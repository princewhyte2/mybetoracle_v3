import { notFound } from "next/navigation";
import { DiscoveryExperience } from "@/features/discovery/discovery-experience";
import { resolveDiscoveryEntity } from "@/features/discovery/entity-resolution";
import { discoveryMetadata } from "@/features/discovery/metadata";
import { discoveryLabels } from "@/features/discovery/labels";
import { isLocale } from "@/i18n/config";
export async function generateMetadata({params}:PageProps<"/[locale]/markets/[marketSlug]">){const {locale,marketSlug}=await params;if(!isLocale(locale))notFound();const resolved=await resolveDiscoveryEntity(locale,"market",marketSlug);if(!resolved)return {robots:{index:false,follow:false}};const c=discoveryLabels[locale];return discoveryMetadata(locale,`markets/${resolved.entity.slug}`,`${c.marketNames[resolved.entity.slug] ?? resolved.entity.name} · ${c.predictions}`,c.marketDescriptions[resolved.entity.slug] ?? "Verified prediction-market performance and today's available selections.")}
export default async function Page({params}:PageProps<"/[locale]/markets/[marketSlug]">){const {locale,marketSlug}=await params;if(!isLocale(locale))notFound();const resolved=await resolveDiscoveryEntity(locale,"market",marketSlug);if(!resolved)notFound();return <DiscoveryExperience locale={locale} data={resolved.data} view="market" slug={resolved.entity.slug}/>}
