import type { Metadata } from "next";

import { MboMark, MicroMark, PrimaryLockup } from "@/components/brand/brand-marks";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "V3 Identity Review | MyBetOracle",
  description: "MyBetOracle V3 logo system review board",
  robots: { index: false, follow: false },
};

const markSizes = [16, 24, 32, 48, 64] as const;

export default function BrandReviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <div className={styles.introInner}>
          <p className={styles.kicker}>MYBETORACLE / IDENTITY 01</p>
          <h1>Recognition, rebuilt.</h1>
          <p className={styles.summary}>
            The MBO silhouette remains the recognition anchor. Its heavy MB and football O are rebuilt with cleaner
            geometry, while a dedicated MB micro-mark fixes the favicon problem without discarding brand memory.
          </p>
        </div>
      </header>

      <section className={styles.lockupSection} aria-labelledby="primary-heading">
        <div className={styles.sectionHeading}>
          <p>01</p>
          <div>
            <h2 id="primary-heading">Primary lockup</h2>
            <span>Full product identity</span>
          </div>
        </div>
        <div className={styles.lockupGrid}>
          <div className={styles.lightStage}>
            <PrimaryLockup />
          </div>
          <div className={styles.darkStage}>
            <PrimaryLockup inverse />
          </div>
        </div>
      </section>

      <section className={styles.contextSection} aria-labelledby="context-heading">
        <div className={styles.sectionHeading}>
          <p>02</p>
          <div>
            <h2 id="context-heading">Product context</h2>
            <span>Navigation, app and compact heritage use</span>
          </div>
        </div>

        <div className={styles.contextGrid}>
          <div className={styles.browserFrame}>
            <div className={styles.browserTopline}>
              <span />
              <span />
              <span />
            </div>
            <nav className={styles.navMock} aria-label="Logo context preview">
              <PrimaryLockup />
              <div className={styles.navItems}>
                <span>Matches</span>
                <span>Intelligence</span>
                <span>Performance</span>
                <b>Oracle Pro</b>
              </div>
            </nav>
            <div className={styles.navContent}>
              <span>Wednesday, 6 August</span>
              <strong>Today&apos;s match intelligence</strong>
            </div>
          </div>

          <div className={styles.iconPanel}>
            <div className={styles.appIcon}>
              <div className={styles.appBadge}>
                <MboMark />
              </div>
            </div>
            <div>
              <p>APP ICON</p>
              <strong>MBO rebuilt</strong>
              <span>The familiar silhouette is larger, cleaner and centered inside the adaptive safe zone.</span>
            </div>
          </div>

          <div className={styles.heritagePanel}>
            <p>RECOGNITION ANCHOR</p>
            <MboMark />
            <span>The heavy MB and football O remain the central symbol rather than a secondary reference.</span>
          </div>
        </div>
      </section>

      <section className={styles.microSection} aria-labelledby="micro-heading">
        <div className={styles.sectionHeading}>
          <p>03</p>
          <div>
            <h2 id="micro-heading">Micro-scale test</h2>
            <span>A purpose-built MB mark for the smallest browser surfaces</span>
          </div>
        </div>
        <div className={styles.scaleStrip}>
          {markSizes.map((size) => (
            <div className={styles.scaleItem} key={size}>
              <div className={styles.scaleCanvas}>
                <MicroMark className={styles.scaleMark} />
              </div>
              <span>{size}px</span>
            </div>
          ))}
        </div>
        <div className={styles.actualSizes} aria-label="Actual mark sizes">
          {markSizes.map((size) => (
            <div key={size}>
              <MicroMark className={styles.actualMark} />
              <span>{size}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.finishSection} aria-labelledby="finish-heading">
        <div className={styles.sectionHeading}>
          <p>04</p>
          <div>
            <h2 id="finish-heading">One-color integrity</h2>
            <span>Required for print, embossing and constrained media</span>
          </div>
        </div>
        <div className={styles.finishGrid}>
          <div className={styles.blueFinish}>
            <MboMark />
          </div>
          <div className={styles.inkFinish}>
            <PrimaryLockup inverse />
          </div>
          <div className={styles.paperFinish}>
            <PrimaryLockup />
          </div>
        </div>
      </section>
    </main>
  );
}
