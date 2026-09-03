import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthExperience } from "@/features/auth/auth-experience";
import { isLocale, locales } from "@/i18n/config";

export const dynamicParams=false;
export function generateStaticParams(){return locales.map(locale=>({locale}))}
type AuthPageProps={params:Promise<{locale:string}>};
export async function generateMetadata({params}:AuthPageProps):Promise<Metadata>{const {locale}=await params;if(!isLocale(locale))notFound();return {title:"Sign in | MyBetOracle",robots:{index:false,follow:false}}}
export default async function AuthPage({params}:AuthPageProps){const {locale}=await params;if(!isLocale(locale))notFound();return <Suspense fallback={<main aria-busy="true" aria-label="Loading sign in" style={{minHeight:"100vh",background:"#f3f7fc"}} />}><AuthExperience locale={locale}/></Suspense>}
