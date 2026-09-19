import { buildMarketScopeMetadata, buildMarketScopeStaticParams, MarketScopePage } from "@/features/today/market-scope-page";

export const dynamicParams = false;
export const revalidate = 60;

export function generateStaticParams() {
  return buildMarketScopeStaticParams("today");
}

export async function generateMetadata(props: { params: Promise<{ locale: string; marketSlug: string }> }) {
  return buildMarketScopeMetadata(props, "today");
}

export default async function TodayMarketPage(props: { params: Promise<{ locale: string; marketSlug: string }> }) {
  return MarketScopePage(props, "today");
}
