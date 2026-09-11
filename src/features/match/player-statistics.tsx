import type { MatchDetail } from "./types";
import type { Locale } from "@/i18n/config";
import styles from "./match-experience.module.css";
const labels={
 en:["Player statistics","Player","Rating","Minutes","Goals","Assists"],
 fr:["Statistiques des joueurs","Joueur","Note","Minutes","Buts","Passes décisives"],
 es:["Estadísticas de jugadores","Jugador","Nota","Minutos","Goles","Asistencias"],
 de:["Spielerstatistiken","Spieler","Bewertung","Minuten","Tore","Vorlagen"],
 it:["Statistiche giocatori","Giocatore","Voto","Minuti","Gol","Assist"],
 pt:["Estatísticas dos jogadores","Jogador","Nota","Minutos","Gols","Assistências"],
};
export function PlayerStatistics({match,locale}:{match:MatchDetail;locale:Locale}) {
 const c=labels[locale];
 const fields=["rating","minutes","goals","assists"] as const;
 const usablePlayers=match.playerStatistics?.filter(player=>fields.some(field=>player[field]!==null)) ?? [];
 if(!usablePlayers.length)return null;
 return <section className={styles.contentSection}><h2>{c[0]}</h2>{(["home","away"] as const).map(side=>{
  const players=usablePlayers.filter(player=>player.teamId===match[side].id);
  const columns=fields.filter(field=>players.some(player=>player[field]!==null));
  return players.length>0 && <div key={side} style={{overflowX:"auto"}}><h3>{match[side].name}</h3><table style={{width:"100%",fontSize:12,borderCollapse:"collapse",textAlign:"left"}}><thead><tr>{[c[1],...columns.map(field=>c[fields.indexOf(field)+2])].map(label=><th key={label} style={{padding:"8px 6px"}}>{label}</th>)}</tr></thead><tbody>{players.map(player=><tr key={player.id}><th style={{padding:"9px 6px",borderTop:"1px solid #e5e7eb"}}>{player.name}</th>{columns.map(field=><td key={field} style={{padding:"9px 6px",borderTop:"1px solid #e5e7eb"}}>{player[field] ?? "—"}</td>)}</tr>)}</tbody></table></div>;
 })}</section>;
}
