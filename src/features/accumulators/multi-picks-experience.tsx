"use client";

import {
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock3,
  Compass,
  Database,
  Globe2,
  History,
  Home,
  Languages,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  Trophy,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import shellStyles from "@/features/today/today-experience.module.css";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { getMessages, localeTags } from "@/i18n/messages";
import { localizedAccumulatorLabels, type AccumulatorLabels } from "./localized-labels";
import type { Accumulator, AccumulatorHistoryItem, AccumulatorLeg, AccumulatorPageData, AccumulatorResult, AccumulatorScope } from "./types";
import styles from "./multi-picks-experience.module.css";

const navItems = [
  { key: "today", icon: Home, route: "today" },
  { key: "explore", icon: Compass, route: "explore" },
  { key: "accas", icon: WandSparkles, route: "multi-picks" },
  { key: "results", icon: BarChart3, route: "results" },
  { key: "saved", icon: Bookmark, route: "saved" },
  { key: "betslip", icon: ReceiptText, route: "betslip" },
] as const;

function ResultBadge({ result, locale, compact = false }: { result: AccumulatorResult; locale: Locale; compact?: boolean }) {
  const Icon = result === "WON" ? CircleCheck : result === "LOST" ? CircleX : result === "VOID" ? CircleMinus : Clock3;
  const common=getMessages(locale).common;
  const label=result === "WON" ? common.won : result === "LOST" ? common.lost : result === "VOID" ? common.void : common.pending;
  return <span className={`${styles.resultBadge} ${styles[`result${result}`]} ${compact ? styles.resultCompact : ""}`}><Icon size={compact ? 13 : 15} /> {label}</span>;
}

function Crest({ name, shortName, emblemUrl }: { name: string; shortName: string | null; emblemUrl: string | null }) {
  return <span className={styles.crest} aria-hidden="true">{emblemUrl ? <Image src={emblemUrl} alt="" width={28} height={28} sizes="28px" /> : (shortName || name).slice(0, 2).toUpperCase()}</span>;
}

function LegRow({ leg, locale, showDate, labels }: { leg: AccumulatorLeg; locale: Locale; showDate: boolean; labels: AccumulatorLabels }) {
  const kickoff = new Date(leg.fixture.kickoffAt);
  const dateFormatter = new Intl.DateTimeFormat(localeTags[locale], { weekday: "short", day: "numeric", month: "short" });
  const timeFormatter = new Intl.DateTimeFormat(localeTags[locale], { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
  const identity = leg.fixture.identity;
  const competition = identity?.competition.name ?? leg.fixture.competition;
  const country = identity?.competition.country ?? leg.fixture.country;
  const home = identity?.homeTeam ?? { name: leg.fixture.homeTeam, shortName: leg.fixture.homeShortName, emblemUrl: null };
  const away = identity?.awayTeam ?? { name: leg.fixture.awayTeam, shortName: leg.fixture.awayShortName, emblemUrl: null };
  return (
    <>
      {showDate && <div className={styles.legDate}>{dateFormatter.format(kickoff)}</div>}
      <article className={styles.legRow}>
        <span className={styles.legPosition}>{leg.position}</span>
        <div className={styles.fixtureIdentity}>
          <div className={styles.fixtureMeta}><span>{country} / {competition}</span><time>{timeFormatter.format(kickoff)}</time></div>
          <div className={styles.fixtureTeams}><span><Crest name={home.name} shortName={home.shortName} emblemUrl={home.emblemUrl} /> {home.name}</span><small>vs</small><span>{away.name} <Crest name={away.name} shortName={away.shortName} emblemUrl={away.emblemUrl} /></span></div>
        </div>
        <div className={styles.selectionCell}><span>{labels.selection}</span><strong>{leg.selectionLabel}</strong><small>{labels.quality}: {leg.prediction.qualityTier}</small></div>
        <div className={styles.legEvidence} title={labels.confidenceTitle}><span>{labels.confidence}</span><strong>{leg.prediction.confidenceScore}</strong></div>
        <div className={styles.legOdds}><span>{labels.odds}</span><strong>{leg.decimalOdds.toFixed(2)}</strong></div>
        <ResultBadge result={leg.result} locale={locale} compact />
        <button className={styles.legOpen} disabled title={labels.unavailable} aria-label={labels.openMatch.replace("{home}",home.name).replace("{away}",away.name)}><ChevronRight size={16} /></button>
      </article>
    </>
  );
}

function Summary({ accumulator, labels, locale }: { accumulator: Accumulator; labels: ReturnType<typeof getLabels>; locale: Locale }) {
  const published = new Date(accumulator.publishedAt);
  return (
    <section className={styles.summaryPanel}>
      <header><span>{accumulator.scope === "DAILY" ? labels.daily : labels.weekly}</span><strong>{labels.option} {accumulator.variant}</strong></header>
      <div className={styles.summaryMain}>
        <div className={styles.targetMetric}><span>{labels.target}</span><strong>{accumulator.targetLabel}</strong><small>{labels.publishedBand}</small></div>
        <div className={styles.totalMetric}><span>{labels.actualTotal}</span><strong>{accumulator.totalOdds.toFixed(2)}</strong><small>{accumulator.legs.length} {labels.selections}</small></div>
        <div className={styles.confidenceMetric}><span>{labels.averageConfidence}</span><strong>{accumulator.averageConfidence}</strong><small>{labels.arithmeticAverage}</small></div>
        <div className={styles.summaryStatus}><ResultBadge result={accumulator.result} locale={locale}/><span>{labels.published} {published.toLocaleDateString(localeTags[locale], { day: "numeric", month: "short", timeZone: accumulator.timezone })}, {published.toLocaleTimeString(localeTags[locale], { hour: "2-digit", minute: "2-digit", timeZone: accumulator.timezone })}</span></div>
      </div>
    </section>
  );
}

function getLabels(locale: Locale) { return localizedAccumulatorLabels[locale]; }

function HistoryDrawer({ history, onClose, locale }: { history: AccumulatorHistoryItem[]; onClose: () => void; locale: Locale }) {
  const labels=getLabels(locale); const common=getMessages(locale).common;
  const formatter = new Intl.DateTimeFormat(localeTags[locale], { day: "numeric", month: "short", year: "numeric" });
  return (
    <aside className={styles.drawer} aria-label={labels.accaResults}>
      <header><div><span>{labels.trustHistory}</span><h2>{labels.accaResults}</h2></div><button onClick={onClose} aria-label={labels.closeResults}><X size={19} /></button></header>
      <div className={styles.historyFilters}><select aria-label={labels.historyScope}><option>{labels.dailyWeekly}</option><option>{labels.daily}</option><option>{labels.weekly}</option></select><select aria-label={labels.historyResult}><option>{labels.allResults}</option><option>{common.won}</option><option>{common.lost}</option><option>{common.void}</option></select><select aria-label={labels.historyOdds}><option>{labels.allOdds}</option><option>5 Odds</option><option>10 Odds</option></select></div>
      <div className={styles.historyList}>{history.map((item) => <article key={item.id}><div><span>{item.scope === "DAILY" ? labels.daily : labels.weekly}</span><strong>{item.targetLabel} / {labels.option} {item.variant}</strong><small>{formatter.format(new Date(item.date))}</small></div><div><strong>{item.totalOdds.toFixed(2)}</strong><ResultBadge result={item.result} locale={locale} compact /></div><footer>{item.wonLegs} {common.won.toLowerCase()} / {item.lostLegs} {common.lost.toLowerCase()} / {item.voidLegs} {common.void.toLowerCase()}</footer></article>)}</div>
      <p className={styles.drawerNote}>{labels.performanceWithheld}</p>
    </aside>
  );
}

export function MultiPicksExperience({ daily, weekly, locale }: { daily: AccumulatorPageData; weekly: AccumulatorPageData; locale: Locale }) {
  const router = useRouter();
  const labels = getLabels(locale);
  const common = getMessages(locale).common;
  const [scope, setScope] = useState<AccumulatorScope>("DAILY");
  const [band, setBand] = useState("ODDS_5");
  const [variant, setVariant] = useState(1);
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const data = scope === "DAILY" ? daily : weekly;
  const normalizedQuery = query.trim().toLocaleLowerCase(localeTags[locale]);
  const visibleItems = useMemo(() => normalizedQuery ? data.items.filter((item) => item.legs.some((leg) => [leg.fixture.identity?.homeTeam.name ?? leg.fixture.homeTeam, leg.fixture.identity?.awayTeam.name ?? leg.fixture.awayTeam, leg.fixture.identity?.competition.name ?? leg.fixture.competition, leg.selectionLabel].some((value) => value.toLocaleLowerCase(localeTags[locale]).includes(normalizedQuery)))) : data.items, [data.items, locale, normalizedQuery]);
  const variants = useMemo(() => visibleItems.filter((item) => item.targetBand === band), [band, visibleItems]);
  const selected = variants.find((item) => item.variant === variant) ?? variants[0];
  const dateFormatter = new Intl.DateTimeFormat(localeTags[locale], { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  function navigate(route?: string) { if (route) router.push(`/${locale}/${route}`); }
  function switchLocale(nextLocale: string) { if (locales.includes(nextLocale as Locale)) router.push(`/${nextLocale}/multi-picks?date=${data.date}`); }
  function changeScope(next: AccumulatorScope) { setScope(next); setBand("ODDS_5"); setVariant(1); }
  function changeDate(days: number) { const next = new Date(`${data.date}T12:00:00.000Z`); next.setUTCDate(next.getUTCDate() + days); router.push(`/${locale}/multi-picks?date=${next.toISOString().slice(0, 10)}`); }

  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}><div className={shellStyles.topbarInner}><button className={`${shellStyles.brand} ${styles.brandButton}`} onClick={() => navigate("today")} aria-label={`MyBetOracle ${common.today}`}><MboMark className={shellStyles.brandMark} title="MyBetOracle" /><span className={shellStyles.brandName}>MyBetOracle</span></button><label className={shellStyles.globalSearch}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchPlaceholder} /><kbd>Ctrl K</kbd></label><div className={shellStyles.topbarActions}><button className={shellStyles.topIconButton} aria-label={common.notifications} onClick={() => navigate("saved")}><Bell size={19} /></button><label className={shellStyles.localeSelect}><Languages size={18} /><select value={locale} onChange={(event) => switchLocale(event.target.value)} aria-label={common.language}>{locales.map((item) => <option value={item} key={item}>{localeNames[item]}</option>)}</select></label><button className={shellStyles.avatarButton} aria-label={common.profile} onClick={() => navigate("profile")}><UserCircle size={24} /></button><button className={shellStyles.mobileMenuButton} onClick={() => setMobileMenuOpen((current) => !current)} aria-label={common.openNavigation}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button></div></div></header>
      {mobileMenuOpen && <MobileProductMenu locale={locale} activeRoute="multi-picks" onNavigate={() => setMobileMenuOpen(false)} />}

      <div className={shellStyles.shell}>
        <aside className={shellStyles.sidebar}><nav className={shellStyles.primaryNav} aria-label={common.primaryNavigation}>{navItems.map(({ key, icon: Icon, route }) => <button key={key} className={key === "accas" ? shellStyles.navActive : ""} onClick={() => navigate(route)}><Icon size={19} /><span>{common[key]}</span></button>)}</nav><div className={shellStyles.sidebarSection}><div className={shellStyles.sidebarHeading}><span>{labels.sectionTitle}</span></div><button className={`${styles.toolLink} ${styles.toolLinkActive}`}>{labels.publishedAccas}<ChevronRight size={14} /></button><button className={styles.toolLink} onClick={() => navigate("multi-picks/builder")}>{labels.buildMyAcca}<ChevronRight size={14} /></button><button className={styles.toolLink} onClick={() => navigate("pick-analyzer")}>{labels.pickAnalyzer}<ChevronRight size={14} /></button></div><div className={shellStyles.sidebarFooter}><button onClick={() => navigate("competitions")}><Globe2 size={17} /> {common.allCompetitions}</button><button onClick={() => navigate("responsible-play")}><ShieldCheck size={17} /> {common.responsiblePlay}</button></div></aside>

        <main className={`${shellStyles.main} ${styles.main}`}>
          <div className={styles.pageHeader}><div><span>{labels.eyebrow}</span><h1>{labels.title}</h1></div>{data.history.length > 0 && <div><button onClick={() => setHistoryOpen(true)}><History size={16} /> {labels.history}</button></div>}</div>

          <section className={styles.periodBar}>
            <div className={styles.scopeSwitch}><button className={scope === "DAILY" ? styles.scopeActive : ""} onClick={() => changeScope("DAILY")}>{labels.daily}</button><button className={scope === "WEEKLY" ? styles.scopeActive : ""} onClick={() => changeScope("WEEKLY")}>{labels.weekly}</button></div>
            <div className={styles.dateControl}><button onClick={() => changeDate(scope === "WEEKLY" ? -7 : -1)} aria-label={labels.previousDate}><ChevronLeft size={17} /></button><span><CalendarDays size={15} /><strong>{scope === "DAILY" ? dateFormatter.format(new Date(data.date)) : `${dateFormatter.format(new Date(data.windowStart))} - ${dateFormatter.format(new Date(data.windowEnd))}`}</strong><small>{data.timezone}</small></span><button onClick={() => changeDate(scope === "WEEKLY" ? 7 : 1)} aria-label={labels.nextDate}><ChevronRight size={17} /></button></div>
          </section>

          <section className={styles.bandSection}><header><div><h2>{labels.targetOdds}</h2><span>{labels.selectBand}</span></div><small>{visibleItems.length} {labels.optionsAvailable}</small></header><div className={styles.bandGrid}>{data.bands.map((item) => { const count = visibleItems.filter((entry) => entry.targetBand === item.key).length; return <button key={item.key} className={`${band === item.key ? styles.bandActive : ""} ${count === 0 ? styles.bandUnavailable : ""}`} onClick={() => { setBand(item.key); setVariant(1); }}><strong>{item.label}</strong><span>{count > 0 ? `${count} ${count === 1 ? labels.optionSingular : labels.optionPlural}` : labels.unavailable}</span></button>; })}</div></section>

          {selected ? (
            <>
              <nav className={styles.variantTabs} aria-label={labels.accaOptions}>{variants.map((item) => <button key={item.id} className={selected.id === item.id ? styles.variantActive : ""} onClick={() => setVariant(item.variant)}>{labels.option} {item.variant}<span>{item.totalOdds.toFixed(2)}</span></button>)}</nav>
              <Summary accumulator={selected} labels={labels} locale={locale} />
              <section className={styles.legsSection}><header><div><h2>{labels.selection}</h2><span>{selected.legs.length} {labels.selections}</span></div></header><div>{selected.legs.map((item, index) => { const previous = selected.legs[index - 1]; const showDate = scope === "WEEKLY" && (!previous || new Date(previous.fixture.kickoffAt).toDateString() !== new Date(item.fixture.kickoffAt).toDateString()); return <LegRow key={item.id} leg={item} locale={locale} labels={labels} showDate={showDate} />; })}</div></section>
            </>
          ) : (
            <section className={styles.emptyState}><Database size={23} /><h2>{(scope === "DAILY" ? labels.noQualifyingToday : labels.noQualifyingWeek).replace("{band}",data.bands.find((item) => item.key === band)?.label ?? "")}</h2><p>{labels.emptyExplanation}</p><button disabled={!data.bands.some((item) => data.items.some((entry) => entry.targetBand === item.key))} onClick={() => { const available = data.bands.find((item) => data.items.some((entry) => entry.targetBand === item.key)); if (available) setBand(available.key); }}>{labels.lowerOdds}</button></section>
          )}
        </main>

        <aside className={`${shellStyles.intelligenceRail} ${styles.intelligenceRail}`}>
          <section className={styles.railPanel}><header><span>{labels.recentResults}</span><Trophy size={15} /></header><div className={styles.recentResults}>{data.history.map((item) => <button key={item.id} onClick={() => setHistoryOpen(true)}><span><strong>{item.targetLabel} / {labels.option} {item.variant}</strong><small>{item.scope === "DAILY" ? labels.daily : labels.weekly} / {item.totalOdds.toFixed(2)}</small></span><ResultBadge result={item.result} locale={locale} compact /></button>)}</div><button className={styles.railAction} onClick={() => router.push(`/${locale}/results`)}>{labels.completeHistory} <ChevronRight size={15} /></button></section>
          <section className={`${styles.railPanel} ${styles.uncertaintyPanel}`}><header><span>{labels.responsibleUncertainty}</span><ShieldCheck size={15} /></header><p>{labels.uncertaintyCopy}</p></section>
        </aside>
      </div>

      <nav className={shellStyles.mobileBottomNav} aria-label={common.mobileNavigation}>{navItems.slice(0, 5).map(({ key, icon: Icon, route }) => <button key={key} className={key === "accas" ? shellStyles.mobileNavActive : ""} onClick={() => navigate(route)}><Icon size={19} /><span>{common[key]}</span></button>)}</nav>
      {historyOpen && <button className={styles.drawerScrim} onClick={() => setHistoryOpen(false)} aria-label={labels.closePanel} />}
      {historyOpen && <HistoryDrawer history={data.history} onClose={() => setHistoryOpen(false)} locale={locale} />}
    </div>
  );
}
