import { notFound } from "next/navigation";
import { DiscoveryExperience } from "@/features/discovery/discovery-experience";
import { getDiscoveryData } from "@/features/discovery/discovery-service";
import { discoveryMetadata } from "@/features/discovery/metadata";
import { discoveryLabels } from "@/features/discovery/labels";
import { isLocale, locales } from "@/i18n/config";
export const dynamic = "force-dynamic";
export function generateStaticParams(){return locales.map(locale=>({locale}))}
export async function generateMetadata({params}:PageProps<"/[locale]/teams">){const {locale}=await params;if(!isLocale(locale))notFound();const c=discoveryLabels[locale];return discoveryMetadata(locale,"teams",c.teams,c.teamDescription)}
export default async function Page({params}:PageProps<"/[locale]/teams">){const {locale}=await params;if(!isLocale(locale))notFound();const data=await getDiscoveryData({locale});return <DiscoveryExperience locale={locale} data={data} view="directory" section="teams"/>}
