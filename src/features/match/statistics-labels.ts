import type { Locale } from "@/i18n/config";
const names:Record<string,[string,string,string,string,string,string]>={
  SHOTS_ON_GOAL:["Shots on target","Tirs cadrés","Tiros a puerta","Torschüsse","Tiri in porta","Finalizações no alvo"],
  SHOTS_OFF_GOAL:["Shots off target","Tirs non cadrés","Tiros fuera","Schüsse neben das Tor","Tiri fuori","Finalizações para fora"],
  TOTAL_SHOTS:["Total shots","Total des tirs","Tiros totales","Schüsse gesamt","Tiri totali","Total de finalizações"],
  BLOCKED_SHOTS:["Blocked shots","Tirs contrés","Tiros bloqueados","Geblockte Schüsse","Tiri bloccati","Finalizações bloqueadas"],
  SHOTS_INSIDEBOX:["Shots inside the box","Tirs dans la surface","Tiros dentro del área","Schüsse im Strafraum","Tiri in area","Finalizações na área"],
  SHOTS_OUTSIDEBOX:["Shots outside the box","Tirs hors surface","Tiros fuera del área","Schüsse außerhalb des Strafraums","Tiri da fuori area","Finalizações de fora da área"],
  FOULS:["Fouls","Fautes","Faltas","Fouls","Falli","Faltas"],
  CORNER_KICKS:["Corners","Corners","Córners","Ecken","Calci d’angolo","Escanteios"],
  OFFSIDES:["Offsides","Hors-jeu","Fueras de juego","Abseits","Fuorigioco","Impedimentos"],
  BALL_POSSESSION:["Possession","Possession","Posesión","Ballbesitz","Possesso","Posse de bola"],
  YELLOW_CARDS:["Yellow cards","Cartons jaunes","Tarjetas amarillas","Gelbe Karten","Cartellini gialli","Cartões amarelos"],
  RED_CARDS:["Red cards","Cartons rouges","Tarjetas rojas","Rote Karten","Cartellini rossi","Cartões vermelhos"],
  GOALKEEPER_SAVES:["Saves","Arrêts","Paradas","Paraden","Parate","Defesas"],
  TOTAL_PASSES:["Passes","Passes","Pases","Pässe","Passaggi","Passes"],
  PASSES_ACCURATE:["Accurate passes","Passes réussies","Pases completados","Angekommene Pässe","Passaggi riusciti","Passes certos"],
  PASSES:["Pass accuracy","Précision des passes","Precisión de pases","Passgenauigkeit","Precisione passaggi","Precisão dos passes"],
  EXPECTED_GOALS:["Expected goals (xG)","Buts attendus (xG)","Goles esperados (xG)","Erwartete Tore (xG)","Gol attesi (xG)","Gols esperados (xG)"],
  GOALS_PREVENTED:["Goals prevented","Buts évités","Goles evitados","Verhinderte Tore","Gol evitati","Gols evitados"],
};
export function statisticLabel(locale:Locale,label:string) {
  const index=["en","fr","es","de","it","pt"].indexOf(locale);
  return names[label.toUpperCase().replaceAll(" ","_")]?.[index] ?? label;
}
