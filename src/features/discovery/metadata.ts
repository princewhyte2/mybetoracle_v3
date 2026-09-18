import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localizedMetadata, type OgImageInput } from "@/i18n/localized-metadata";

export function discoveryMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  customImages?: OgImageInput[],
): Metadata {
  return localizedMetadata(locale, path, title, description, true, customImages);
}
