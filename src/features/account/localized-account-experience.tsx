"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Bookmark, ChevronRight, Compass, HelpCircle, Home, Languages, Lock, Mail, Menu, MessageSquare, ReceiptText, ShieldCheck, SlidersHorizontal, UserCircle, WandSparkles, X } from "lucide-react";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import shellStyles from "@/features/today/today-experience.module.css";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import styles from "./account.module.css";
import type { SessionUser } from "@/features/auth/contract";
import type { PreferenceState } from "@/features/saved/authenticated/saved-service";

export type AccountView = "profile" | "preferences" | "support" | "responsible-play" | "privacy" | "terms";

const nav = [
  { label: "today", icon: Home, route: "today" }, { label: "explore", icon: Compass, route: "explore" },
  { label: "accas", icon: WandSparkles, route: "multi-picks" }, { label: "results", icon: BarChart3, route: "results" },
  { label: "saved", icon: Bookmark, route: "saved" }, { label: "betslip", icon: ReceiptText, route: "betslip" },
] as const;
const accountNav = [
  { label: "profile", route: "profile", icon: UserCircle }, { label: "preferences", route: "preferences", icon: SlidersHorizontal },
  { label: "support", route: "support", icon: HelpCircle }, { label: "responsiblePlay", route: "responsible-play", icon: ShieldCheck },
  { label: "privacy", route: "privacy", icon: Lock }, { label: "terms", route: "terms", icon: MessageSquare },
] as const;
const pageKeys: Record<AccountView, "profile" | "preferences" | "support" | "responsiblePlay" | "privacy" | "terms"> = {
  profile: "profile", preferences: "preferences", support: "support", "responsible-play": "responsiblePlay", privacy: "privacy", terms: "terms",
};

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange:(value:boolean)=>void }) {
  return <button className={`${styles.toggle} ${on ? styles.toggleOn : ""}`} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}><span /></button>;
}

export function AccountExperience({ locale, view, user, preferences }: { locale: Locale; view: AccountView; user?: SessionUser; preferences?: PreferenceState|null }) {
  const router = useRouter(); const [menu, setMenu] = useState(false); const messages = getMessages(locale); const common = messages.common; const copy = messages.account; const page = copy.pages[pageKeys[view]];
  const navigate = (route: string) => router.push(`/${locale}/${route}`);
  const initials=(user?.name||user?.email||"MyBetOracle").split(/[\s@]+/).slice(0,2).map(value=>value[0]?.toUpperCase()).join("");
  const [preferenceState,setPreferenceState]=useState<PreferenceState>(preferences||{locale,timezone:"Africa/Lagos",quietHours:{enabled:false,start:"22:00",end:"07:00"},notifications:{kickoff:true,oracleUpdate:true,settlement:true,accumulatorResult:true,morningDigest:false,eveningRecap:false}});const [saved,setSaved]=useState(false);
  const savePreferences=async()=>{setSaved(false);const response=await fetch("/api/saved/preferences",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(preferenceState)});if(response.ok)setSaved(true)};
  const signOut=async()=>{await fetch("/api/auth/session",{method:"DELETE"});router.replace(`/${locale}/today`);router.refresh()};
  return <div className={`${shellStyles.app} ${styles.app}`}>
    <header className={shellStyles.topbar}><div className={shellStyles.topbarInner}><button className={`${shellStyles.brand} ${styles.brand}`} onClick={() => navigate("today")}><MboMark className={shellStyles.brandMark} title="MyBetOracle" /><span className={shellStyles.brandName}>MyBetOracle</span></button><div className={styles.accountContext}><UserCircle size={17} />{common.accountAndHelp}</div><div className={shellStyles.topbarActions}><label className={shellStyles.localeSelect}><Languages size={18} /><select value={locale} aria-label={common.language} onChange={(event) => router.push(`/${event.target.value}/${view}`)}>{locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></label><button className={shellStyles.mobileMenuButton} aria-label={common.openNavigation} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></div></div></header>
    {menu && <MobileProductMenu locale={locale} activeRoute={view} onNavigate={() => setMenu(false)} />}
    <div className={`${shellStyles.shell} ${styles.shell}`}><aside className={shellStyles.sidebar}><nav className={shellStyles.primaryNav} aria-label={common.primaryNavigation}>{nav.map(({ label, icon: Icon, route }) => <button key={route} onClick={() => navigate(route)}><Icon size={19} /><span>{common[label]}</span></button>)}</nav><div className={shellStyles.sidebarSection}><div className={shellStyles.sidebarHeading}><span>{common.account}</span></div>{accountNav.map(({ label, route, icon: Icon }) => <button key={route} className={`${styles.sideLink} ${view === route ? styles.sideActive : ""}`} onClick={() => navigate(route)}><Icon size={15} /><span>{label === "responsiblePlay" || label === "privacy" || label === "terms" ? copy.navigation[label] : common[label]}</span><ChevronRight size={13} /></button>)}</div></aside>
      <main className={`${shellStyles.main} ${styles.main}`}><header className={styles.pageHeader}><span>{page.eyebrow}</span><h1>{page.title}</h1><p>{page.description}</p></header>
        {view === "profile" && <><section className={styles.profileHero}><div className={styles.avatar}>{initials||"MO"}</div><div><strong>{user?.name||copy.member}</strong><span>{user?.email||user?.phoneNumber||copy.member}</span><small>{user?.emailVerified?"Verified MyBetOracle account":"MyBetOracle account"}</small></div><button onClick={() => navigate("preferences")}>{copy.editPreferences}</button></section><section className={styles.cards}><button onClick={() => navigate("saved")}><Bookmark /><span><strong>{common.saved}</strong><small>{copy.matchesAndAccas}</small></span><ChevronRight /></button><button onClick={() => navigate("results")}><BarChart3 /><span><strong>{copy.resultsHistory}</strong><small>{copy.verifiedPublications}</small></span><ChevronRight /></button><button onClick={() => navigate("support")}><HelpCircle /><span><strong>{copy.getSupport}</strong><small>{copy.helpAndContact}</small></span><ChevronRight /></button></section><section className={styles.contact}><ShieldCheck/><div><strong>Secure account session</strong><span>Sign out of this browser when you are finished.</span></div><button onClick={signOut}>Sign out</button></section></>}
        {view === "preferences" && <section className={styles.settings}><div><span><strong>{common.language}</strong><small>{copy.productLanguage}</small></span><select value={preferenceState.locale} onChange={e=>setPreferenceState(current=>({...current,locale:e.target.value as Locale}))}>{locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></div><div><span><strong>{copy.timezone}</strong><small>{copy.timezoneHelp}</small></span><select value={preferenceState.timezone} onChange={e=>setPreferenceState(current=>({...current,timezone:e.target.value}))}><option>Africa/Lagos</option><option>Europe/London</option><option>Europe/Madrid</option><option>America/New_York</option></select></div><div><span><strong>Quiet hours</strong><small>Pause personal notifications during your chosen window</small></span><Toggle label="Quiet hours" on={preferenceState.quietHours.enabled} onChange={enabled=>setPreferenceState(current=>({...current,quietHours:{...current.quietHours,enabled}}))}/></div><div><span><strong>{copy.kickoffReminders}</strong><small>{copy.savedMatchesOnly}</small></span><Toggle label={copy.kickoffReminders} on={preferenceState.notifications.kickoff} onChange={kickoff=>setPreferenceState(current=>({...current,notifications:{...current.notifications,kickoff}}))}/></div><div><span><strong>{copy.settlementAlerts}</strong><small>{copy.settlementOutcomes}</small></span><Toggle label={copy.settlementAlerts} on={preferenceState.notifications.settlement} onChange={settlement=>setPreferenceState(current=>({...current,notifications:{...current.notifications,settlement}}))}/></div><footer><button onClick={()=>void savePreferences()}>{saved?"Preferences saved":"Save preferences"} <ChevronRight size={15} /></button></footer></section>}
        {view === "support" && <><section className={styles.supportGrid}><button><MessageSquare /><strong>{copy.usingPredictions}</strong><span>{copy.predictionsHelp}</span><ChevronRight /></button><button><Bookmark /><strong>{copy.savedAndAlerts}</strong><span>{copy.watchlistsHelp}</span><ChevronRight /></button><button><ShieldCheck /><strong>{copy.resultsAndTrust}</strong><span>{copy.methodologyHelp}</span><ChevronRight /></button></section><section className={styles.contact}><Mail /><div><strong>{copy.stillNeedHelp}</strong><span>{copy.supportIntegration}</span></div><button>{copy.contactSupport}</button></section></>}
        {view === "responsible-play" && <section className={styles.article}><ShieldCheck /><h2>{copy.responsibleTitle}</h2><p>{copy.responsibleIntro}</p><h3>{copy.stayInControl}</h3><ul><li>{copy.boundary}</li><li>{copy.neverChase}</li><li>{copy.pauseNotifications}</li><li>{copy.localSupport}</li></ul></section>}
        {(view === "privacy" || view === "terms") && <section className={styles.article}><Lock /><h2>{view === "privacy" ? copy.privacyAtGlance : copy.termsAtGlance}</h2><p>{view === "privacy" ? copy.privacySummary : copy.termsSummary}</p><h3>{copy.prototypeStatus}</h3><p>{copy.prototypeSummary}</p><h3>{copy.beforeLaunch}</h3><p>{copy.launchSummary}</p></section>}
      </main>
    </div><nav className={shellStyles.mobileBottomNav} aria-label={common.mobileNavigation}>{nav.slice(0, 5).map(({ label, icon: Icon, route }) => <button key={route} onClick={() => navigate(route)}><Icon size={19} /><span>{common[label]}</span></button>)}</nav>
  </div>;
}
