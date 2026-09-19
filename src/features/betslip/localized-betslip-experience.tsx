"use client";

import { BarChart3, Bell, Bookmark, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, CircleX, Compass, Home, Languages, Menu, ReceiptText, Search, Share2, ShieldCheck, Trophy, UserCircle, WandSparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MboMark } from "@/components/brand/brand-marks";
import { AdSlot } from "@/components/ads/ad-slot";
import { RoutePendingIndicator, useRoutePendingTransition } from "@/components/navigation/route-pending-indicator";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import type { AccumulatorLeg, AccumulatorResult } from "@/features/accumulators/types";
import shellStyles from "@/features/today/today-experience.module.css";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { translateMarketSelection } from "@/i18n/football";
import { getMessages, localeTags } from "@/i18n/messages";
import { withMultiPickTerminology } from "@/i18n/multi-pick-terminology";
import { betslipLabels, type BetslipLabels } from "./labels";
import styles from "./betslip.module.css";
import type { DailyBetslip } from "./types";

const navItems = [{ key:"today",icon:Home,route:"today"},{key:"explore",icon:Compass,route:"explore"},{key:"accas",icon:WandSparkles,route:"multi-picks"},{key:"results",icon:BarChart3,route:"results"},{key:"saved",icon:Bookmark,route:"saved"},{key:"betslip",icon:ReceiptText,route:"betslip"}] as const;
type Common = ReturnType<typeof getMessages>["common"];
const interpolate = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);

function Status({ result, common }: { result: AccumulatorResult; common: Common }) {
  const Icon = result === "WON" ? CircleCheck : result === "LOST" ? CircleX : result === "PENDING" ? CalendarDays : ShieldCheck;
  const label = result === "WON" ? common.won : result === "LOST" ? common.lost : result === "VOID" ? common.void : common.pending;
  return <span className={`${styles.status} ${styles[`status${result}`]}`}><Icon size={13} />{label}</span>;
}

function Crest({ leg, side }: { leg: AccumulatorLeg; side: "home" | "away" }) {
  const shortName = side === "home" ? leg.fixture.homeShortName : leg.fixture.awayShortName;
  const teamName = side === "home" ? leg.fixture.homeTeam : leg.fixture.awayTeam;
  const colors = side === "home" ? leg.fixture.homeColors : leg.fixture.awayColors;
  return <span className={styles.crest} style={{ "--crest-primary": colors[0], "--crest-secondary": colors[1] } as React.CSSProperties}>{(shortName || teamName).slice(0, 2).toUpperCase()}</span>;
}

function LegRow({ leg, locale, onOpen, copy, common }: { leg: AccumulatorLeg; locale: Locale; onOpen: () => void; copy: BetslipLabels; common: Common }) {
  const kickoff = new Date(leg.fixture.kickoffAt);
  return <article className={styles.legRow}>
    <span className={styles.position}>{leg.position}</span>
    <button className={styles.fixture} onClick={onOpen}><small>{leg.fixture.country} / {leg.fixture.competition} · {new Intl.DateTimeFormat(localeTags[locale], { hour: "2-digit", minute: "2-digit" }).format(kickoff)}</small><span><Crest leg={leg} side="home" />{leg.fixture.homeTeam}<i>vs</i>{leg.fixture.awayTeam}<Crest leg={leg} side="away" /></span></button>
    <div className={styles.pick}><small>{copy.selection}</small><strong>{translateMarketSelection(locale, leg.selectionLabel)}</strong><span>{leg.marketType === "mixed" ? copy.mixed : copy.regular}</span></div>
    <div className={styles.confidence}><small>Oracle</small><strong>{leg.prediction.confidenceScore}</strong></div>
    <div className={styles.odds}><small>{copy.odds}</small><strong>{leg.decimalOdds.toFixed(2)}</strong></div>
    <Status result={leg.result} common={common} />
    <button className={styles.open} onClick={onOpen} aria-label={interpolate(copy.openMatch,{home:leg.fixture.homeTeam,away:leg.fixture.awayTeam})}><ChevronRight size={16} /></button>
  </article>;
}

export function BetslipExperience({ data, locale }: { data: DailyBetslip; locale: Locale }) {
  const router = useRouter(); const copy = withMultiPickTerminology(betslipLabels[locale], locale, "betslip"); const common = getMessages(locale).common;
  const { isPending: dateChangePending, pushTransition: pushDateChange } = useRoutePendingTransition();
  const [menuOpen,setMenuOpen]=useState(false); const [saved,setSaved]=useState(false);
  const navigate=(route:string)=>router.push(`/${locale}/${route}`); const date=new Date(`${data.date}T12:00:00Z`); const generated=new Date(data.generatedAt);
  const changeDate=(days:number)=>{const next=new Date(date);next.setUTCDate(next.getUTCDate()+days);pushDateChange(`/${locale}/betslip?date=${next.toISOString().slice(0,10)}`)};
  const share=async()=>{const url=window.location.href;if(navigator.share)await navigator.share({title:"Oracle Daily",url});else await navigator.clipboard.writeText(url)};
  const savePublication=async()=>{const method=saved?"DELETE":"PUT";const response=await fetch(`/api/saved/oracle-daily/${data.id}`,{method});if(response.status===401){router.push(`/${locale}/auth?returnTo=${encodeURIComponent(window.location.pathname+window.location.search)}`);return}if(response.ok)setSaved(value=>!value)};
  const averageOracle=Math.round(data.legs.reduce((sum,leg)=>sum+leg.prediction.confidenceScore,0)/data.legs.length);
  return <div className={`${shellStyles.app} ${styles.app}`}>
    <RoutePendingIndicator active={dateChangePending} />
    <header className={shellStyles.topbar}><div className={shellStyles.topbarInner}><button className={`${shellStyles.brand} ${styles.brand}`} onClick={()=>navigate("today")}><MboMark className={shellStyles.brandMark} title="MyBetOracle"/><span className={shellStyles.brandName}>MyBetOracle</span></button><label className={shellStyles.globalSearch}><Search size={18}/><input placeholder={copy.searchPlaceholder}/><kbd>Ctrl K</kbd></label><div className={shellStyles.topbarActions}><button className={shellStyles.topIconButton} aria-label={common.notifications} onClick={()=>navigate("saved")}><Bell size={19}/></button><label className={shellStyles.localeSelect}><Languages size={18}/><select value={locale} onChange={e=>router.push(`/${e.target.value}/betslip?date=${data.date}`)} aria-label={common.language}>{locales.map(item=><option key={item} value={item}>{localeNames[item]}</option>)}</select></label><button className={shellStyles.avatarButton} aria-label={common.profile} onClick={()=>navigate("profile")}><UserCircle size={24}/></button><button className={shellStyles.mobileMenuButton} aria-label={common.openNavigation} onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X size={22}/>:<Menu size={22}/>}</button></div></div></header>
    {menuOpen&&<MobileProductMenu locale={locale} activeRoute="betslip" onNavigate={()=>setMenuOpen(false)}/>}
    <div className={shellStyles.shell}>
      <aside className={shellStyles.sidebar}><nav className={shellStyles.primaryNav} aria-label={common.primaryNavigation}>{navItems.map(({key,icon:Icon,route})=><button key={route} className={key==="betslip"?shellStyles.navActive:""} onClick={()=>navigate(route)}><Icon size={19}/><span>{common[key]}</span></button>)}</nav><div className={shellStyles.sidebarSection}><div className={shellStyles.sidebarHeading}><span>{common.betslip}</span></div><button className={`${styles.sideLink} ${styles.sideActive}`}>{copy.todaySlip}<ChevronRight size={14}/></button><button className={styles.sideLink} onClick={()=>navigate("results")}>{copy.pastSlips}<ChevronRight size={14}/></button><button className={styles.sideLink} onClick={()=>navigate("multi-picks")}>{copy.accumulators}<ChevronRight size={14}/></button></div></aside>
      <main className={`${shellStyles.main} ${styles.main}`}>
        <header className={styles.pageHeader}><div><span>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><div><button onClick={savePublication} className={saved?styles.saved:""}><Bookmark size={16} fill={saved?"currentColor":"none"}/>{saved?copy.saved:copy.save}</button><button onClick={share}><Share2 size={16}/>{copy.share}</button></div></header>
        <AdSlot format="leaderboard" label={copy.advertisement} />
        <section className={styles.dateBar}><button aria-label={copy.previousDate} onClick={()=>changeDate(-1)}><ChevronLeft size={17}/></button><span><CalendarDays size={16}/><strong>{new Intl.DateTimeFormat(localeTags[locale],{weekday:"long",day:"numeric",month:"long"}).format(date)}</strong><small>{data.timezone}</small></span><button aria-label={copy.nextDate} onClick={()=>changeDate(1)}><ChevronRight size={17}/></button></section>
        <section className={styles.slipSummary}><header><span><ReceiptText size={15}/>{copy.dailyBetslip}</span><Status result={data.result} common={common}/></header><div><section><small>{copy.totalOdds}</small><strong>{data.totalOdds.toFixed(2)}</strong><span>{copy.target} {data.targetMinimum.toFixed(2)}–{data.targetMaximum.toFixed(2)}</span></section><section><small>{copy.selections}</small><strong>{data.legs.length}</strong><span>{copy.onePickPerFixture}</span></section><section><small>{copy.averageOracle}</small><strong>{averageOracle}</strong><span>{copy.legAverage}</span></section><section><small>{copy.published}</small><strong>{new Intl.DateTimeFormat(localeTags[locale],{hour:"2-digit",minute:"2-digit"}).format(generated)}</strong><span>{copy.oddsSnapshot}</span></section></div><footer><ShieldCheck size={14}/>{copy.immutableNote}</footer></section>
        <section className={styles.legs}><header><div><h2>{copy.selections}</h2><span>{data.legs.length} {copy.fixtures}</span></div><small>{copy.referenceOdds}</small></header><div>{data.legs.map(leg=><LegRow key={leg.id} leg={leg} locale={locale} copy={copy} common={common} onOpen={()=>navigate(`today?date=${data.date}`)}/>)}</div></section>
      </main>
      <aside className={`${shellStyles.intelligenceRail} ${styles.rail}`}>
        <section><header><span>{copy.slipStandard}</span><ShieldCheck size={15}/></header><dl><div><dt>{copy.targetOdds}</dt><dd>{data.targetMinimum.toFixed(2)}–{data.targetMaximum.toFixed(2)}</dd></div><div><dt>{copy.markets}</dt><dd>{copy.mixedThenRegular}</dd></div><div><dt>{copy.teamOverlap}</dt><dd>{copy.notAllowed}</dd></div><div><dt>{copy.maximumLegs}</dt><dd>6</dd></div></dl></section>
        <section><header><span>{copy.recentSlips}</span><Trophy size={15}/></header><div className={styles.history}>{data.history.map(item=><button key={item.id} onClick={()=>navigate("results")}><span><strong>{new Intl.DateTimeFormat(localeTags[locale],{day:"numeric",month:"short"}).format(new Date(`${item.date}T12:00:00Z`))}</strong><small>{item.selections} {copy.picks} · {item.totalOdds.toFixed(2)}</small></span><Status result={item.result} common={common}/></button>)}</div><button className={styles.historyLink} onClick={()=>navigate("results")}>{copy.viewHistory}<ChevronRight size={14}/></button></section>
        <section className={styles.accaLink}><span>{copy.moreCombinations}</span><strong>{copy.dailyWeeklyAccas}</strong><button onClick={()=>navigate("multi-picks")}>{copy.openAccas}<ChevronRight size={14}/></button></section>
      </aside>
    </div>
    <nav className={shellStyles.mobileBottomNav} aria-label={common.mobileNavigation}>{navItems.slice(0,5).map(({key,icon:Icon,route})=><button key={route} onClick={()=>navigate(route)}><Icon size={19}/><span>{common[key]}</span></button>)}</nav>
  </div>;
}
