import type { Metadata } from "next";
import { locales, type Locale } from "./config";

const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mybetoracle.com").replace(/\/$/, "");

export function localizedMetadata(locale:Locale,path:string,title:string,description?:string,index=true):Metadata {
  const cleanPath = path.replace(/^\//, "");
  const canonical=`${siteOrigin}/${locale}/${cleanPath}`;
  // The root layout already applies title:{template:"%s | MyBetOracle"} to
  // every page -- appending the suffix here too produced a real, live
  // "Page | MyBetOracle | MyBetOracle" bug on every indexed page (found and
  // fixed 2026-09-14). openGraph/twitter titles aren't covered by the
  // layout template, so they still need the brand suffix applied directly.
  const fullTitle=title.includes("MyBetOracle") ? title : `${title} | MyBetOracle`;
  return {
    title,
    ...(description ? {description} : {}),
    ...(!index ? {robots:{index:false,follow:true}} : {}),
    alternates:{canonical,languages:{...Object.fromEntries(locales.map(item=>[item,`${siteOrigin}/${item}/${cleanPath}`])),"x-default":`${siteOrigin}/en/${cleanPath}`}},
    ...(description ? {openGraph:{type:"website",url:canonical,title:fullTitle,description,siteName:"MyBetOracle"},twitter:{card:"summary_large_image",title:fullTitle,description}} : {}),
  };
}
