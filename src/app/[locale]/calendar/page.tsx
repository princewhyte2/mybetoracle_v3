import { notFound } from "next/navigation";
import { DiscoveryExperience } from "@/features/discovery/discovery-experience";
import { getDiscoveryData } from "@/features/discovery/discovery-service";
import { discoveryMetadata } from "@/features/discovery/metadata";
import { discoveryLabels } from "@/features/discovery/labels";
import { isLocale, locales } from "@/i18n/config";
export const dynamic = "force-dynamic";
export function generateStaticParams(){return locales.map(locale=>({locale}))}
export async function generateMetadata({params}:PageProps<"/[locale]/calendar">){const {locale}=await params;if(!isLocale(locale))notFound();const c=discoveryLabels[locale];return discoveryMetadata(locale,"calendar",c.calendarTitle,c.calendarDescription)}
export default async function Page({params,searchParams}:PageProps<"/[locale]/calendar">){const [{locale},query]=await Promise.all([params,searchParams]);if(!isLocale(locale))notFound();const requested=typeof query.date==="string"?query.date:undefined;const date=requested&&/^\d{4}-\d{2}-\d{2}$/.test(requested)?requested:undefined;const data=await getDiscoveryData({locale,date});return <DiscoveryExperience locale={locale} data={data} view="calendar"/>}
