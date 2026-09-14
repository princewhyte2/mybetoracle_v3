import type { Metadata } from "next";
import { locales, type Locale } from "./config";

export function localizedMetadata(locale:Locale,path:string,title:string,description?:string,index=true):Metadata {
  const canonical=`https://www.mybetoracle.com/${locale}/${path}`;
  const fullTitle=title.includes("MyBetOracle") ? title : `${title} | MyBetOracle`;
  return {
    title:fullTitle,
    ...(description ? {description} : {}),
    ...(!index ? {robots:{index:false,follow:true}} : {}),
    alternates:{canonical,languages:{...Object.fromEntries(locales.map(item=>[item,`https://www.mybetoracle.com/${item}/${path}`])),"x-default":`https://www.mybetoracle.com/en/${path}`}},
    ...(description ? {openGraph:{type:"website",url:canonical,title:fullTitle,description,siteName:"MyBetOracle"},twitter:{card:"summary_large_image",title:fullTitle,description}} : {}),
  };
}
