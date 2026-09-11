"use client";

import Image from "next/image";
import { useState } from "react";
import type { LineupPlayer } from "./types";
import styles from "./lineup-pitch.module.css";

export function PlayerPortrait({ player }: { player: LineupPlayer }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const src = player.photoUrl;
  const canLoad = Boolean(src && failedUrl !== src);
  const loaded = canLoad && loadedUrl === src;
  return <div className={styles.portrait}>
    <b className={styles.portraitNumber} data-loaded={loaded}>{player.number ?? "—"}</b>
    {canLoad && src && <Image src={src} alt="" width={36} height={36} sizes="36px"
      loading="lazy" className={styles.portraitImage} data-loaded={loaded}
      onLoad={() => setLoadedUrl(src)} onError={() => setFailedUrl(src)} />}
  </div>;
}
