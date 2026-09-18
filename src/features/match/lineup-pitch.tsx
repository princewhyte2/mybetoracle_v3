import { useMemo } from "react";
import type { Locale } from "@/i18n/config";
import type { LineupPlayer, MatchDetail } from "./types";
import styles from "./lineup-pitch.module.css";
import { PlayerPortrait } from "./player-portrait";

const copy = {
  en: { starters: "Starting XI", bench: "Substitutes", coach: "Coach" },
  fr: { starters: "Titulaires", bench: "Remplaçants", coach: "Entraîneur" },
  es: { starters: "Once inicial", bench: "Suplentes", coach: "Entrenador" },
  de: { starters: "Startelf", bench: "Ersatzspieler", coach: "Trainer" },
  it: { starters: "Titolari", bench: "Panchina", coach: "Allenatore" },
  pt: { starters: "Titulares", bench: "Suplentes", coach: "Treinador" },
};

// Coordinates are normalized from provider rows/columns, never from a guessed XI.
export function pitchPositions(players: LineupPlayer[]) {
  const starters = players.filter(player => player.starter);
  if (starters.length !== 11) return null;
  const cells = starters.map(player => {
    const match = /^([1-6]):([1-6])$/.exec(player.grid ?? "");
    return match ? { player, row:Number(match[1]), column:Number(match[2]) } : null;
  });
  if (cells.some(cell => !cell)) return null;
  const valid = cells.filter(cell => cell !== null);
  if (new Set(valid.map(cell => `${cell.row}:${cell.column}`)).size !== 11) return null;
  const rows = [...new Set(valid.map(cell => cell.row))].sort((a,b)=>a-b);
  if (rows.some((row,index)=>row !== index+1)) return null;
  if (valid.filter(cell=>cell.row===1).length !== 1) return null;
  for(const row of rows) {
    const columns=valid.filter(cell=>cell.row===row).map(cell=>cell.column).sort((a,b)=>a-b);
    if(columns.some((column,index)=>column!==index+1)) return null;
  }
  return valid.map(cell => ({
    player:cell.player,
    x:cell.column/(valid.filter(other=>other.row===cell.row).length+1)*100,
    y:90-(cell.row-1)/(rows.length-1)*78,
  }));
}

export function LineupPitch({ match, locale }: { match:MatchDetail; locale:Locale }) {
  const c = copy[locale];

  const ratingsByPlayer = useMemo(() => {
    const map = new Map<string, number>();
    for (const stat of match.playerStatistics ?? []) {
      if (stat.rating !== null && stat.rating > 0) {
        map.set(stat.name.toLowerCase().trim(), stat.rating);
      }
    }
    return map;
  }, [match.playerStatistics]);

  const eventsByPlayer = useMemo(() => {
    const map = new Map<string, Array<{ type: string; minute: number | null; detail: string | null }>>();
    for (const ev of match.events ?? []) {
      if (!ev.player) continue;
      const key = ev.player.toLowerCase().trim();
      const list = map.get(key) ?? [];
      list.push({ type: ev.type, minute: ev.minute, detail: ev.detail });
      map.set(key, list);
      const parts = key.split(/\s+/);
      if (parts.length > 1) {
        const lastName = parts[parts.length - 1];
        if (lastName && lastName.length > 2 && !map.has(lastName)) {
          map.set(lastName, list);
        }
      }
    }
    return map;
  }, [match.events]);

  const homePositions = useMemo(() => {
    return match.lineup.confirmedHome && match.lineup.homePlayers
      ? pitchPositions(match.lineup.homePlayers)
      : null;
  }, [match.lineup.confirmedHome, match.lineup.homePlayers]);

  const awayPositions = useMemo(() => {
    return match.lineup.confirmedAway && match.lineup.awayPlayers
      ? pitchPositions(match.lineup.awayPlayers)
      : null;
  }, [match.lineup.confirmedAway, match.lineup.awayPlayers]);

  return (
    <div className={styles.teams}>
      {(["home", "away"] as const).map((side) => {
        const team = match[side], home = side === "home";
        const players = (home ? match.lineup.homePlayers : match.lineup.awayPlayers) ?? [];
        if (!players.length) return null;
        const positions = home ? homePositions : awayPositions;
        const formation = home ? match.lineup.formationHome : match.lineup.formationAway;
        const coach = home ? match.lineup.coachHome : match.lineup.coachAway;

        return (
          <section key={side} className={styles.team}>
            <header>
              <strong>{team.name}</strong>
              {formation && <span>{formation}</span>}
            </header>

            {positions && (
              <div className={styles.pitch} aria-label={`${team.name} · ${formation}`}>
                <i className={styles.halfway} />
                <i className={styles.circle} />
                <i className={styles.boxTop} />
                <i className={styles.boxBottom} />
                {positions.map(({ player, x, y }) => {
                  const normName = player.name.toLowerCase().trim();
                  const playerRating = player.rating ?? ratingsByPlayer.get(normName) ?? null;
                  const playerEvents = eventsByPlayer.get(normName) ?? [];
                  const ratingCls = playerRating !== null
                    ? playerRating >= 7.5 ? styles.ratingHigh : playerRating >= 6.8 ? styles.ratingGood : playerRating >= 6.0 ? styles.ratingAverage : styles.ratingLow
                    : "";

                  return (
                    <div key={player.id} className={styles.player} style={{ left: `${x}%`, top: `${y}%` }} title={`${player.name}${playerRating ? ` (${playerRating.toFixed(1)})` : ''}`}>
                      <div className={styles.playerAvatarWrap}>
                        <PlayerPortrait player={player} />
                        {playerRating !== null && (
                          <span className={`${styles.pitchRatingBadge} ${ratingCls}`}>
                            {playerRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <span className={styles.playerNameLabel}>
                        {player.name}
                        {playerEvents.length > 0 && (
                          <span className={styles.pitchPlayerEvents}>
                            {playerEvents.map((ev, idx) => (
                              <span key={idx} title={`${ev.type}${ev.minute ? ` ${ev.minute}'` : ''}`}>
                                {ev.type === "GOAL" ? "⚽" : ev.type === "CARD" ? (ev.detail?.toLowerCase().includes("red") ? "🟥" : "🟨") : ""}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {[true, false].map((starter) => {
              const group = players.filter((player) => player.starter === starter);
              return group.length > 0 && (
                <div key={String(starter)} className={styles.list}>
                  <h3>{starter ? c.starters : c.bench}</h3>
                  <ul>
                    {group.map((player) => {
                      const normName = player.name.toLowerCase().trim();
                      const playerRating = player.rating ?? ratingsByPlayer.get(normName) ?? null;
                      const playerEvents = eventsByPlayer.get(normName) ?? [];
                      const ratingCls = playerRating !== null
                        ? playerRating >= 7.5 ? styles.ratingHigh : playerRating >= 6.8 ? styles.ratingGood : playerRating >= 6.0 ? styles.ratingAverage : styles.ratingLow
                        : "";

                      return (
                        <li key={player.id} className={styles.lineupRow}>
                          <b className={styles.lineupJersey}>{player.number ?? "—"}</b>
                          <span className={styles.lineupName}>{player.name}</span>
                          {playerEvents.length > 0 && (
                            <div className={styles.lineupEvents}>
                              {playerEvents.map((ev, idx) => (
                                <span key={idx} className={styles.lineupEventIcon} title={`${ev.type}${ev.minute ? ` ${ev.minute}'` : ''}`}>
                                  {ev.type === "GOAL" ? "⚽" : ev.type === "CARD" ? (ev.detail?.toLowerCase().includes("red") ? "🟥" : "🟨") : ev.type === "SUBSTITUTION" ? "🔁" : ""}
                                  {ev.minute && <small>{ev.minute}&apos;</small>}
                                </span>
                              ))}
                            </div>
                          )}
                          {playerRating !== null && (
                            <span className={`${styles.listRatingBadge} ${ratingCls}`}>
                              {playerRating.toFixed(1)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {coach && (
              <footer>
                <span>{c.coach}</span>
                <strong>{coach}</strong>
              </footer>
            )}
          </section>
        );
      })}
    </div>
  );
}
