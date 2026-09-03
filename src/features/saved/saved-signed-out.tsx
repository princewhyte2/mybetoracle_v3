"use client";

import { Bookmark, ShieldCheck, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { MboMark } from "@/components/brand/brand-marks";
import type { Locale } from "@/i18n/config";
import { savedFullLabels } from "./localized-labels";
import styles from "./saved.module.css";
import shellStyles from "@/features/today/today-experience.module.css";

export function SavedSignedOut({ locale }: { locale: Locale }) {
  const router = useRouter();
  const copy = savedFullLabels[locale];
  return <div className={`${shellStyles.app} ${styles.app}`}>
    <header className={shellStyles.topbar}><div className={shellStyles.topbarInner}><button className={`${shellStyles.brand} ${styles.brandButton}`} onClick={() => router.push(`/${locale}/today`)}><MboMark className={shellStyles.brandMark} title="MyBetOracle"/><span className={shellStyles.brandName}>MyBetOracle</span></button></div></header>
    <main className={styles.main} style={{minHeight:"calc(100vh - 64px)",display:"grid",placeItems:"center",padding:"2rem"}}>
      <section className={styles.methodology} style={{maxWidth:620,textAlign:"center",padding:"3rem",background:"white",border:"1px solid #dfe4ea",borderRadius:12,boxShadow:"0 18px 50px rgba(16,42,86,.08)"}}>
        <div style={{width:54,height:54,margin:"0 auto 1rem"}}><MboMark title="MyBetOracle"/></div>
        <span style={{display:"inline-flex",alignItems:"center",gap:6,color:"#0c5aa6",fontSize:12,fontWeight:800}}><Bookmark size={15}/>{copy.eyebrow}</span>
        <h1 style={{fontSize:32,margin:".65rem 0"}}>{copy.title}</h1><p style={{color:"#667085",lineHeight:1.65}}>{copy.subtitle}</p>
        <button className={styles.manage} onClick={() => router.push(`/${locale}/auth?returnTo=/${locale}/saved`)} style={{margin:"1rem auto",minHeight:44,padding:"0 20px"}}><UserCircle size={18}/>Sign in to Saved</button>
        <small style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,color:"#667085"}}><ShieldCheck size={14}/>Saved state is protected by your MyBetOracle account.</small>
      </section>
    </main>
  </div>;
}
