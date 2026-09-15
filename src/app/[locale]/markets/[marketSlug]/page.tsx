import { notFound, permanentRedirect } from "next/navigation";
import { marketGroupForSlug } from "@/features/discovery/market-presentation";
import { isLocale } from "@/i18n/config";

// Preserve the old Today-market intent at the complete canonical market page.
export default async function Page({ params }: PageProps<"/[locale]/markets/[marketSlug]">) {
  const { locale, marketSlug } = await params;
  if (!isLocale(locale) || !marketGroupForSlug(marketSlug)) notFound();
  permanentRedirect(`/${locale}/today/${marketSlug}`);
}
