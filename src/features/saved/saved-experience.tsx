"use client";

import {
  Bell,
  BellRing,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Copy,
  Globe2,
  Home,
  Languages,
  Menu,
  MessageCircle,
  ReceiptText,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  Star,
  Trophy,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import shellStyles from "@/features/today/today-experience.module.css";
import { locales, type Locale } from "@/i18n/config";
import { translateMarketSelection } from "@/i18n/football";
import { getMessages } from "@/i18n/messages";
import { getOracleDailyLabel } from "@/i18n/multi-pick-terminology";
import { savedFullLabels, type SavedFullLabels } from "./localized-labels";
import type {
  FollowedEntity,
  NotificationPreferences,
  SavedAccumulator,
  SavedData,
  SavedMatch,
} from "./types";
import styles from "./saved.module.css";

type Tab = "MATCHES" | "ACCUMULATORS" | "FOLLOWING" | "ALERTS";
type ShareItem = {
  title: string;
  subtitle: string;
  score: string;
  status: string;
};
const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  pt: "Portugues",
};
const navItems = [
  { label: "today", icon: Home, route: "today" },
  { label: "explore", icon: Compass, route: "explore" },
  { label: "accas", icon: WandSparkles, route: "multi-picks" },
  { label: "results", icon: Trophy, route: "results" },
  { label: "saved", icon: Bookmark, route: "saved" },
  { label: "betslip", icon: ReceiptText, route: "betslip" },
] as const;

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  );
}

function MatchRow({
  item,
  locale,
  onRemove,
  onAlert,
  onShare,
  copy,
}: {
  item: SavedMatch;
  locale: Locale;
  onRemove: () => void;
  onAlert: () => void;
  onShare: () => void;
  copy: SavedFullLabels;
}) {
  const router = useRouter();
  return (
    <article className={styles.matchRow}>
      <button
        className={styles.star}
        onClick={onRemove}
        title={copy.removeSaved}
      >
        <Star size={16} fill="currentColor" />
      </button>
      <button
        className={styles.matchIdentity}
        onClick={() => router.push(`/${locale}/match/${item.slug}`)}
      >
        <span>
          {item.countryCode} · {item.competition}
        </span>
        <strong>
          {item.homeTeam} <i>vs</i> {item.awayTeam}
        </strong>
        <small className={item.state === "LIVE" ? styles.live : ""}>
          {item.state === "LIVE"
              ? `${item.minute}' ${getMessages(locale).common.live}`
              : item.state === "SETTLED"
              ? copy.fullTime
              : new Intl.DateTimeFormat(locale, {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(item.kickoffAt))}
        </small>
      </button>
      <div className={styles.pick}>
        <span>{copy.oraclePick}</span>
        <strong>{translateMarketSelection(locale, item.selection)}</strong>
        <small>{item.odds.toFixed(2)} {copy.odds}</small>
      </div>
      <div className={styles.oracle}>
        <span>Oracle</span>
        <strong>{item.oracleScore}</strong>
      </div>
      {item.outcome ? (
        <span className={styles.won}>
          <Check size={14} />
          {copy.won}
        </span>
      ) : (
        <button
          className={`${styles.alertButton} ${item.alertEnabled ? styles.alertOn : ""}`}
          onClick={onAlert}
          title={item.alertEnabled ? copy.alertsOn : copy.enableAlerts}
        >
          {item.alertEnabled ? <BellRing size={17} /> : <Bell size={17} />}
        </button>
      )}
      <button
        className={styles.shareButton}
        onClick={onShare}
        title={copy.sharePick}
      >
        <Share2 size={16} />
      </button>
    </article>
  );
}

function AccumulatorRow({
  item,
  locale,
  onRemove,
  onShare,
  copy,
}: {
  item: SavedAccumulator;
  locale: Locale;
  onRemove: () => void;
  onShare: () => void;
  copy: SavedFullLabels;
}) {
  const router = useRouter();
  return (
    <article className={styles.accumulatorRow}>
      <button className={styles.star} onClick={onRemove}>
        <Bookmark size={16} fill="currentColor" />
      </button>
      <button
        className={styles.accuIdentity}
        onClick={() => router.push(`/${locale}/multi-picks`)}
      >
        <span>{item.scope === "DAILY" ? copy.daily : copy.weekly} MULTI-PICK</span>
        <strong>
          {item.targetLabel} · {copy.option} {item.variant}
        </strong>
        <small>{item.legs} {copy.selections}</small>
      </button>
      <div className={styles.progress}>
        <span>
          <b>{item.wonLegs}</b> / {item.legs} {copy.settledWon}
        </span>
        <i>
          <b style={{ width: `${(item.wonLegs / item.legs) * 100}%` }} />
        </i>
      </div>
      <div className={styles.total}>
        <span>{copy.totalOdds}</span>
        <strong>{item.totalOdds.toFixed(2)}</strong>
      </div>
      <div className={item.status === "WON" ? styles.won : styles.pending}>
        {item.status === "WON" ? <Check size={14} /> : <Clock3 size={14} />}{" "}
        {item.status === "WON"
          ? copy.won
          : item.nextKickoffAt
            ? new Intl.DateTimeFormat(locale, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(item.nextKickoffAt))
            : copy.pending}
      </div>
      <button className={styles.shareButton} onClick={onShare}>
        <Share2 size={16} />
      </button>
    </article>
  );
}

function FollowRow({
  item,
  onToggle,
  onRemove,
  copy,
}: {
  item: FollowedEntity;
  onToggle: () => void;
  onRemove: () => void;
  copy: SavedFullLabels;
}) {
  return (
    <article className={styles.followRow}>
      <span
        className={styles.entityMark}
        style={{ "--entity-color": item.color } as React.CSSProperties}
      >
        {item.shortCode.slice(0, 3)}
      </span>
      <div>
        <span>{item.type === "TEAM" ? copy.team : copy.competition}</span>
        <strong>{item.name}</strong>
        <small>
          {item.context} · {item.upcoming} {copy.upcoming}
        </small>
      </div>
      <label>
        <span>{copy.alerts}</span>
        <Toggle
          checked={item.alerts}
          onChange={onToggle}
          label={`${copy.alerts}: ${item.name}`}
        />
      </label>
      <button onClick={onRemove} title={copy.unfollow}>
        <X size={17} />
      </button>
    </article>
  );
}

function ShareSheet({
  item,
  onClose,
  copy,
}: {
  item: ShareItem;
  onClose: () => void;
  copy: SavedFullLabels;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <aside
        className={styles.shareSheet}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>{copy.sharePublication}</span>
            <h2>{copy.readyShare}</h2>
          </div>
          <button onClick={onClose}>
            <X size={19} />
          </button>
        </header>
        <div className={styles.sharePreview}>
          <div>
            <MboMark title="MyBetOracle" />
            <strong>MyBetOracle</strong>
            <span>{copy.verifiedPublication}</span>
          </div>
          <small>{item.status}</small>
          <h3>{item.title}</h3>
          <p>{item.subtitle}</p>
          <footer>
            <span>{item.score}</span>
            <ShieldCheck size={17} />
          </footer>
        </div>
        <div className={styles.shareActions}>
          <button>
            <MessageCircle size={18} />
            <span>WhatsApp</span>
          </button>
          <button>
            <Share2 size={18} />
            <span>Telegram</span>
          </button>
          <button onClick={() => setCopied(true)}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? copy.copied : copy.copyLink}</span>
          </button>
        </div>
        <p>{copy.shareHelp}</p>
      </aside>
    </div>
  );
}

export function SavedExperience({
  initialData,
  locale,
}: {
  initialData: SavedData;
  locale: Locale;
}) {
  const router = useRouter();
  const labels = savedFullLabels[locale];
  const common = getMessages(locale).common;
  const [tab, setTab] = useState<Tab>("MATCHES");
  const [matches, setMatches] = useState(initialData.matches);
  const [accumulators, setAccumulators] = useState(initialData.accumulators);
  const [following, setFollowing] = useState(initialData.following);
  const [preferences, setPreferences] = useState(initialData.notifications);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const upcoming = useMemo(
    () => matches.filter((item) => item.state !== "SETTLED"),
    [matches],
  );
  const activeAccumulator = accumulators.find(
    (item) => item.status === "PENDING",
  );
  function togglePreference(key: keyof NotificationPreferences) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }
  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button
            className={`${shellStyles.brand} ${styles.brandButton}`}
            onClick={() => router.push(`/${locale}/today`)}
          >
            <MboMark className={shellStyles.brandMark} title="MyBetOracle" />
            <span className={shellStyles.brandName}>MyBetOracle</span>
          </button>
          <label className={shellStyles.globalSearch}>
            <Search size={18} />
            <input placeholder={labels.search} />
            <span>Ctrl K</span>
          </label>
          <div className={shellStyles.topbarActions}>
            <button
              className={shellStyles.topIconButton}
              aria-label={common.notifications}
              onClick={() => setTab("ALERTS")}
            >
              <Bell size={19} />
            </button>
            <label className={shellStyles.localeSelect}>
              <Languages size={18} />
              <select
                value={locale}
                onChange={(event) =>
                  router.push(`/${event.target.value}/saved`)
                }
              >
                {locales.map((item) => (
                  <option value={item} key={item}>
                    {localeNames[item]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={shellStyles.avatarButton}
              aria-label={common.profile}
              onClick={() => router.push(`/${locale}/profile`)}
            >
              <UserCircle size={24} />
            </button>
            <button
              className={shellStyles.mobileMenuButton}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <MobileProductMenu
          locale={locale}
          activeRoute="saved"
          onNavigate={() => setMenuOpen(false)}
        />
      )}
      <div
        className={shellStyles.shell}
        style={{ gridTemplateColumns: "190px minmax(0, 1fr)" }}
      >
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav}>
            {navItems.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                className={route === "saved" ? shellStyles.navActive : ""}
                onClick={() => router.push(`/${locale}/${route}`)}
              >
                <Icon size={19} />
                <span>{route === "betslip" ? getOracleDailyLabel() : common[label]}</span>
                {route === "saved" && (
                  <small>{matches.length + accumulators.length}</small>
                )}
              </button>
            ))}
          </nav>
          <div className={shellStyles.sidebarSection}>
            <div className={shellStyles.sidebarHeading}>
              <span>{labels.watchlists}</span>
            </div>
            {[
              ["MATCHES", labels.matches, matches.length],
              ["ACCUMULATORS", labels.multiPicks, accumulators.length],
              ["FOLLOWING", labels.following, following.length],
              [
                "ALERTS",
                labels.alerts,
                Object.values(preferences).filter(Boolean).length,
              ],
            ].map(([value, label, count]) => (
              <button
                key={value}
                className={`${styles.sideLink} ${tab === value ? styles.sideActive : ""}`}
                onClick={() => setTab(value as Tab)}
              >
                <span>{label}</span>
                <small>{count}</small>
              </button>
            ))}
          </div>
          <div className={shellStyles.sidebarFooter}>
            <button onClick={() => router.push(`/${locale}/explore`)}>
              <Globe2 size={17} />
              {labels.discover}
            </button>
            <button onClick={() => router.push(`/${locale}/responsible-play`)}>
              <ShieldCheck size={17} />
              {common.responsiblePlay}
            </button>
          </div>
        </aside>
        <main className={`${shellStyles.main} ${styles.main}`}>
          <header className={styles.pageHeader}>
            <div>
              <span>
                <Bookmark size={14} />
                {labels.eyebrow}
              </span>
              <h1>{labels.title}</h1>
              <p>{labels.subtitle}</p>
            </div>
            <button className={styles.manage} onClick={() => setTab("ALERTS")}>
              <Settings2 size={16} />
              {labels.manageAlerts}
            </button>
          </header>
          <section className={styles.nextPanel}>
            <header>
              <div>
                <span>{labels.next}</span>
                <strong>
                  {upcoming.length} {labels.trackedMatches} ·{" "}
                  {
                    accumulators.filter((item) => item.status === "PENDING")
                      .length
                  }{" "}
                  {labels.activeMultiPicks}
                </strong>
              </div>
              <BellRing size={18} />
            </header>
            <div>
              {upcoming.slice(0, 2).map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/${locale}/match/${item.slug}`)}
                >
                  <span
                    className={
                      item.state === "LIVE" ? styles.liveDot : styles.timeDot
                    }
                  />
                  <div>
                    <strong>
                      {item.homeTeam} vs {item.awayTeam}
                    </strong>
                    <span>
                      {item.state === "LIVE"
                        ? `${item.minute}' ${common.live.toLowerCase()}`
                        : new Intl.DateTimeFormat(locale, {
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(item.kickoffAt))}{" "}
                      · {item.selection}
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
              {activeAccumulator && (
                <button onClick={() => setTab("ACCUMULATORS")}>
                  <span className={styles.accuDot} />
                  <div>
                    <strong>{activeAccumulator.targetLabel} Multi-Pick</strong>
                    <span>
                      {activeAccumulator.wonLegs}/{activeAccumulator.legs} {labels.legsWon} · {labels.nextPending}
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </section>
          <nav className={styles.tabs}>
            {[
              ["MATCHES", labels.matches, matches.length],
              ["ACCUMULATORS", labels.multiPicks, accumulators.length],
              ["FOLLOWING", labels.following, following.length],
              ["ALERTS", labels.alerts, null],
            ].map(([value, label, count]) => (
              <button
                key={value}
                className={tab === value ? styles.tabActive : ""}
                onClick={() => setTab(value as Tab)}
              >
                {label}
                {count !== null && <small>{count}</small>}
              </button>
            ))}
          </nav>
          {tab === "MATCHES" && (
            <section className={styles.list}>
              <header>
                <div>
                  <h2>{labels.trackedTitle}</h2>
                  <p>{labels.trackedHelp}</p>
                </div>
                <span>{labels.newest}</span>
              </header>
              {matches.map((item) => (
                <MatchRow
                  key={item.id}
                  item={item}
                  locale={locale}
                  copy={labels}
                  onRemove={() =>
                    setMatches((current) =>
                      current.filter((entry) => entry.id !== item.id),
                    )
                  }
                  onAlert={() =>
                    setMatches((current) =>
                      current.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, alertEnabled: !entry.alertEnabled }
                          : entry,
                      ),
                    )
                  }
                  onShare={() =>
                    setShareItem({
                      title: `${item.homeTeam} vs ${item.awayTeam}`,
                      subtitle: translateMarketSelection(locale, item.selection),
                      score: `Oracle ${item.oracleScore} · ${item.odds.toFixed(2)} ${labels.odds}`,
                      status:
                        item.state === "SETTLED"
                          ? labels.settledResult
                          : labels.publishedBefore,
                    })
                  }
                />
              ))}
            </section>
          )}
          {tab === "ACCUMULATORS" && (
            <section className={styles.list}>
              <header>
                <div>
                  <h2>{labels.savedTitle}</h2>
                  <p>{labels.savedHelp}</p>
                </div>
                <span>{accumulators.length} {labels.saved}</span>
              </header>
              {accumulators.map((item) => (
                <AccumulatorRow
                  key={item.id}
                  item={item}
                  locale={locale}
                  copy={labels}
                  onRemove={() =>
                    setAccumulators((current) =>
                      current.filter((entry) => entry.id !== item.id),
                    )
                  }
                  onShare={() =>
                    setShareItem({
                      title: `${item.targetLabel} Multi-Pick`,
                      subtitle: `${item.scope === "DAILY" ? labels.daily : labels.weekly} · ${labels.option} ${item.variant} · ${item.legs} ${labels.selections}`,
                      score: `${labels.totalOdds}: ${item.totalOdds.toFixed(2)}`,
                      status:
                        item.status === "WON"
                          ? labels.verifiedWin
                          : labels.publishedRecord,
                    })
                  }
                />
              ))}
            </section>
          )}
          {tab === "FOLLOWING" && (
            <section className={styles.list}>
              <header>
                <div>
                  <h2>{labels.following}</h2>
                  <p>{labels.followingHelp}</p>
                </div>
                <button className={styles.addFollow}>
                  <Star size={15} />
                  {labels.add}
                </button>
              </header>
              {following.map((item) => (
                <FollowRow
                  key={item.id}
                  item={item}
                  copy={labels}
                  onToggle={() =>
                    setFollowing((current) =>
                      current.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, alerts: !entry.alerts }
                          : entry,
                      ),
                    )
                  }
                  onRemove={() =>
                    setFollowing((current) =>
                      current.filter((entry) => entry.id !== item.id),
                    )
                  }
                />
              ))}
            </section>
          )}
          {tab === "ALERTS" && (
            <section className={styles.alerts}>
              <header>
                <div>
                  <h2>{labels.notificationTitle}</h2>
                  <p>{labels.notificationHelp}</p>
                </div>
                <BellRing size={18} />
              </header>
              <div className={styles.alertGroup}>
                <span>{labels.matchesPicks}</span>
                {[
                  [
                    "kickoff",
                    labels.kickoffReminder,
                    labels.kickoffReminderHelp,
                  ],
                  [
                    "lineup",
                    labels.lineupsAvailable,
                    labels.lineupsHelp,
                  ],
                  [
                    "oracleUpdate",
                    labels.oracleUpdate,
                    labels.oracleUpdateHelp,
                  ],
                  [
                    "settlement",
                    labels.predictionSettled,
                    labels.predictionSettledHelp,
                  ],
                ].map(([key, title, description]) => (
                  <div key={key}>
                    <span>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    <Toggle
                      checked={
                        preferences[key as keyof NotificationPreferences]
                      }
                      onChange={() =>
                        togglePreference(key as keyof NotificationPreferences)
                      }
                      label={title}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.alertGroup}>
                <span>{labels.multiDigests}</span>
                {[
                  [
                    "accumulatorResult",
                    labels.multiSettled,
                    labels.multiSettledHelp,
                  ],
                  [
                    "morningDigest",
                    labels.morningIntelligence,
                    labels.morningHelp,
                  ],
                  [
                    "eveningRecap",
                    labels.eveningRecap,
                    labels.eveningHelp,
                  ],
                ].map(([key, title, description]) => (
                  <div key={key}>
                    <span>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    <Toggle
                      checked={
                        preferences[key as keyof NotificationPreferences]
                      }
                      onChange={() =>
                        togglePreference(key as keyof NotificationPreferences)
                      }
                      label={title}
                    />
                  </div>
                ))}
              </div>
              <footer>
                <ShieldCheck size={16} />
                <span>{labels.quietHours}</span>
              </footer>
            </section>
          )}
        </main>
      </div>
      <nav className={shellStyles.mobileBottomNav}>
        {navItems.slice(0, 5).map(({ label, icon: Icon, route }) => (
          <button
            key={label}
            className={route === "saved" ? shellStyles.mobileNavActive : ""}
            onClick={() => router.push(`/${locale}/${route}`)}
          >
            <Icon size={19} />
            <span>{common[label]}</span>
          </button>
        ))}
      </nav>
      {shareItem && (
        <ShareSheet item={shareItem} copy={labels} onClose={() => setShareItem(null)} />
      )}
    </div>
  );
}
