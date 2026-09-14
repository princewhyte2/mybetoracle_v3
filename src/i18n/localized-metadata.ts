import type { Metadata } from "next";
import { locales, type Locale } from "./config";

export function localizedMetadata(locale:Locale,path:string,title:string,description?:string,index=true):Metadata {
  const canonical=`https://www.mybetoracle.com/${locale}/${path}`;
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
    alternates:{canonical,languages:{...Object.fromEntries(locales.map(item=>[item,`https://www.mybetoracle.com/${item}/${path}`])),"x-default":`https://www.mybetoracle.com/en/${path}`}},
    ...(description ? {openGraph:{type:"website",url:canonical,title:fullTitle,description,siteName:"MyBetOracle"},twitter:{card:"summary_large_image",title:fullTitle,description}} : {}),
  };
}
