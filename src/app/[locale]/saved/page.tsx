import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SavedSignedOut } from "@/features/saved/saved-signed-out";
import { AuthenticatedSaved } from "@/features/saved/authenticated/authenticated-saved";
import { getSavedView } from "@/features/saved/authenticated/saved-service";
import { getWebSession } from "@/features/auth/session";
import { isLocale, locales } from "@/i18n/config";
import { savedFullLabels } from "@/features/saved/localized-labels";
import { localizedMetadata } from "@/i18n/localized-metadata";

export const dynamicParams = false;
export const dynamic = "force-dynamic";
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: PageProps<"/[locale]/saved">): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const copy=savedFullLabels[locale];
  return localizedMetadata(locale,"saved",copy.title,copy.subtitle,false);
}
export default async function SavedPage({ params }: PageProps<"/[locale]/saved">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const session=await getWebSession();if(!session)return <SavedSignedOut locale={locale}/>;const data=await getSavedView(locale);return <AuthenticatedSaved locale={locale} initialData={data}/>; }
