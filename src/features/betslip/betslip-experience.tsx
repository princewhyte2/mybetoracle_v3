"use client";

import {
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Compass,
  Home,
  Languages,
  Menu,
  ReceiptText,
  Search,
  Share2,
  ShieldCheck,
  Trophy,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import shellStyles from "@/features/today/today-experience.module.css";
import { locales, type Locale } from "@/i18n/config";
import type {
  AccumulatorLeg,
  AccumulatorResult,
} from "@/features/accumulators/types";
import type { DailyBetslip } from "./types";
import styles from "./betslip.module.css";

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  pt: "Portugues",
};
const navItems = [
  { label: "Today", icon: Home, route: "today" },
  { label: "Explore", icon: Compass, route: "explore" },
  { label: "Multi-Picks", icon: WandSparkles, route: "multi-picks" },
  { label: "Results", icon: BarChart3, route: "results" },
  { label: "Saved", icon: Bookmark, route: "saved" },
  { label: "Oracle Daily", icon: ReceiptText, route: "betslip" },
] as const;

function Status({ result }: { result: AccumulatorResult }) {
  const Icon =
    result === "WON"
      ? CircleCheck
      : result === "LOST"
        ? CircleX
        : result === "PENDING"
          ? CalendarDays
          : ShieldCheck;
  return (
    <span className={`${styles.status} ${styles[`status${result}`]}`}>
      <Icon size={13} />
      {result.charAt(0) + result.slice(1).toLowerCase()}
    </span>
  );
}

function Crest({ leg, side }: { leg: AccumulatorLeg; side: "home" | "away" }) {
  const shortName =
    side === "home" ? leg.fixture.homeShortName : leg.fixture.awayShortName;
  const teamName =
    side === "home" ? leg.fixture.homeTeam : leg.fixture.awayTeam;
  const colors =
    side === "home" ? leg.fixture.homeColors : leg.fixture.awayColors;
  return (
    <span
      className={styles.crest}
      style={
        {
          "--crest-primary": colors[0],
          "--crest-secondary": colors[1],
        } as React.CSSProperties
      }
    >
      {(shortName || teamName).slice(0, 2).toUpperCase()}
    </span>
  );
}

function LegRow({
  leg,
  locale,
  onOpen,
}: {
  leg: AccumulatorLeg;
  locale: Locale;
  onOpen: () => void;
}) {
  const kickoff = new Date(leg.fixture.kickoffAt);
  return (
    <article className={styles.legRow}>
      <span className={styles.position}>{leg.position}</span>
      <button className={styles.fixture} onClick={onOpen}>
        <small>
          {leg.fixture.country} / {leg.fixture.competition} ·{" "}
          {new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
          }).format(kickoff)}
        </small>
        <span>
          <Crest leg={leg} side="home" />
          {leg.fixture.homeTeam}
          <i>vs</i>
          {leg.fixture.awayTeam}
          <Crest leg={leg} side="away" />
        </span>
      </button>
      <div className={styles.pick}>
        <small>Selection</small>
        <strong>{leg.selectionLabel}</strong>
        <span>{leg.marketType === "mixed" ? "Mixed" : "Regular"}</span>
      </div>
      <div className={styles.confidence}>
        <small>Oracle</small>
        <strong>{leg.prediction.confidenceScore}</strong>
      </div>
      <div className={styles.odds}>
        <small>Odds</small>
        <strong>{leg.decimalOdds.toFixed(2)}</strong>
      </div>
      <Status result={leg.result} />
      <button
        className={styles.open}
        onClick={onOpen}
        aria-label={`Open ${leg.fixture.homeTeam} versus ${leg.fixture.awayTeam}`}
      >
        <ChevronRight size={16} />
      </button>
    </article>
  );
}

export function BetslipExperience({
  data,
  locale,
}: {
  data: DailyBetslip;
  locale: Locale;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = (route: string) => router.push(`/${locale}/${route}`);
  const date = new Date(`${data.date}T12:00:00Z`);
  const generated = new Date(data.generatedAt);
  const averageOracle = Math.round(
    data.legs.reduce((sum, leg) => sum + leg.prediction.confidenceScore, 0) /
      data.legs.length,
  );

  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button
            className={`${shellStyles.brand} ${styles.brand}`}
            onClick={() => navigate("today")}
          >
            <MboMark className={shellStyles.brandMark} title="MyBetOracle" />
            <span className={shellStyles.brandName}>MyBetOracle</span>
          </button>
          <label className={shellStyles.globalSearch}>
            <Search size={18} />
            <input placeholder="Search teams, leagues or picks" />
            <span>Ctrl K</span>
          </label>
          <div className={shellStyles.topbarActions}>
            <button
              className={shellStyles.topIconButton}
              aria-label="Notifications"
              onClick={() => navigate("saved")}
            >
              <Bell size={19} />
            </button>
            <label className={shellStyles.localeSelect}>
              <Languages size={18} />
              <select
                value={locale}
                onChange={(event) =>
                  router.push(`/${event.target.value}/betslip`)
                }
                aria-label="Language"
              >
                {locales.map((item) => (
                  <option key={item} value={item}>
                    {localeNames[item]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={shellStyles.avatarButton}
              aria-label="Profile"
              onClick={() => navigate("profile")}
            >
              <UserCircle size={24} />
            </button>
            <button
              className={shellStyles.mobileMenuButton}
              aria-label="Open navigation"
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <MobileProductMenu
          locale={locale}
          activeRoute="betslip"
          onNavigate={() => setMenuOpen(false)}
        />
      )}

      <div className={shellStyles.shell}>
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav} aria-label="Primary">
            {navItems.map(({ label, icon: Icon, route }) => (
              <button
                key={route}
                className={label === "Oracle Daily" ? shellStyles.navActive : ""}
                onClick={() => navigate(route)}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className={shellStyles.sidebarSection}>
            <div className={shellStyles.sidebarHeading}>
              <span>Oracle Daily</span>
            </div>
            <button className={`${styles.sideLink} ${styles.sideActive}`}>
              Today&apos;s slip
              <ChevronRight size={14} />
            </button>
            <button
              className={styles.sideLink}
              onClick={() => navigate("results")}
            >
              Past editions
              <ChevronRight size={14} />
            </button>
            <button
              className={styles.sideLink}
              onClick={() => navigate("multi-picks")}
            >
              Multi-Picks
              <ChevronRight size={14} />
            </button>
          </div>
        </aside>

        <main className={`${shellStyles.main} ${styles.main}`}>
          <header className={styles.pageHeader}>
            <div>
              <span>DAILY PUBLICATION</span>
              <h1>Oracle Daily</h1>
              <p>
                One focused daily combination from regular and mixed Oracle
                markets.
              </p>
            </div>
            <div>
              <button
                onClick={() => setSaved((current) => !current)}
                className={saved ? styles.saved : ""}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Save"}
              </button>
              <button>
                <Share2 size={16} />
                Share
              </button>
            </div>
          </header>

          <section className={styles.dateBar}>
            <button aria-label="Previous date">
              <ChevronLeft size={17} />
            </button>
            <span>
              <CalendarDays size={16} />
              <strong>
                {new Intl.DateTimeFormat(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(date)}
              </strong>
              <small>{data.timezone}</small>
            </span>
            <button aria-label="Next date">
              <ChevronRight size={17} />
            </button>
          </section>

          <section className={styles.slipSummary}>
            <header>
              <span>
                <ReceiptText size={15} />
                Oracle Daily
              </span>
              <Status result={data.result} />
            </header>
            <div>
              <section>
                <small>Total odds</small>
                <strong>{data.totalOdds.toFixed(2)}</strong>
                <span>
                  Target {data.targetMinimum.toFixed(2)}–
                  {data.targetMaximum.toFixed(2)}
                </span>
              </section>
              <section>
                <small>Selections</small>
                <strong>{data.legs.length}</strong>
                <span>One pick per fixture</span>
              </section>
              <section>
                <small>Average Oracle</small>
                <strong>{averageOracle}</strong>
                <span>Leg average</span>
              </section>
              <section>
                <small>Published</small>
                <strong>
                  {new Intl.DateTimeFormat(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(generated)}
                </strong>
                <span>Odds snapshot</span>
              </section>
            </div>
            <footer>
              <ShieldCheck size={14} /> Published selections and odds remain
              unchanged after kickoff.
            </footer>
          </section>

          <section className={styles.legs}>
            <header>
              <div>
                <h2>Selections</h2>
                <span>{data.legs.length} fixtures</span>
              </div>
              <small>SportyBet reference odds</small>
            </header>
            <div>
              {data.legs.map((leg) => (
                <LegRow
                  key={leg.id}
                  leg={leg}
                  locale={locale}
                  onOpen={() => navigate(`match/${leg.fixture.slug}`)}
                />
              ))}
            </div>
          </section>
        </main>

        <aside className={`${shellStyles.intelligenceRail} ${styles.rail}`}>
          <section>
            <header>
              <span>Slip standard</span>
              <ShieldCheck size={15} />
            </header>
            <dl>
              <div>
                <dt>Target odds</dt>
                <dd>
                  {data.targetMinimum.toFixed(2)}–
                  {data.targetMaximum.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt>Markets</dt>
                <dd>Mixed, then regular</dd>
              </div>
              <div>
                <dt>Team overlap</dt>
                <dd>Not allowed</dd>
              </div>
              <div>
                <dt>Maximum legs</dt>
                <dd>6</dd>
              </div>
            </dl>
          </section>
          <section>
            <header>
              <span>Recent editions</span>
              <Trophy size={15} />
            </header>
            <div className={styles.history}>
              {data.history.map((item) => (
                <button key={item.id} onClick={() => navigate("results")}>
                  <span>
                    <strong>
                      {new Intl.DateTimeFormat(locale, {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(`${item.date}T12:00:00Z`))}
                    </strong>
                    <small>
                      {item.selections} picks · {item.totalOdds.toFixed(2)}
                    </small>
                  </span>
                  <Status result={item.result} />
                </button>
              ))}
            </div>
            <button
              className={styles.historyLink}
              onClick={() => navigate("results")}
            >
              View complete history
              <ChevronRight size={14} />
            </button>
          </section>
          <section className={styles.accaLink}>
            <span>More combinations</span>
            <strong>Daily and weekly Multi-Picks</strong>
            <button onClick={() => navigate("multi-picks")}>
              Open Multi-Picks
              <ChevronRight size={14} />
            </button>
          </section>
        </aside>
      </div>
      <nav
        className={shellStyles.mobileBottomNav}
        aria-label="Mobile navigation"
      >
        {navItems.slice(0, 5).map(({ label, icon: Icon, route }) => (
          <button key={route} onClick={() => navigate(route)}>
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
