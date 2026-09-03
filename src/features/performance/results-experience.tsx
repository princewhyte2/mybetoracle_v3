"use client";

import { BarChart3, Bell, Bookmark, CalendarDays, ChevronLeft, ChevronRight, Compass, Download, Home, Languages, Menu, Search, ShieldCheck, SlidersHorizontal, Sparkles, UserCircle, WandSparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MboMark } from "@/components/brand/brand-marks";
import { locales, type Locale } from "@/i18n/config";
import type { MarketGroup, ResultsData, SettledPrediction, SettledResult } from "./types";
import styles from "./results.module.css";

const localeNames: Record<Locale, string> = { en: "English", es: "Espanol", fr: "Francais", de: "Deutsch", it: "Italiano", pt: "Portugues" };
const navItems = [{ label: "Today", icon: Home, route: "today" }, { label: "Explore", icon: Compass, route: "predictions" }, { label: "Accas", icon: WandSparkles, route: "multi-picks" }, { label: "Performance", icon: BarChart3, route: "performance" }, { label: "Saved", icon: Bookmark, route: undefined }] as const;

function Outcome({ result }: { result: SettledResult }) {
  return <span className={`${styles.outcome} ${styles[result.toLowerCase()]}`}><span />{result === "WON" ? "Won" : result === "LOST" ? "Lost" : "Void"}</span>;
}

function ResultLine({ item, locale }: { item: SettledPrediction; locale: Locale }) {
  return <article className={styles.resultLine}>
    <button className={styles.save} aria-label="Save fixture"><Bookmark size={16} /></button>
    <time><strong>{new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(new Date(item.kickoffAt))}</strong><span>{new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(item.kickoffAt))}</span></time>
    <div className={styles.fixture}><span>{item.competition}</span><strong>{item.homeTeam} <b>{item.finalScore[0]}</b><i>–</i><b>{item.finalScore[1]}</b> {item.awayTeam}</strong></div>
    <div className={styles.pick}><span>{item.marketGroup}</span><strong>{item.selection}</strong></div>
    <div className={styles.score}><span>Oracle</span><strong>{item.oracleScore}</strong></div>
    <div className={styles.odds}><span>Published odds</span><strong>{item.publishedOdds === null ? "—" : item.publishedOdds.toFixed(2)}</strong></div>
    <Outcome result={item.result} />
  </article>;
}

export function ResultsExperience({ initialData, locale }: { initialData: ResultsData; locale: Locale }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(30);
  const [market, setMarket] = useState<MarketGroup | "ALL">("ALL");
  const [result, setResult] = useState<SettledResult | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const pageSize = 18;
  const filtered = useMemo(() => initialData.items.filter((item) => {
    const age = (new Date(initialData.asOf).getTime() - new Date(item.kickoffAt).getTime()) / 86_400_000;
    const text = `${item.homeTeam} ${item.awayTeam} ${item.competition} ${item.selection}`.toLowerCase();
    return age <= period && (market === "ALL" || item.marketGroup === market) && (result === "ALL" || item.result === result) && (!query.trim() || text.includes(query.toLowerCase()));
  }), [initialData, market, period, query, result]);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  function apply<T>(setter: (value: T) => void, value: T) { setter(value); setPage(1); }
  return <div className={styles.app}>
    <header className={styles.topbar}><div className={styles.topbarInner}><button className={styles.brand} onClick={() => router.push(`/${locale}/today`)}><MboMark className={styles.mark} title="MyBetOracle" /><span>MyBetOracle</span></button><label className={styles.globalSearch}><Search size={18} /><input value={query} onChange={(event) => apply(setQuery, event.target.value)} placeholder="Search settled predictions" /><kbd>Ctrl K</kbd></label><div className={styles.topActions}><button className={styles.pro}><Sparkles size={16} /> Oracle Pro</button><button className={styles.iconButton}><Bell size={18} /></button><label className={styles.language}><Languages size={17} /><select value={locale} onChange={(event) => router.push(`/${event.target.value}/results`)}>{locales.map((item) => <option key={item}>{localeNames[item]}</option>)}</select></label><button className={styles.iconButton}><UserCircle size={22} /></button><button className={styles.menu} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div></div></header>
    {menuOpen && <nav className={styles.mobileMenu}>{navItems.map(({ label, icon: Icon, route }) => <button key={label} onClick={() => route && router.push(`/${locale}/${route}`)}><Icon size={18} />{label}</button>)}</nav>}
    <div className={styles.shell}><aside className={styles.sidebar}><nav>{navItems.map(({ label, icon: Icon, route }) => <button key={label} className={label === "Performance" ? styles.navActive : ""} onClick={() => route && router.push(`/${locale}/${route}`)}><Icon size={19} />{label}</button>)}</nav><div className={styles.subnav}><span>PERFORMANCE</span><button onClick={() => router.push(`/${locale}/performance`)}>Overview</button><button className={styles.subActive}>Results ledger</button></div><div className={styles.verified}><ShieldCheck size={18} /><div><strong>Immutable record</strong><span>Published selections stay in history.</span></div></div></aside>
      <main className={styles.main}><header className={styles.pageHeader}><div><span><ShieldCheck size={14} /> VERIFIED HISTORY</span><h1>Results ledger</h1><p>Every settled Oracle prediction, with its original market, score and odds.</p></div><button className={styles.export}><Download size={16} /> Export</button></header>
        <section className={styles.filters}><div className={styles.periods}><CalendarDays size={16} />{[7, 30, 90].map((days) => <button key={days} className={period === days ? styles.activePeriod : ""} onClick={() => apply(setPeriod, days)}>{days} days</button>)}</div><label><span>Market</span><select value={market} onChange={(event) => apply(setMarket, event.target.value as MarketGroup | "ALL")}><option value="ALL">All markets</option>{["1X2", "MIXED", "O/U", "GG/NG", "CORNERS"].map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Outcome</span><select value={result} onChange={(event) => apply(setResult, event.target.value as SettledResult | "ALL")}><option value="ALL">All outcomes</option><option value="WON">Won</option><option value="LOST">Lost</option><option value="VOID">Void</option></select></label><button className={styles.filterIcon} aria-label="More filters"><SlidersHorizontal size={17} /></button></section>
        <div className={styles.listMeta}><strong>{filtered.length} settled predictions</strong><span>Newest first · updated {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(initialData.asOf))}</span></div>
        <section className={styles.resultsList}>{visible.map((item) => <ResultLine item={item} locale={locale} key={item.id} />)}{visible.length === 0 && <div className={styles.empty}><Search size={24} /><strong>No results match these filters</strong><p>Broaden the period, market or outcome to restore the ledger.</p><button onClick={() => { setQuery(""); setPeriod(30); setMarket("ALL"); setResult("ALL"); }}>Clear filters</button></div>}</section>
        <footer className={styles.pagination}><span>Page {page} of {pages}</span><div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={17} /> Previous</button><button disabled={page === pages} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={17} /></button></div></footer>
      </main></div>
    <nav className={styles.bottomNav}>{navItems.map(({ label, icon: Icon, route }) => <button key={label} className={label === "Performance" ? styles.bottomActive : ""} onClick={() => route && router.push(`/${locale}/${route}`)}><Icon size={19} /><span>{label}</span></button>)}</nav>
  </div>;
}
