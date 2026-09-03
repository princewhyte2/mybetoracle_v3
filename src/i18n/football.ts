import type { Locale } from "./config";

const terms = {
  en: { over:"Over {line} goals",under:"Under {line} goals",btts:"Both teams to score",yes:"Yes",no:"No",toWin:"{team} to win",orDraw:"{team} or draw",winOver:"{team} to win + over {line}",orDrawOver:"{team} or draw + over {line}",drawOrUnder:"Draw or {team} + under {line}",teamGoals:"{team} over {line} team goals",homeWin:"Home team to win",homeDrawOver:"Home or draw + over {line}",corners:"Over {line} corners",mixed:"Mixed",regular:"Regular · 1X2",overUnder:"Over / Under",goals:"Goals · GG/NG" },
  es: { over:"Más de {line} goles",under:"Menos de {line} goles",btts:"Ambos equipos marcan",yes:"Sí",no:"No",toWin:"Gana {team}",orDraw:"{team} o empate",winOver:"Gana {team} + más de {line}",orDrawOver:"{team} o empate + más de {line}",drawOrUnder:"Empate o {team} + menos de {line}",teamGoals:"{team}, más de {line} goles de equipo",homeWin:"Gana el equipo local",homeDrawOver:"Local o empate + más de {line}",corners:"Más de {line} córners",mixed:"Mixto",regular:"Normal · 1X2",overUnder:"Más / Menos",goals:"Goles · GG/NG" },
  fr: { over:"Plus de {line} buts",under:"Moins de {line} buts",btts:"Les deux équipes marquent",yes:"Oui",no:"Non",toWin:"Victoire de {team}",orDraw:"{team} ou nul",winOver:"Victoire de {team} + plus de {line}",orDrawOver:"{team} ou nul + plus de {line}",drawOrUnder:"Nul ou {team} + moins de {line}",teamGoals:"Plus de {line} buts pour {team}",homeWin:"Victoire de l’équipe à domicile",homeDrawOver:"Domicile ou nul + plus de {line}",corners:"Plus de {line} corners",mixed:"Combiné",regular:"Classique · 1N2",overUnder:"Plus / Moins",goals:"Buts · BTTS" },
  de: { over:"Über {line} Tore",under:"Unter {line} Tore",btts:"Beide Teams treffen",yes:"Ja",no:"Nein",toWin:"Sieg {team}",orDraw:"{team} oder Unentschieden",winOver:"Sieg {team} + über {line}",orDrawOver:"{team} oder Unentschieden + über {line}",drawOrUnder:"Unentschieden oder {team} + unter {line}",teamGoals:"{team} über {line} Teamtore",homeWin:"Heimsieg",homeDrawOver:"Heim oder Unentschieden + über {line}",corners:"Über {line} Ecken",mixed:"Kombiniert",regular:"Standard · 1X2",overUnder:"Über / Unter",goals:"Tore · BTTS" },
  it: { over:"Over {line} gol",under:"Under {line} gol",btts:"Entrambe le squadre segnano",yes:"Sì",no:"No",toWin:"Vittoria {team}",orDraw:"{team} o pareggio",winOver:"Vittoria {team} + over {line}",orDrawOver:"{team} o pareggio + over {line}",drawOrUnder:"Pareggio o {team} + under {line}",teamGoals:"{team} over {line} gol squadra",homeWin:"Vittoria squadra di casa",homeDrawOver:"Casa o pareggio + over {line}",corners:"Over {line} corner",mixed:"Misto",regular:"Standard · 1X2",overUnder:"Over / Under",goals:"Gol · GG/NG" },
  pt: { over:"Mais de {line} gols",under:"Menos de {line} gols",btts:"Ambos os times marcam",yes:"Sim",no:"Não",toWin:"Vitória do {team}",orDraw:"{team} ou empate",winOver:"Vitória do {team} + mais de {line}",orDrawOver:"{team} ou empate + mais de {line}",drawOrUnder:"Empate ou {team} + menos de {line}",teamGoals:"{team}, mais de {line} gols do time",homeWin:"Vitória do time da casa",homeDrawOver:"Casa ou empate + mais de {line}",corners:"Mais de {line} escanteios",mixed:"Misto",regular:"Normal · 1X2",overUnder:"Mais / Menos",goals:"Gols · Ambas marcam" },
} satisfies Record<Locale, Record<string,string>>;

const orDrawUnder: Record<Locale, string> = {
  en: "{team} or draw + under {line}", es: "{team} o empate + menos de {line}", fr: "{team} ou nul + moins de {line}",
  de: "{team} oder Unentschieden + unter {line}", it: "{team} o pareggio + under {line}", pt: "{team} ou empate + menos de {line}",
};

function fill(template:string, values:Record<string,string>) { return Object.entries(values).reduce((text,[key,value])=>text.replaceAll(`{${key}}`,value),template); }

export function translateMarketSelection(locale:Locale, selection:string) {
  if (locale === "en") return selection;
  const t=terms[locale];
  if (selection === "Both teams to score") return t.btts;
  if (selection === "Home team to win") return t.homeWin;
  if (selection === "Mixed") return t.mixed;
  if (selection === "Regular · 1X2") return t.regular;
  if (selection === "Over / Under") return t.overUnder;
  if (selection === "Goals · GG/NG") return t.goals;
  let match=selection.match(/^Both teams to score · (Yes|No)$/); if(match)return `${t.btts} · ${match[1]==="Yes"?t.yes:t.no}`;
  match=selection.match(/^Over ([\d.]+) goals$/); if(match)return fill(t.over,{line:match[1]});
  match=selection.match(/^Under ([\d.]+) goals$/); if(match)return fill(t.under,{line:match[1]});
  match=selection.match(/^Over ([\d.]+) corners$/); if(match)return fill(t.corners,{line:match[1]});
  match=selection.match(/^(.+) to win$/); if(match)return fill(t.toWin,{team:match[1]});
  match=selection.match(/^(.+) or draw$/); if(match)return fill(t.orDraw,{team:match[1]});
  match=selection.match(/^(.+) win \+ over ([\d.]+)$/); if(match)return fill(t.winOver,{team:match[1],line:match[2]});
  match=selection.match(/^(.+) or draw \+ over ([\d.]+)$/); if(match)return fill(t.orDrawOver,{team:match[1],line:match[2]});
  match=selection.match(/^Draw or (.+) \+ under ([\d.]+)$/); if(match)return fill(t.drawOrUnder,{team:match[1],line:match[2]});
  match=selection.match(/^(.+) or draw \+ under ([\d.]+)$/); if(match)return fill(orDrawUnder[locale],{team:match[1],line:match[2]});
  match=selection.match(/^(.+) over ([\d.]+) team goals$/); if(match)return fill(t.teamGoals,{team:match[1],line:match[2]});
  match=selection.match(/^Home or draw \+ over ([\d.]+)$/); if(match)return fill(t.homeDrawOver,{line:match[1]});
  return selection;
}
