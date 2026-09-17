import "server-only";
import type { Locale } from "@/i18n/config";
import type { AccumulatorPageData } from "./types";

export function buildMultiPicksJsonLd({
  daily,
  weekly,
  locale,
  origin,
  title,
  description,
}: {
  daily: AccumulatorPageData;
  weekly: AccumulatorPageData;
  locale: Locale;
  origin: string;
  title: string;
  description: string;
}): Record<string, unknown>[] {
  const pageUrl = `${origin}/${locale}/multi-picks`;
  const homeUrl = `${origin}/${locale}/today`;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Multi-Picks",
        item: pageUrl,
      },
    ],
  };

  const allItems = [...daily.items, ...weekly.items];
  const itemListElements = allItems.slice(0, 10).map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: `${item.scope === "DAILY" ? "Daily" : "Weekly"} ${item.targetLabel} · Option ${item.variant}`,
    description: `${item.legs.length} verified selections, total odds ${item.totalOdds.toFixed(2)}, average confidence ${item.averageConfidence}%`,
  }));

  const collectionPage: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "MyBetOracle",
      url: origin,
    },
  };

  if (itemListElements.length > 0) {
    collectionPage.mainEntity = {
      "@type": "ItemList",
      itemListElement: itemListElements,
    };
  }

  return [breadcrumbs, collectionPage];
}
