import Link from "next/link";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { getFooterContent } from "./footer-data";
import styles from "./site-footer.module.css";

export function SiteFooter({ locale }: { locale: Locale }) {
  const content = getFooterContent(locale);

  return (
    <footer id="site-footer" className={styles.footer} role="contentinfo" aria-label="Site footer">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {content.groups.map((group) => (
            <section key={group.title} className={styles.column} aria-label={group.title}>
              <h2 className={styles.columnTitle}>{group.title}</h2>
              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={link.href} className={styles.linkItem}>
                    <Link href={link.href} prefetch={false}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <hr className={styles.divider} aria-hidden="true" />

        <div className={styles.bottomBar}>
          <nav className={styles.localesNav} aria-label={content.languageLabel}>
            <span className={styles.localesLabel}>{content.languageLabel}:</span>
            {locales.map((targetLocale) => {
              const isActive = targetLocale === locale;
              return (
                <Link
                  key={targetLocale}
                  href={`/${targetLocale}`}
                  prefetch={false}
                  className={`${styles.localeLink} ${isActive ? styles.activeLocale : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  hrefLang={targetLocale}
                >
                  {localeNames[targetLocale]}
                </Link>
              );
            })}
          </nav>

          <div className={styles.metaRow}>
            <p className={styles.disclaimer}>{content.disclaimer}</p>
            <div className={styles.copyrightRow}>
              <p className={styles.copyright}>{content.copyright}</p>
              <a href="#top" className={styles.topLink}>
                ↑ {content.backToTop}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
