import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/localized-metadata";

export function discoveryMetadata(locale:Locale,path:string,title:string,description:string):Metadata {
  return localizedMetadata(locale,path,title,description);
}
