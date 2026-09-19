import { buildMarketScopeMetadata, buildMarketScopeStaticParams, MarketScopePage } from "@/features/today/market-scope-page";

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return buildMarketScopeStaticParams("tomorrow");
}

export async function generateMetadata(props: { params: Promise<{ locale: string; marketSlug: string }> }) {
  return buildMarketScopeMetadata(props, "tomorrow");
}

export default async function TomorrowMarketPage(props: { params: Promise<{ locale: string; marketSlug: string }> }) {
  return MarketScopePage(props, "tomorrow");
}
