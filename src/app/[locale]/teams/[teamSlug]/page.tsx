import { notFound, permanentRedirect } from "next/navigation";
import { DiscoveryExperience } from "@/features/discovery/discovery-experience";
import { discoveryEntityAlternates, resolveDiscoveryEntity } from "@/features/discovery/entity-resolution";
import { discoveryMetadata } from "@/features/discovery/metadata";
import { discoveryLabels, interpolateDiscovery } from "@/features/discovery/labels";
import { isLocale } from "@/i18n/config";
export async function generateMetadata({params}:PageProps<"/[locale]/teams/[teamSlug]">){const {locale,teamSlug}=await params;if(!isLocale(locale))notFound();const resolved=await resolveDiscoveryEntity(locale,"team",teamSlug);if(!resolved)return {robots:{index:false,follow:false}};const c=discoveryLabels[locale];const metadata=discoveryMetadata(locale,`teams/${resolved.entity.slug}`,`${resolved.entity.name} · ${c.predictions} · ${c.streaks}`,interpolateDiscovery(c.teamEntityDescription,resolved.entity.name));return {...metadata,alternates:{canonical:`/${locale}/teams/${resolved.entity.slug}`,languages:await discoveryEntityAlternates("team",teamSlug)}}}
export default async function Page({params}:PageProps<"/[locale]/teams/[teamSlug]">){const {locale,teamSlug}=await params;if(!isLocale(locale))notFound();const resolved=await resolveDiscoveryEntity(locale,"team",teamSlug);if(!resolved)notFound();if(teamSlug!==resolved.entity.slug)permanentRedirect(`/${locale}/teams/${resolved.entity.slug}`);return <DiscoveryExperience locale={locale} data={resolved.data} view="team" slug={resolved.entity.slug}/>}
