import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { type EditorialScope, getEditorialContent } from "@/features/today/editorial-copy";
import styles from "./page-editorial.module.css";

export function PageEditorial({
  locale,
  scopeKey,
}: {
  locale: Locale;
  scopeKey: EditorialScope;
}) {
  const content = getEditorialContent(locale, scopeKey);

  return (
    <section className={styles.container} aria-labelledby="page-editorial-heading">
      <h2 id="page-editorial-heading" className={styles.heading}>
        {content.heading}
      </h2>
      <div className={styles.paragraphs}>
        {content.paragraphs.map((text, idx) => (
          <p key={idx} className={styles.paragraph}>
            {text}
          </p>
        ))}
      </div>
      {content.relatedLinks.length > 0 && (
        <nav className={styles.relatedNav} aria-label={content.relatedLinksTitle}>
          <h3 className={styles.relatedTitle}>{content.relatedLinksTitle}</h3>
          <ul className={styles.linkList}>
            {content.relatedLinks.map((link) => (
              <li key={link.href} className={styles.linkItem}>
                <Link href={link.href} prefetch={false}>
                  <span>{link.label}</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
