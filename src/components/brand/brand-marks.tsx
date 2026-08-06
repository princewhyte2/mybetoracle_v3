import styles from "./brand-marks.module.css";

type MarkProps = {
  className?: string;
  title?: string;
};

type LockupProps = {
  inverse?: boolean;
};

function FusedMbGlyph() {
  return (
    <>
      <path d="M8 62V10h14l14 27 14-27h14v52H51V36L39 59h-6L21 36v26H8Z" fill="currentColor" />
      <path
        d="M58 10h18c14 0 22 7 22 18 0 6-3 11-8 14 7 3 11 8 11 15 0 12-9 19-25 19H58V10Zm13 11v14h5c6 0 9-2.5 9-7s-3-7-9-7h-5Zm0 24v16h6c7 0 10.5-2.7 10.5-8S84 45 77 45h-6Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </>
  );
}

export function MicroMark({ className, title = "MyBetOracle" }: MarkProps) {
  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="60" x="2" y="2" rx="10" fill="currentColor" />
      <g color="white" transform="translate(1 9) scale(.56)">
        <FusedMbGlyph />
      </g>
    </svg>
  );
}

export function MboMark({ className, title = "MBO" }: MarkProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      className={className}
      role={title ? "img" : undefined}
      viewBox="0 0 154 72"
      xmlns="http://www.w3.org/2000/svg"
    >
      <FusedMbGlyph />
      <defs>
        <mask id="mbo-ball-cutout" maskUnits="userSpaceOnUse" x="98" y="8" width="56" height="56">
          <rect width="56" height="56" x="98" y="8" fill="white" />
          <circle cx="126" cy="36" r="19" fill="none" stroke="black" strokeWidth="1.8" />
          <path d="m126 23 9.5 6.9-3.6 11.1h-11.8l-3.6-11.1L126 23Z" fill="black" />
          <path
            d="m116.8 30.3-12.2 1.9m30.6-1.9 12.2 1.9M120.5 40.6l-5.1 11.1m16.1-11.1 5.1 11.1M126 23V12.5"
            fill="none"
            stroke="black"
            strokeLinecap="round"
            strokeWidth="2.1"
          />
        </mask>
      </defs>
      <circle
        cx="126"
        cy="36"
        fill="var(--mbo-ball-color, currentColor)"
        mask="url(#mbo-ball-cutout)"
        r="27"
      />
    </svg>
  );
}

export function PrimaryLockup({ inverse = false }: LockupProps) {
  return (
    <div className={`${styles.primaryLockup} ${inverse ? styles.inverse : ""}`} aria-label="MyBetOracle">
      <MboMark className={styles.mboMark} title="" />
      <span className={styles.wordmark} aria-hidden="true">
        <span className={styles.wordmarkLead}>MyBet</span>
        <span className={styles.wordmarkFocus}>Oracle</span>
      </span>
    </div>
  );
}
