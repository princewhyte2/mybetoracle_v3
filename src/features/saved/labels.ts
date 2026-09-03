import type { Locale } from "@/i18n/config";
type Labels = { title: string; subtitle: string; matches: string; accumulators: string; following: string; alerts: string; next: string; share: string };
export const savedLabels: Record<Locale, Labels> = {
  en:{title:"Saved",subtitle:"Your matches, Multi-Picks and followed football in one place.",matches:"Matches",accumulators:"Multi-Picks",following:"Following",alerts:"Alerts",next:"Next for you",share:"Share"},
  es:{title:"Guardado",subtitle:"Tus partidos, Multi-Picks y fútbol seguido en un solo lugar.",matches:"Partidos",accumulators:"Multi-Picks",following:"Siguiendo",alerts:"Alertas",next:"Lo próximo",share:"Compartir"},
  fr:{title:"Enregistré",subtitle:"Vos matchs, Multi-Picks et suivis au même endroit.",matches:"Matchs",accumulators:"Multi-Picks",following:"Suivis",alerts:"Alertes",next:"À venir",share:"Partager"},
  de:{title:"Gespeichert",subtitle:"Deine Spiele, Multi-Picks und Favoriten an einem Ort.",matches:"Spiele",accumulators:"Multi-Picks",following:"Gefolgt",alerts:"Alarme",next:"Als Nächstes",share:"Teilen"},
  it:{title:"Salvati",subtitle:"Partite, Multi-Picks e preferiti in un unico posto.",matches:"Partite",accumulators:"Multi-Picks",following:"Seguiti",alerts:"Avvisi",next:"Prossimi",share:"Condividi"},
  pt:{title:"Guardados",subtitle:"Jogos, Multi-Picks e favoritos em um só lugar.",matches:"Jogos",accumulators:"Multi-Picks",following:"Seguindo",alerts:"Alertas",next:"A seguir",share:"Partilhar"},
};
