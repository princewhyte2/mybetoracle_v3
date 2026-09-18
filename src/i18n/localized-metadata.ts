import type { Metadata } from "next";
import { locales, type Locale } from "./config";

export const DEFAULT_OG_IMAGE = {
  url: "https://res.cloudinary.com/codewithwhyte/image/upload/c_crop,w_1200,h_630/v1692965057/oracle.png",
  width: 1200,
  height: 630,
  alt: "MyBetOracle - Football Intelligence & Multi-Picks",
  type: "image/png",
};

export const DEFAULT_SITE_DESCRIPTION =
  "Verified football intelligence, prediction markets, streak evidence and performance tracking.";

const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  it: "it_IT",
  pt: "pt_PT",
};

const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com").replace(/\/$/, "");

export type OgImageInput = string | {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
};

export function localizedMetadata(
  locale: Locale,
  path: string,
  title: string,
  description?: string,
  index = true,
  customImages?: OgImageInput[],
): Metadata {
  const cleanPath = path.replace(/^\//, "");
  const canonical = `${siteOrigin}/${locale}/${cleanPath}`;
  // The root layout already applies title:{template:"%s | MyBetOracle"} to
  // every page -- appending the suffix here too produced a real, live
  // "Page | MyBetOracle | MyBetOracle" bug on every indexed page (found and
  // fixed 2026-09-14). openGraph/twitter titles aren't covered by the
  // layout template, so they still need the brand suffix applied directly.
  const fullTitle = title.includes("MyBetOracle") ? title : `${title} | MyBetOracle`;
  const effectiveDescription = (description && description.trim()) || DEFAULT_SITE_DESCRIPTION;

  const resolvedImages = customImages && customImages.length > 0
    ? customImages.map((img) => (typeof img === "string" ? { url: img, alt: fullTitle } : img))
    : [DEFAULT_OG_IMAGE];

  const twitterImages = resolvedImages.map((img) => img.url);

  return {
    title,
    description: effectiveDescription,
    robots: { index, follow: true },
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(locales.map((item) => [item, `${siteOrigin}/${item}/${cleanPath}`])),
        "x-default": `${siteOrigin}/en/${cleanPath}`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: fullTitle,
      description: effectiveDescription,
      siteName: "MyBetOracle",
      locale: OG_LOCALES[locale] ?? "en_US",
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image",
      site: "@mybetoracle",
      creator: "@mybetoracle",
      title: fullTitle,
      description: effectiveDescription,
      images: twitterImages,
    },
  };
}
