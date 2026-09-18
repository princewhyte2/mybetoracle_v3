"use client";

import {
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock3,
  Compass,
  Copy,
  Database,
  Globe2,
  History,
  Home,
  Languages,
  Layers,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import { AdSlot } from "@/components/ads/ad-slot";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { buildPublicMatchPath } from "@/features/match/public-match-url";
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

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getCachedFormatter(localeTag: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${localeTag}:${JSON.stringify(options)}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(localeTag, options);
    formatterCache.set(key, fmt);
  }
  return fmt;
}

function formatLegDate(locale: Locale, date: Date): string {
  return getCachedFormatter(localeTags[locale], { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function formatLegTime(locale: Locale, date: Date): string {
  return getCachedFormatter(localeTags[locale], { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(date);
}

function formatHistoryDate(locale: Locale, date: Date): string {
  return getCachedFormatter(localeTags[locale], { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function formatSummaryDate(locale: Locale, date: Date, timezone: string): string {
  return getCachedFormatter(localeTags[locale], { day: "numeric", month: "short", timeZone: timezone }).format(date);
}

function formatSummaryTime(locale: Locale, date: Date, timezone: string): string {
  return getCachedFormatter(localeTags[locale], { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(date);
}

function formatPeriodDate(locale: Locale, date: Date): string {
  return getCachedFormatter(localeTags[locale], { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(date);
}

function ResultBadge({ result, locale, compact = false }: { result: AccumulatorResult; locale: Locale; compact?: boolean }) {
  const Icon = result === "WON" ? CircleCheck : result === "LOST" ? CircleX : result === "VOID" ? CircleMinus : Clock3;
  const common = getMessages(locale).common;
  const label = result === "WON" ? common.won : result === "LOST" ? common.lost : result === "VOID" ? common.void : common.pending;
  return (
    <span className={`${styles.resultBadge} ${styles[`result${result}`]} ${compact ? styles.resultCompact : ""}`}>
      <Icon size={compact ? 13 : 15} /> {label}
    </span>
  );
}

function Crest({
  name,
  shortName,
  emblemUrl,
  colors,
}: {
  name: string;
  shortName: string | null;
  emblemUrl: string | null;
  colors?: [string, string];
}) {
  const [failed, setFailed] = useState(false);
  const initials = (shortName || name).slice(0, 2).toUpperCase();
  return (
    <span
      className={styles.crest}
      aria-hidden="true"
      style={
        colors
          ? ({ "--crest-c1": colors[0], "--crest-c2": colors[1] } as React.CSSProperties)
          : undefined
      }
    >
      {emblemUrl && !failed ? (
        <Image
          src={emblemUrl}
          alt=""
          width={28}
          height={28}
          sizes="28px"
          className={styles.crestImage}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.crestInitials}>{initials}</span>
      )}
    </span>
  );
}

function LegCard({
  leg,
  locale,
  showDate,
  labels,
}: {
  leg: AccumulatorLeg;
  locale: Locale;
  showDate: boolean;
  labels: AccumulatorLabels;
}) {
  const kickoff = new Date(leg.fixture.kickoffAt);
  const identity = leg.fixture.identity;
  const competition = identity?.competition.name ?? leg.fixture.competition;
  const country = identity?.competition.country ?? leg.fixture.country;
  const compEmblem = identity?.competition.emblemUrl;
  const countryFlag = identity?.competition.countryFlagUrl;
  const home = identity?.homeTeam ?? { name: leg.fixture.homeTeam, shortName: leg.fixture.homeShortName, emblemUrl: null };
  const away = identity?.awayTeam ?? { name: leg.fixture.awayTeam, shortName: leg.fixture.awayShortName, emblemUrl: null };

  const matchHref = leg.fixture.slug
    ? `/${locale}/match/${leg.fixture.slug}`
    : buildPublicMatchPath({
        locale,
        fixtureId: leg.fixture.id,
        homeName: home.name,
        awayName: away.name,
      });

  const hasScore = Boolean(
    leg.fixture.score &&
    leg.fixture.score.home !== null &&
    leg.fixture.score.away !== null &&
    typeof leg.fixture.score.home === "number" &&
    typeof leg.fixture.score.away === "number"
  );
  const isFinished = leg.fixture.statusCode === "FT" || leg.fixture.statusCode === "AET" || leg.fixture.statusCode === "PEN";
  const isLive = ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(leg.fixture.statusCode);

  const settlementEvidenceText = useMemo(() => {
    if (!leg.settlementEvidence) return null;
    if (typeof leg.settlementEvidence === "string") return leg.settlementEvidence;
    if (typeof leg.settlementEvidence === "object") {
      const parts: string[] = [];
      if (leg.settlementEvidence.reason) {
        parts.push(leg.settlementEvidence.reason.replace(/_/g, " "));
      }
      if (leg.settlementEvidence.fixtureStatus) {
        parts.push(`(${leg.settlementEvidence.fixtureStatus})`);
      }
      return parts.join(" ") || null;
    }
    return null;
  }, [leg.settlementEvidence]);

  return (
    <>
      {showDate && <div className={styles.legDate}>{formatLegDate(locale, kickoff)}</div>}
      <article className={styles.legCard}>
        {/* Card Header: Position, League info, Kickoff / Live / Score & Outcome */}
        <header className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <span className={styles.legPosition} title={`${labels.selection} #${leg.position}`}>
              {leg.position}
            </span>
            <div className={styles.competitionBadge} title={`${country} · ${competition}`}>
              {compEmblem ? (
                <span className={styles.compEmblemWrap} aria-hidden="true">
                  <Image src={compEmblem} alt="" width={16} height={16} sizes="16px" className={styles.compEmblemImg} />
                </span>
              ) : countryFlag ? (
                <span className={styles.compEmblemWrap} aria-hidden="true">
                  <Image src={countryFlag} alt="" width={16} height={12} sizes="16px" className={styles.compEmblemImg} />
                </span>
              ) : null}
              <span className={styles.competitionText}>
                {country ? `${country} · ${competition}` : competition}
              </span>
            </div>
          </div>
          <div className={styles.cardHeaderRight}>
            {isLive ? (
              <span className={styles.liveBadge} title="Match Live">
                <span className={styles.liveDot} />
                <span>LIVE {leg.fixture.statusCode !== "LIVE" ? leg.fixture.statusCode : ""}</span>
              </span>
            ) : (
              <time className={styles.kickoffTime} dateTime={leg.fixture.kickoffAt}>
                <Clock3 size={12} aria-hidden="true" />
                <span>{formatLegTime(locale, kickoff)}</span>
              </time>
            )}

            {hasScore && (
              <span className={styles.scoreBadge} title={isFinished ? "Full Time" : "Match Score"}>
                {isFinished && <small>FT</small>}
                <strong>{leg.fixture.score?.home} - {leg.fixture.score?.away}</strong>
              </span>
            )}
            <ResultBadge result={leg.result} locale={locale} compact />
          </div>
        </header>

        {/* Card Body: Teams Matchup */}
        <Link
          href={matchHref}
          className={styles.matchupRow}
          aria-label={labels.openMatch.replace("{home}", home.name).replace("{away}", away.name)}
        >
          <div className={styles.teamHome}>
            <span className={styles.teamName}>{home.name}</span>
            <Crest name={home.name} shortName={home.shortName} emblemUrl={home.emblemUrl} colors={leg.fixture.homeColors} />
          </div>
          <div className={styles.matchupDivider}>
            {hasScore ? (
              <span className={styles.matchScoreMiddle}>
                {leg.fixture.score?.home} : {leg.fixture.score?.away}
              </span>
            ) : (
              <span className={styles.vsBadge}>VS</span>
            )}
          </div>
          <div className={styles.teamAway}>
            <Crest name={away.name} shortName={away.shortName} emblemUrl={away.emblemUrl} colors={leg.fixture.awayColors} />
            <span className={styles.teamName}>{away.name}</span>
          </div>
        </Link>

        {/* Card Intelligence: Clean Selection Pill, Tier, Tabular Confidence, Decimal Odds & Match Link */}
        <div className={styles.intelligenceBar}>
          <div className={styles.selectionGroup}>
            <span className={styles.selectionTag}>{labels.selection}</span>
            <strong className={styles.selectionPill}>
              <Target size={13} className={styles.selectionIcon} aria-hidden="true" />
              <span>{leg.selectionLabel}</span>
            </strong>
            <span
              className={`${styles.tierBadge} ${styles[`tier_${leg.prediction.qualityTier.toLowerCase()}`] || ""}`}
              title={`${labels.quality}: ${leg.prediction.qualityTier}`}
            >
              <span className={styles.tierDot} />
              {leg.prediction.qualityTier}
            </span>
          </div>

          <div className={styles.evidenceGroup}>
            <div className={styles.confidenceChip} title={labels.confidenceTitle}>
              <span className={styles.confLabel}>{labels.confidence}</span>
              <strong className={styles.confValue}>{leg.prediction.confidenceScore}%</strong>
            </div>

            <div className={styles.oddsChip} title={labels.oddsSnapshot}>
              <span className={styles.oddsLabel}>{labels.odds}</span>
              <strong className={styles.oddsValue}>{leg.decimalOdds.toFixed(2)}</strong>
            </div>

            <Link
              href={matchHref}
              className={styles.matchDetailLink}
              title={labels.viewMatchDetails}
              aria-label={labels.viewMatchDetails}
            >
              <span>{labels.viewMatchDetails}</span>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Settlement Evidence if settled */}
        {settlementEvidenceText && (
          <div className={styles.settlementEvidence}>
            <ShieldCheck size={13} className={styles.settlementIcon} aria-hidden="true" />
            <span>{settlementEvidenceText}</span>
          </div>
        )}
      </article>
    </>
  );
}

const LegRow = LegCard;

function Summary({
  accumulator,
  labels,
  locale,
  onCopySlip,
  isCopied,
}: {
  accumulator: Accumulator;
  labels: AccumulatorLabels;
  locale: Locale;
  onCopySlip: () => void;
  isCopied: boolean;
}) {
  const published = new Date(accumulator.publishedAt);
  return (
    <section className={styles.summaryPanel}>
      <header>
        <div className={styles.summaryHeaderLeft}>
          <span>{accumulator.scope === "DAILY" ? labels.daily : labels.weekly}</span>
          <strong>{labels.option} {accumulator.variant}</strong>
        </div>
        <button
          type="button"
          onClick={onCopySlip}
          className={`${styles.copySlipButton} ${isCopied ? styles.copySlipButtonCopied : ""}`}
          title={isCopied ? labels.slipCopied : labels.copySlip}
          aria-label={isCopied ? labels.slipCopied : labels.copySlip}
        >
          {isCopied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          <span>{isCopied ? labels.slipCopied : labels.copySlip}</span>
        </button>
      </header>
      <div className={styles.summaryMain}>
        <div className={styles.targetMetric}>
          <span>{labels.target}</span>
          <strong>{accumulator.targetLabel}</strong>
          <small>{labels.publishedBand}</small>
        </div>
        <div className={styles.totalMetric}>
          <span>{labels.actualTotal}</span>
          <strong>{accumulator.totalOdds.toFixed(2)}</strong>
          <small>{accumulator.legs.length} {labels.selections}</small>
        </div>
        <div className={styles.confidenceMetric}>
          <span>{labels.averageConfidence}</span>
          <strong>{accumulator.averageConfidence}%</strong>
          <small>{labels.arithmeticAverage}</small>
        </div>
        <div className={styles.summaryStatus}>
          <ResultBadge result={accumulator.result} locale={locale} />
          <span>
            {labels.published} {formatSummaryDate(locale, published, accumulator.timezone)}, {formatSummaryTime(locale, published, accumulator.timezone)}
          </span>
        </div>
      </div>
    </section>
  );
}

function getLabels(locale: Locale) {
  return localizedAccumulatorLabels[locale];
}

function HistoryDrawer({ history, onClose, locale }: { history: AccumulatorHistoryItem[]; onClose: () => void; locale: Locale }) {
  const labels = getLabels(locale);
  const common = getMessages(locale).common;
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "DAILY" | "WEEKLY">("ALL");
  const [resultFilter, setResultFilter] = useState<"ALL" | "WON" | "LOST" | "VOID">("ALL");
  const [oddsFilter, setOddsFilter] = useState<string>("ALL");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const oddsLabels = useMemo(() => {
    const labelsSet = new Set(history.map((item) => item.targetLabel));
    return Array.from(labelsSet);
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (scopeFilter !== "ALL" && item.scope !== scopeFilter) return false;
      if (resultFilter !== "ALL" && item.result !== resultFilter) return false;
      if (oddsFilter !== "ALL" && item.targetLabel !== oddsFilter) return false;
      return true;
    });
  }, [history, scopeFilter, resultFilter, oddsFilter]);

  return (
    <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={labels.accaResults}>
      <header>
        <div>
          <span>{labels.trustHistory}</span>
          <h2>{labels.accaResults}</h2>
        </div>
        <button onClick={onClose} aria-label={labels.closeResults}><X size={19} /></button>
      </header>
      <div className={styles.historyFilters}>
        <select
          value={scopeFilter}
          onChange={(event) => setScopeFilter(event.target.value as "ALL" | "DAILY" | "WEEKLY")}
          aria-label={labels.historyScope}
        >
          <option value="ALL">{labels.dailyWeekly}</option>
          <option value="DAILY">{labels.daily}</option>
          <option value="WEEKLY">{labels.weekly}</option>
        </select>
        <select
          value={resultFilter}
          onChange={(event) => setResultFilter(event.target.value as "ALL" | "WON" | "LOST" | "VOID")}
          aria-label={labels.historyResult}
        >
          <option value="ALL">{labels.allResults}</option>
          <option value="WON">{common.won}</option>
          <option value="LOST">{common.lost}</option>
          <option value="VOID">{common.void}</option>
        </select>
        <select
          value={oddsFilter}
          onChange={(event) => setOddsFilter(event.target.value)}
          aria-label={labels.historyOdds}
        >
          <option value="ALL">{labels.allOdds}</option>
          {oddsLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.historyList}>
        {filteredHistory.length === 0 ? (
          <p className={styles.historyEmpty}>{labels.noQualifyingToday.replace("{band}", "")}</p>
        ) : (
          filteredHistory.map((item) => (
            <article key={item.id}>
              <div>
                <span>{item.scope === "DAILY" ? labels.daily : labels.weekly}</span>
                <strong>{item.targetLabel} / {labels.option} {item.variant}</strong>
                <small>{formatHistoryDate(locale, new Date(item.date))}</small>
              </div>
              <div>
                <strong>{item.totalOdds.toFixed(2)}</strong>
                <ResultBadge result={item.result} locale={locale} compact />
              </div>
              <footer>
                {item.wonLegs} {common.won.toLowerCase()} / {item.lostLegs} {common.lost.toLowerCase()} / {item.voidLegs} {common.void.toLowerCase()}
              </footer>
            </article>
          ))
        )}
      </div>
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
  const [copiedSlipId, setCopiedSlipId] = useState<string | null>(null);
  const data = scope === "DAILY" ? daily : weekly;
  const normalizedQuery = query.trim().toLocaleLowerCase(localeTags[locale]);
  const visibleItems = useMemo(
    () =>
      normalizedQuery
        ? data.items.filter((item) =>
            item.legs.some((leg) =>
              [
                leg.fixture.identity?.homeTeam.name ?? leg.fixture.homeTeam,
                leg.fixture.identity?.awayTeam.name ?? leg.fixture.awayTeam,
                leg.fixture.identity?.competition.name ?? leg.fixture.competition,
                leg.selectionLabel,
              ].some((value) => value.toLocaleLowerCase(localeTags[locale]).includes(normalizedQuery))
            )
          )
        : data.items,
    [data.items, locale, normalizedQuery]
  );
  const variants = useMemo(() => visibleItems.filter((item) => item.targetBand === band), [band, visibleItems]);
  const selected = variants.find((item) => item.variant === variant) ?? variants[0];

  const handleCopySlip = () => {
    if (!selected) return;
    const header = `MyBetOracle Multi-Picks • Option ${selected.variant} (${selected.targetLabel})\nTotal Odds: ${selected.totalOdds.toFixed(2)} • ${selected.legs.length} Selections\n───────────────────────────────`;
    const lines = selected.legs.map((leg, i) => {
      const homeName = leg.fixture.identity?.homeTeam.name ?? leg.fixture.homeTeam;
      const awayName = leg.fixture.identity?.awayTeam.name ?? leg.fixture.awayTeam;
      return `${i + 1}. ${homeName} vs ${awayName}\n   Pick: ${leg.selectionLabel} (@ ${leg.decimalOdds.toFixed(2)}) • Conf: ${leg.prediction.confidenceScore}%`;
    });
    const currentUrl = typeof window !== "undefined" ? window.location.href : `https://www.mybetoracle.com/${locale}/multi-picks`;
    const footer = `───────────────────────────────\n${currentUrl}`;
    const fullText = [header, ...lines, footer].join("\n");

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullText).then(() => {
        setCopiedSlipId(selected.id);
        setTimeout(() => setCopiedSlipId(null), 2500);
      }).catch(() => {});
    }
  };

  function navigate(route?: string) {
    if (route) router.push(`/${locale}/${route}`);
  }
  function switchLocale(nextLocale: string) {
    if (locales.includes(nextLocale as Locale)) router.push(`/${nextLocale}/multi-picks?date=${data.date}`);
  }
  function changeScope(next: AccumulatorScope) {
    setScope(next);
    setBand("ODDS_5");
    setVariant(1);
  }
  function changeDate(days: number) {
    const next = new Date(`${data.date}T12:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + days);
    router.push(`/${locale}/multi-picks?date=${next.toISOString().slice(0, 10)}`);
  }

  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button className={`${shellStyles.brand} ${styles.brandButton}`} onClick={() => navigate("today")} aria-label={`MyBetOracle ${common.today}`}>
            <MboMark className={shellStyles.brandMark} title="MyBetOracle" />
            <span className={shellStyles.brandName}>MyBetOracle</span>
          </button>
          <label className={shellStyles.globalSearch}>
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchPlaceholder} />
            <kbd>Ctrl K</kbd>
          </label>
          <div className={shellStyles.topbarActions}>
            <button className={shellStyles.topIconButton} aria-label={common.notifications} onClick={() => navigate("saved")}>
              <Bell size={19} />
            </button>
            <label className={shellStyles.localeSelect}>
              <Languages size={18} />
              <select value={locale} onChange={(event) => switchLocale(event.target.value)} aria-label={common.language}>
                {locales.map((item) => (
                  <option value={item} key={item}>
                    {localeNames[item]}
                  </option>
                ))}
              </select>
            </label>
            <button className={shellStyles.avatarButton} aria-label={common.profile} onClick={() => navigate("profile")}>
              <UserCircle size={24} />
            </button>
            <button className={shellStyles.mobileMenuButton} onClick={() => setMobileMenuOpen((current) => !current)} aria-label={common.openNavigation}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      {mobileMenuOpen && <MobileProductMenu locale={locale} activeRoute="multi-picks" onNavigate={() => setMobileMenuOpen(false)} />}

      <div className={shellStyles.shell}>
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav} aria-label={common.primaryNavigation}>
            {navItems.map(({ key, icon: Icon, route }) => (
              <button key={key} className={key === "accas" ? shellStyles.navActive : ""} onClick={() => navigate(route)}>
                <Icon size={19} />
                <span>{common[key]}</span>
              </button>
            ))}
          </nav>
          <div className={shellStyles.sidebarSection}>
            <div className={shellStyles.sidebarHeading}>
              <span>{labels.sectionTitle}</span>
            </div>
            <button className={`${styles.toolLink} ${styles.toolLinkActive}`}>
              {labels.publishedAccas}
              <ChevronRight size={14} />
            </button>
            <button className={styles.toolLink} onClick={() => navigate("multi-picks/builder")}>
              {labels.buildMyAcca}
              <ChevronRight size={14} />
            </button>
            <button className={styles.toolLink} onClick={() => navigate("pick-analyzer")}>
              {labels.pickAnalyzer}
              <ChevronRight size={14} />
            </button>
          </div>
          <div className={shellStyles.sidebarFooter}>
            <button onClick={() => navigate("competitions")}>
              <Globe2 size={17} /> {common.allCompetitions}
            </button>
            <button onClick={() => navigate("responsible-play")}>
              <ShieldCheck size={17} /> {common.responsiblePlay}
            </button>
          </div>
        </aside>

        <main className={`${shellStyles.main} ${styles.main}`}>
          <header className={styles.pageHeader}>
            <div className={styles.headerTitleGroup}>
              <h1 className={styles.pageTitle}>{labels.title}</h1>
              <p className={styles.pageSubtitle}>{labels.subtitle}</p>
            </div>
            {data.history.length > 0 && (
              <div className={styles.headerActions}>
                <button onClick={() => setHistoryOpen(true)}>
                  <History size={16} /> {labels.history}
                </button>
              </div>
            )}
          </header>

          <section className={styles.periodBar}>
            <div className={styles.scopeSwitch}>
              <button className={scope === "DAILY" ? styles.scopeActive : ""} onClick={() => changeScope("DAILY")}>
                {labels.daily}
              </button>
              <button className={scope === "WEEKLY" ? styles.scopeActive : ""} onClick={() => changeScope("WEEKLY")}>
                {labels.weekly}
              </button>
            </div>
            <div className={styles.dateControl}>
              <button onClick={() => changeDate(scope === "WEEKLY" ? -7 : -1)} aria-label={labels.previousDate}>
                <ChevronLeft size={17} />
              </button>
              <span>
                <CalendarDays size={15} />
                <strong>
                  {scope === "DAILY"
                    ? formatPeriodDate(locale, new Date(data.date))
                    : `${formatPeriodDate(locale, new Date(data.windowStart))} - ${formatPeriodDate(locale, new Date(data.windowEnd))}`}
                </strong>
                <small>{data.timezone}</small>
              </span>
              <button onClick={() => changeDate(scope === "WEEKLY" ? 7 : 1)} aria-label={labels.nextDate}>
                <ChevronRight size={17} />
              </button>
            </div>
          </section>

          <div className={styles.adLeaderboardWrapper}>
            <AdSlot format="leaderboard" label={labels.advertisement} />
          </div>

          <section className={styles.bandSection}>
            <header>
              <div>
                <h2>{labels.targetOdds}</h2>
                <span>{labels.selectBand}</span>
              </div>
              <small>{visibleItems.length} {labels.optionsAvailable}</small>
            </header>
            <div className={styles.bandGrid}>
              {data.bands.map((item) => {
                const count = visibleItems.filter((entry) => entry.targetBand === item.key).length;
                return (
                  <button
                    key={item.key}
                    className={`${band === item.key ? styles.bandActive : ""} ${count === 0 ? styles.bandUnavailable : ""}`}
                    onClick={() => {
                      setBand(item.key);
                      setVariant(1);
                    }}
                  >
                    <strong>{item.label}</strong>
                    <span>{count > 0 ? `${count} ${count === 1 ? labels.optionSingular : labels.optionPlural}` : labels.unavailable}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {selected ? (
            <>
              <nav className={styles.variantTabs} aria-label={labels.accaOptions}>
                {variants.map((item) => (
                  <button key={item.id} className={selected.id === item.id ? styles.variantActive : ""} onClick={() => setVariant(item.variant)}>
                    {labels.option} {item.variant}
                    <span>{item.totalOdds.toFixed(2)}</span>
                  </button>
                ))}
              </nav>
              <Summary
                accumulator={selected}
                labels={labels}
                locale={locale}
                onCopySlip={handleCopySlip}
                isCopied={copiedSlipId === selected.id}
              />
              <section className={styles.legsSection}>
                <header>
                  <div>
                    <h2>{labels.selection}</h2>
                    <span>{selected.legs.length} {labels.selections}</span>
                  </div>
                </header>
                <div className={styles.legsList}>
                  {selected.legs.map((item, index) => {
                    const previous = selected.legs[index - 1];
                    const showDate =
                      scope === "WEEKLY" &&
                      (!previous || new Date(previous.fixture.kickoffAt).toDateString() !== new Date(item.fixture.kickoffAt).toDateString());
                    return (
                      <Fragment key={item.id}>
                        {index === 2 && selected.legs.length >= 4 && (
                          <div className={styles.adInFeedWrapper}>
                            <AdSlot format="in-feed" label={labels.advertisement} />
                          </div>
                        )}
                        <LegCard leg={item} locale={locale} labels={labels} showDate={showDate} />
                      </Fragment>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className={styles.emptyState}>
              <Database size={23} />
              <h2>{(scope === "DAILY" ? labels.noQualifyingToday : labels.noQualifyingWeek).replace("{band}", data.bands.find((item) => item.key === band)?.label ?? "")}</h2>
              <p>{labels.emptyExplanation}</p>
              <button
                disabled={!data.bands.some((item) => data.items.some((entry) => entry.targetBand === item.key))}
                onClick={() => {
                  const available = data.bands.find((item) => data.items.some((entry) => entry.targetBand === item.key));
                  if (available) setBand(available.key);
                }}
              >
                {labels.lowerOdds}
              </button>
            </section>
          )}

          {/* Editorial Methodology & Educational SEO Architecture */}
          <section className={styles.methodologySection} aria-labelledby="methodology-heading">
            <header className={styles.methodologyHeader}>
              <h2 id="methodology-heading" className={styles.methodologyTitle}>
                {labels.methodologyHeading || "Football Intelligence & Multi-Pick Methodology"}
              </h2>
              <p className={styles.methodologyIntro}>
                {labels.methodologyIntro || "Every published Multi-Pick on MyBetOracle represents an algorithmic combination of individual match predictions, filtered through strict probability, expected value, and multi-factor risk mitigation."}
              </p>
            </header>

            <div className={styles.methodologyGrid}>
              <article className={styles.methodologyCard}>
                <h3>
                  <ShieldCheck size={14} aria-hidden="true" />
                  <span>{labels.eligibilityTitle || "Eligibility First"}</span>
                </h3>
                <p>{labels.eligibilityText || "Only active MIXED predictions with sufficient data, publication eligibility and confidence of at least 72 can be included."}</p>
              </article>

              <article className={styles.methodologyCard}>
                <h3>
                  <Target size={14} aria-hidden="true" />
                  <span>{labels.marketsExplainedTitle || "Supported Markets & Structure"}</span>
                </h3>
                <p>{labels.marketsExplainedText || "Multi-Picks focus exclusively on high-liquidity football markets: Full-Time Result (1X2), Double Chance (1X, X2, 12), Over/Under Total Goals, Both Teams to Score (BTTS), and Team Totals."}</p>
              </article>

              <article className={styles.methodologyCard}>
                <h3>
                  <CircleCheck size={14} aria-hidden="true" />
                  <span>{labels.settlementAuditTitle || "Deterministic Settlement"}</span>
                </h3>
                <p>{labels.settlementAuditText || "All selections are settled deterministically against official full-time match results immediately upon conclusion. If a fixture is voided, odds adjust multiplicatively."}</p>
              </article>

              <article className={styles.methodologyCard}>
                <h3>
                  <Database size={14} aria-hidden="true" />
                  <span>{labels.verifiedOddsTitle || "Verified Odds"}</span>
                </h3>
                <p>{labels.verifiedOddsText || "Every selection requires exact pre-match recorded odds from the completed Multi-Pick capture run."}</p>
              </article>

              <article className={styles.methodologyCard}>
                <h3>
                  <Layers size={14} aria-hidden="true" />
                  <span>{labels.optimizationTitle || "Quality Optimization"}</span>
                </h3>
                <p>{labels.optimizationText || "Combinations favour stronger average confidence, closeness to the target band and fewer unnecessary selections."}</p>
              </article>

              <article className={styles.methodologyCard}>
                <h3>
                  <Clock3 size={14} aria-hidden="true" />
                  <span>{labels.immutableTitle || "Immutable Publication"}</span>
                </h3>
                <p>{labels.immutableText || "Selection odds and total odds are frozen when published. Later source changes do not alter the Multi-Pick."}</p>
              </article>
            </div>

            <footer className={styles.methodologyNotice}>
              <p>{labels.methodNotice || "Average selection confidence is not the probability that the complete Multi-Pick will win. Options are alternatives, not guarantees."}</p>
            </footer>
          </section>
        </main>

        <aside className={`${shellStyles.intelligenceRail} ${styles.intelligenceRail}`}>
          <section className={styles.railPanel}>
            <header>
              <span>{labels.recentResults}</span>
              <Trophy size={15} />
            </header>
            <div className={styles.recentResults}>
              {data.history.map((item) => (
                <button key={item.id} onClick={() => setHistoryOpen(true)}>
                  <span>
                    <strong>{item.targetLabel} / {labels.option} {item.variant}</strong>
                    <small>{item.scope === "DAILY" ? labels.daily : labels.weekly} / {item.totalOdds.toFixed(2)}</small>
                  </span>
                  <ResultBadge result={item.result} locale={locale} compact />
                </button>
              ))}
            </div>
            <button className={styles.railAction} onClick={() => router.push(`/${locale}/results`)}>
              {labels.completeHistory} <ChevronRight size={15} />
            </button>
          </section>
          <div className={styles.adRailWrapper}>
            <AdSlot format="rectangle" label={labels.advertisement} />
          </div>
          <section className={`${styles.railPanel} ${styles.uncertaintyPanel}`}>
            <header>
              <span>{labels.responsibleUncertainty}</span>
              <ShieldCheck size={15} />
            </header>
            <p>{labels.uncertaintyCopy}</p>
          </section>
        </aside>
      </div>

      <div className={styles.mobileAnchorWrapper}>
        <AdSlot format="mobile-anchor" label={labels.advertisement} />
      </div>

      <nav className={shellStyles.mobileBottomNav} aria-label={common.mobileNavigation}>
        {navItems.slice(0, 5).map(({ key, icon: Icon, route }) => (
          <button key={key} className={key === "accas" ? shellStyles.mobileNavActive : ""} onClick={() => navigate(route)}>
            <Icon size={19} />
            <span>{common[key]}</span>
          </button>
        ))}
      </nav>
      {historyOpen && <div className={styles.drawerScrim} onClick={() => setHistoryOpen(false)} aria-hidden="true" />}
      {historyOpen && <HistoryDrawer history={data.history} onClose={() => setHistoryOpen(false)} locale={locale} />}
    </div>
  );
}
