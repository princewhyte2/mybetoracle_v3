import { buildMarketScopeMetadata, buildMarketScopeStaticParams, MarketScopePage } from "@/features/today/market-scope-page";

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return buildMarketScopeStaticParams();
}

export async function generateMetadata(props: { params: Promise<{ locale: string; marketSlug: string }> }) {
  return buildMarketScopeMetadata(props, "tomorrow");
}

export default async function TomorrowMarketPage(props: { params: Promise<{ locale: string; marketSlug: string }> }) {
  return MarketScopePage(props, "tomorrow");
}
