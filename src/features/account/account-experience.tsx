"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bookmark,
  ChevronRight,
  Compass,
  HelpCircle,
  Home,
  Languages,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import { MboMark } from "@/components/brand/brand-marks";
import { MobileProductMenu } from "@/components/navigation/mobile-product-menu";
import shellStyles from "@/features/today/today-experience.module.css";
import { locales, type Locale } from "@/i18n/config";
import styles from "./account.module.css";

export type AccountView =
  | "profile"
  | "preferences"
  | "support"
  | "responsible-play"
  | "privacy"
  | "terms";
const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  pt: "Portugues",
};
const nav = [
  { label: "Today", icon: Home, route: "today" },
  { label: "Explore", icon: Compass, route: "explore" },
  { label: "Multi-Picks", icon: WandSparkles, route: "multi-picks" },
  { label: "Results", icon: BarChart3, route: "results" },
  { label: "Saved", icon: Bookmark, route: "saved" },
  { label: "Oracle Daily", icon: ReceiptText, route: "betslip" },
] as const;
const accountNav = [
  { label: "Profile", route: "profile", icon: UserCircle },
  { label: "Preferences", route: "preferences", icon: SlidersHorizontal },
  { label: "Support", route: "support", icon: HelpCircle },
  { label: "Responsible play", route: "responsible-play", icon: ShieldCheck },
  { label: "Privacy", route: "privacy", icon: Lock },
  { label: "Terms", route: "terms", icon: MessageSquare },
] as const;
const copy: Record<
  AccountView,
  { eyebrow: string; title: string; description: string }
> = {
  profile: {
    eyebrow: "Your account",
    title: "Profile",
    description: "Your identity and connected MyBetOracle activity.",
  },
  preferences: {
    eyebrow: "Product settings",
    title: "Preferences",
    description:
      "Control language, timezone, odds format and notification behavior.",
  },
  support: {
    eyebrow: "Help centre",
    title: "Support",
    description: "Find answers and contact the MyBetOracle support team.",
  },
  "responsible-play": {
    eyebrow: "User protection",
    title: "Responsible play",
    description: "Practical tools and boundaries for informed, controlled use.",
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    description: "How MyBetOracle handles account and product information.",
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of use",
    description:
      "The rules that govern access to MyBetOracle and its football intelligence.",
  },
};
function Toggle({
  initial = true,
  label,
}: {
  initial?: boolean;
  label: string;
}) {
  const [on, setOn] = useState(initial);
  return (
    <button
      className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn(!on)}
    >
      <span />
    </button>
  );
}
export function AccountExperience({
  locale,
  view,
}: {
  locale: Locale;
  view: AccountView;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const page = copy[view];
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
          <div className={styles.accountContext}>
            <UserCircle size={17} />
            Account and help
          </div>
          <div className={shellStyles.topbarActions}>
            <label className={shellStyles.localeSelect}>
              <Languages size={18} />
              <select
                value={locale}
                onChange={(e) => router.push(`/${e.target.value}/${view}`)}
              >
                {locales.map((item) => (
                  <option key={item} value={item}>
                    {localeNames[item]}
                  </option>
                ))}
              </select>
            </label>
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
          activeRoute={view}
          onNavigate={() => setMenu(false)}
        />
      )}
      <div className={`${shellStyles.shell} ${styles.shell}`}>
        <aside className={shellStyles.sidebar}>
          <nav className={shellStyles.primaryNav}>
            {nav.map(({ label, icon: Icon, route }) => (
              <button
                key={route}
                onClick={() => router.push(`/${locale}/${route}`)}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className={shellStyles.sidebarSection}>
            <div className={shellStyles.sidebarHeading}>
              <span>Account</span>
            </div>
            {accountNav.map(({ label, route, icon: Icon }) => (
              <button
                key={route}
                className={`${styles.sideLink} ${view === route ? styles.sideActive : ""}`}
                onClick={() => router.push(`/${locale}/${route}`)}
              >
                <Icon size={15} />
                <span>{label}</span>
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
        </aside>
        <main className={`${shellStyles.main} ${styles.main}`}>
          <header className={styles.pageHeader}>
            <span>{page.eyebrow}</span>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </header>
          {view === "profile" && (
            <>
              <section className={styles.profileHero}>
                <div className={styles.avatar}>MO</div>
                <div>
                  <strong>MyBetOracle member</strong>
                  <span>member@mybetoracle.com</span>
                  <small>Prototype account · Joined August 2026</small>
                </div>
                <button onClick={() => router.push(`/${locale}/preferences`)}>
                  Edit preferences
                </button>
              </section>
              <section className={styles.cards}>
                <button onClick={() => router.push(`/${locale}/saved`)}>
                  <Bookmark />
                  <span>
                    <strong>7 saved items</strong>
                    <small>Matches and Multi-Picks</small>
                  </span>
                  <ChevronRight />
                </button>
                <button onClick={() => router.push(`/${locale}/results`)}>
                  <BarChart3 />
                  <span>
                    <strong>Results history</strong>
                    <small>Verified publications</small>
                  </span>
                  <ChevronRight />
                </button>
                <button onClick={() => router.push(`/${locale}/support`)}>
                  <HelpCircle />
                  <span>
                    <strong>Get support</strong>
                    <small>Help centre and contact</small>
                  </span>
                  <ChevronRight />
                </button>
              </section>
            </>
          )}
          {view === "preferences" && (
            <section className={styles.settings}>
              <div>
                <span>
                  <strong>Language</strong>
                  <small>Product and notification language</small>
                </span>
                <select defaultValue={locale}>
                  {locales.map((item) => (
                    <option key={item} value={item}>
                      {localeNames[item]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span>
                  <strong>Timezone</strong>
                  <small>Kickoff and settlement times</small>
                </span>
                <select defaultValue="Africa/Lagos">
                  <option>Africa/Lagos</option>
                  <option>Europe/London</option>
                  <option>Europe/Madrid</option>
                </select>
              </div>
              <div>
                <span>
                  <strong>Odds format</strong>
                  <small>Displayed throughout predictions</small>
                </span>
                <select defaultValue="Decimal">
                  <option>Decimal</option>
                  <option>Fractional</option>
                  <option>American</option>
                </select>
              </div>
              <div>
                <span>
                  <strong>Kickoff reminders</strong>
                  <small>Only for saved matches</small>
                </span>
                <Toggle label="Kickoff reminders" />
              </div>
              <div>
                <span>
                  <strong>Settlement alerts</strong>
                  <small>Won, lost and void outcomes</small>
                </span>
                <Toggle label="Settlement alerts" />
              </div>
              <footer>
                <button onClick={() => router.push(`/${locale}/saved`)}>
                  Advanced alert settings <ChevronRight size={15} />
                </button>
              </footer>
            </section>
          )}
          {view === "support" && (
            <>
              <section className={styles.supportGrid}>
                <button>
                  <MessageSquare />
                  <strong>Using predictions</strong>
                  <span>Markets, Oracle Score and evidence</span>
                  <ChevronRight />
                </button>
                <button>
                  <Bookmark />
                  <strong>Saved and alerts</strong>
                  <span>Following, watchlists and notifications</span>
                  <ChevronRight />
                </button>
                <button>
                  <ShieldCheck />
                  <strong>Results and trust</strong>
                  <span>Settlement and methodology</span>
                  <ChevronRight />
                </button>
              </section>
              <section className={styles.contact}>
                <Mail />
                <div>
                  <strong>Still need help?</strong>
                  <span>
                    Support requests will connect to the account service during
                    integration.
                  </span>
                </div>
                <button>Contact support</button>
              </section>
            </>
          )}
          {view === "responsible-play" && (
            <section className={styles.article}>
              <ShieldCheck />
              <h2>Football intelligence, not certainty</h2>
              <p>
                Predictions and historical patterns are informational. No
                recommendation guarantees an outcome, and past performance does
                not guarantee future results.
              </p>
              <h3>Stay in control</h3>
              <ul>
                <li>
                  Set a personal time and spending boundary before engaging.
                </li>
                <li>
                  Never chase a loss or treat an Oracle Score as a promise.
                </li>
                <li>
                  Pause notifications from Preferences or Saved when you need
                  distance.
                </li>
                <li>
                  Use locally available self-exclusion and support services when
                  appropriate.
                </li>
              </ul>
            </section>
          )}
          {(view === "privacy" || view === "terms") && (
            <section className={styles.article}>
              <Lock />
              <h2>
                {view === "privacy"
                  ? "Privacy at a glance"
                  : "Product terms at a glance"}
              </h2>
              <p>
                {view === "privacy"
                  ? "The production policy will explain what account, preference, notification and analytics data is collected, why it is used and how users can exercise their rights."
                  : "MyBetOracle provides football information and predictions without guaranteeing results. Production terms will define eligibility, acceptable use, subscriptions, intellectual property and service limitations."}
              </p>
              <h3>Prototype status</h3>
              <p>
                This V3 interface currently uses mock data and does not submit
                personal information, process subscriptions or persist account
                settings.
              </p>
              <h3>Before launch</h3>
              <p>
                Final jurisdiction-specific documents, company details, contact
                channels and effective dates must be approved before these
                routes become indexable production policies.
              </p>
            </section>
          )}
        </main>
      </div>
      <nav className={shellStyles.mobileBottomNav}>
        {nav.slice(0, 5).map(({ label, icon: Icon, route }) => (
          <button
            key={route}
            onClick={() => router.push(`/${locale}/${route}`)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
