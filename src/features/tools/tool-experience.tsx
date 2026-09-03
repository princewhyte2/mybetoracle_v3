"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Compass,
  Home,
  Languages,
  Menu,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Trash2,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import { MboMark } from "@/components/brand/brand-marks";
import shellStyles from "@/features/today/today-experience.module.css";
import type { DiscoveryData } from "@/features/discovery/types";
import { locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { translateMarketSelection } from "@/i18n/football";
import styles from "./tool.module.css";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import { toolLabels } from "./labels";
type ToolView = "builder" | "analyzer";
const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  pt: "Portugues",
};
const analyzerCopy: Record<Locale, { clear: string; duplicate: string; sharedTeams: string; competition: string; market: string; kickoff: string; missingOdds: string }> = {
  en: { clear: "No concentration or overlap warnings detected", duplicate: "Duplicate fixture selected", sharedTeams: "Shared teams across selections", competition: "Competition concentration", market: "Market concentration", kickoff: "Kickoff times overlap", missingOdds: "A selection has no verified odds" },
  es: { clear: "No se detectaron avisos de concentración ni solapamiento", duplicate: "Partido duplicado seleccionado", sharedTeams: "Equipos compartidos entre selecciones", competition: "Concentración por competición", market: "Concentración de mercado", kickoff: "Los horarios se solapan", missingOdds: "Una selección no tiene cuota verificada" },
  fr: { clear: "Aucune alerte de concentration ou de chevauchement", duplicate: "Match sélectionné en double", sharedTeams: "Équipes communes entre les sélections", competition: "Concentration par compétition", market: "Concentration de marché", kickoff: "Les horaires se chevauchent", missingOdds: "Une sélection n’a pas de cote vérifiée" },
  de: { clear: "Keine Konzentrations- oder Zeitwarnungen erkannt", duplicate: "Spiel doppelt ausgewählt", sharedTeams: "Gemeinsame Teams in mehreren Tipps", competition: "Wettbewerbskonzentration", market: "Marktkonzentration", kickoff: "Anstoßzeiten überschneiden sich", missingOdds: "Für einen Tipp fehlt eine verifizierte Quote" },
  it: { clear: "Nessun avviso di concentrazione o sovrapposizione", duplicate: "Partita selezionata due volte", sharedTeams: "Squadre condivise tra le selezioni", competition: "Concentrazione per competizione", market: "Concentrazione di mercato", kickoff: "Gli orari si sovrappongono", missingOdds: "Una selezione non ha una quota verificata" },
  pt: { clear: "Nenhum alerta de concentração ou sobreposição detectado", duplicate: "Jogo selecionado em duplicidade", sharedTeams: "Times compartilhados entre seleções", competition: "Concentração por competição", market: "Concentração de mercado", kickoff: "Os horários se sobrepõem", missingOdds: "Uma seleção está sem odd verificada" },
};
const nav = [{key:"today",icon:Home,route:"today"},{key:"explore",icon:Compass,route:"explore"},{key:"accas",icon:WandSparkles,route:"multi-picks"},{key:"results",icon:BarChart3,route:"results"},{key:"saved",icon:Bookmark,route:"saved"},{key:"betslip",icon:ReceiptText,route:"betslip"}] as const;
export function ToolExperience({
  locale,
  data,
  initialSelected,
  view,
}: {
  locale: Locale;
  data: DiscoveryData;
  initialSelected?: string[];
  view: ToolView;
}) {
  const router = useRouter();
  const copy=toolLabels[locale]; const common=getMessages(locale).common;
  const [menu, setMenu] = useState(false);
  const available = data.fixtures.filter(
    (item) => item.odds !== null && data.teams.some((team) => team.slug === item.homeSlug) && data.teams.some((team) => team.slug === item.awaySlug),
  );
  const findTeam = (slug: string) => data.teams.find((team) => team.slug === slug);
  const [selected, setSelected] = useState<string[]>(
    initialSelected?.filter((id) => available.some((item) => item.id === id)) ?? [],
  );
  const [recordId] = useState(() => crypto.randomUUID());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const picks = available.filter((item) =>
    selected.includes(item.id),
  );
  const total = picks.reduce((value, item) => value * (item.odds ?? 1), 1);
  const score = Math.round(
    picks.reduce((value, item) => value + item.oracleScore, 0) /
      Math.max(picks.length, 1),
  );
  const analysisIssues = (() => {
    const labels = analyzerCopy[locale];
    const issues: string[] = [];
    if (new Set(selected).size !== selected.length) issues.push(labels.duplicate);
    const repeated = (values: string[]) => [...new Set(values)].some((value) => values.filter((item) => item === value).length > 1);
    if (repeated(picks.flatMap((item) => [item.homeSlug, item.awaySlug]))) issues.push(labels.sharedTeams);
    if (repeated(picks.map((item) => item.competitionSlug))) issues.push(labels.competition);
    if (repeated(picks.map((item) => item.marketSlug))) issues.push(labels.market);
    const kickoffs = picks.map((item) => Date.parse(item.kickoffAt)).filter(Number.isFinite).sort((left, right) => left - right);
    if (kickoffs.some((value, index) => index > 0 && value - kickoffs[index - 1] <= 60 * 60 * 1000)) issues.push(labels.kickoff);
    if (picks.some((item) => item.odds === null)) issues.push(labels.missingOdds);
    return issues;
  })();
  async function saveToolState(kind: "builder-drafts" | "analyzer-receipts") {
    setSaveState("saving");
    const body = {
      date: data.date,
      ...(kind === "builder-drafts" ? { name: "My Multi-Pick" } : {}),
      selections: picks.map((item) => ({ fixtureId: item.id, marketType: item.marketSlug, marketValue: item.pick, decimalOdds: item.odds ?? 1, oracleScore: item.oracleScore })),
    };
    try {
      const response = await fetch(`/api/saved/${kind}/${recordId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (response.status === 401) { router.push(`/${locale}/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`); return; }
      if (!response.ok) throw new Error("save_failed");
      setSaveState("saved");
    } catch { setSaveState("error"); }
  }
  return (
    <div className={`${shellStyles.app} ${styles.app}`}>
      <header className={shellStyles.topbar}>
        <div className={shellStyles.topbarInner}>
          <button
            className={`${shellStyles.brand} ${styles.brand}`}
            onClick={() => router.push(`/${locale}/today`)}
          >
            <MboMark className={shellStyles.brandMark} title="MyBetOracle" />
            <span className={shellStyles.brandName}>MyBetOracle</span>
          </button>
          <label className={shellStyles.globalSearch}>
            <Search size={18} />
            <input placeholder={copy.search} />
            <span>Ctrl K</span>
          </label>
          <div className={shellStyles.topbarActions}>
            <button
              className={shellStyles.topIconButton}
              aria-label={common.notifications}
              onClick={() => router.push(`/${locale}/saved`)}
            >
              <Bell size={18} />
            </button>
            <label className={shellStyles.localeSelect}>
              <Languages size={18} />
              <select
                value={locale}
                onChange={(e) =>
                  router.push(
                    `/${e.target.value}/${view === "builder" ? "multi-picks/builder" : "pick-analyzer"}`,
                  )
                }
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
              onClick={() => router.push(`/${locale}/profile`)}
            >
              <UserCircle size={23} />
            </button>
            <button
              className={shellStyles.mobileMenuButton}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <MobileProductMenu
          locale={locale}
          activeRoute="multi-picks"
          onNavigate={() => setMenu(false)}
        />
      )}
      <div className={`${shellStyles.shell} ${styles.shell}`}>
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav}>
            {nav.map(({ key, route, icon: Icon }) => (
              <button
                key={route}
                className={key === "accas" ? shellStyles.navActive : ""}
                onClick={() => router.push(`/${locale}/${route}`)}
              >
                <Icon size={19} />
                <span>{common[key]}</span>
              </button>
            ))}
          </nav>
          <div className={shellStyles.sidebarSection}>
            <div className={shellStyles.sidebarHeading}>
              <span>{common.accas}</span>
            </div>
            <button
              className={styles.sideLink}
              onClick={() => router.push(`/${locale}/multi-picks`)}
            >
              {copy.published}
              <ChevronRight />
            </button>
            <button
              className={`${styles.sideLink} ${view === "builder" ? styles.sideActive : ""}`}
              onClick={() => router.push(`/${locale}/multi-picks/builder`)}
            >
              {copy.builder}
              <ChevronRight />
            </button>
            <button
              className={`${styles.sideLink} ${view === "analyzer" ? styles.sideActive : ""}`}
              onClick={() => router.push(`/${locale}/pick-analyzer`)}
            >
              {copy.analyzer}
              <ChevronRight />
            </button>
          </div>
        </aside>
        <main className={`${shellStyles.main} ${styles.main}`}>
          <header className={styles.pageHeader}>
            <span>{copy.decisionTools}</span>
            <h1>{view === "builder" ? copy.builder : copy.analyzer}</h1>
            <p>
              {view === "builder"
                ? copy.builderDescription
                : copy.analyzerDescription}
            </p>
          </header>
          <div className={styles.workspace}>
            <section className={styles.available}>
              <header>
                <div>
                  <span>{copy.publishedToday}</span>
                  <h2>{copy.available}</h2>
                </div>
                <small>{available.length} {copy.matches}</small>
              </header>
              {available.map((item) => {
                const home = findTeam(item.homeSlug)!;
                const away = findTeam(item.awaySlug)!;
                const added = selected.includes(item.id);
                return (
                  <article key={item.id}>
                    <button
                      onClick={() =>
                        router.push(`/${locale}/today?date=${data.date}`)
                      }
                    >
                      <span>
                        {home.name} vs {away.name}
                      </span>
                      <strong>{translateMarketSelection(locale,item.pick)}</strong>
                      <small>
                        Oracle {item.oracleScore} · {(item.odds ?? 0).toFixed(2)}
                      </small>
                    </button>
                    <button
                      className={added ? styles.added : ""}
                      onClick={() =>
                        setSelected((current) =>
                          added
                            ? current.filter((id) => id !== item.id)
                            : [...current, item.id],
                        )
                      }
                    >
                      {added ? <Check /> : <Plus />}
                    </button>
                  </article>
                );
              })}
            </section>
            <aside className={styles.slip}>
              <header>
                <div>
                  <span>
                    {view === "builder" ? copy.myPicks : copy.analysisSet}
                  </span>
                  <h2>{picks.length} {copy.selections}</h2>
                </div>
                <button onClick={() => setSelected([])} title={copy.clear}>
                  <Trash2 size={16} />
                </button>
              </header>
              {picks.map((item) => (
                <div className={styles.slipLine} key={item.id}>
                  <span>
                    {findTeam(item.homeSlug)?.shortName} vs{" "}
                    {findTeam(item.awaySlug)?.shortName}
                  </span>
                  <strong>{translateMarketSelection(locale,item.pick)}</strong>
                  <small>{(item.odds ?? 0).toFixed(2)}</small>
                </div>
              ))}
              {picks.length === 0 && (
                <div className={styles.empty}>
                  {copy.empty}
                </div>
              )}
              <dl>
                <div>
                  <dt>{copy.totalOdds}</dt>
                  <dd>{total.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>{copy.averageOracle}</dt>
                  <dd>{score}</dd>
                </div>
              </dl>
              {view === "builder" ? (
                <>
                  <button className={styles.primary} disabled={picks.length < 2 || saveState === "saving"} onClick={() => saveToolState("builder-drafts")}>
                    {saveState === "saved" ? copy.saved : saveState === "saving" ? copy.saving : copy.saveDraft} <Bookmark />
                  </button>
                  <button className={styles.primary} disabled={picks.length < 2} onClick={() => router.push(`/${locale}/pick-analyzer?selections=${encodeURIComponent(selected.join(","))}`)}>
                    {copy.analyze} <ChevronRight />
                  </button>
                </>
              ) : (
                picks.length >= 2 ? <div className={styles.analysis}>
                  <div>
                    <ShieldCheck />
                    <span>
                      <strong>
                        {score >= 85 && analysisIssues.length === 0
                          ? copy.strongProfile
                          : copy.balancedProfile}
                      </strong>
                      <small>{picks.length} {copy.marketsReviewed}</small>
                    </span>
                  </div>
                  <p>{copy.analysisNote}</p>
                  <ul className={styles.analysisChecks}>
                    {(analysisIssues.length ? analysisIssues : [analyzerCopy[locale].clear]).map((item) => <li key={item}><Check />{item}</li>)}
                  </ul>
                  <button
                    className={styles.primary}
                    disabled={saveState === "saving"}
                    onClick={() => saveToolState("analyzer-receipts")}
                  >
                    {saveState === "saved" ? copy.saved : saveState === "saving" ? copy.saving : copy.saveAnalysis} <Bookmark />
                  </button>
                </div> : null
              )}
            </aside>
          </div>
        </main>
      </div>
      <nav className={shellStyles.mobileBottomNav}>
        {nav.map(({ key, route, icon: Icon }) => (
          <button
            key={route}
            className={key === "accas" ? shellStyles.mobileNavActive : ""}
            onClick={() => router.push(`/${locale}/${route}`)}
          >
            <Icon size={19} />
            <span>{common[key]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
