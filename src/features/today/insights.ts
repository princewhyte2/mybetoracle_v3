import type { Locale } from "@/i18n/config";

const english = [
  "Arsenal create the stronger chance profile at home while both sides retain scoring threat.",
  "Both teams sustain high-tempo attacks, with late-game scoring probability above the league baseline.",
  "Salzburg are controlling territory, but the match remains open enough for a second-half response.",
  "Celtic's home volume gives them the edge, although the price leaves less margin than the goal market.",
  "A narrow matchup with both teams suppressing clear chances; the value sits away from the match winner.",
  "Gremio's expected territorial edge did not convert, and Cruzeiro punished both transition opportunities.",
] as const;

const translations: Record<Exclude<Locale,"en">, readonly string[]> = {
  es: ["El Arsenal genera ocasiones de mayor calidad en casa, aunque ambos equipos mantienen una amenaza real de gol.","Los dos equipos sostienen ataques de ritmo alto y la probabilidad de goles al final supera la media de la liga.","El Salzburgo controla el territorio, pero el partido sigue lo bastante abierto como para una reacción en la segunda parte.","El volumen ofensivo del Celtic en casa le da ventaja, aunque la cuota ofrece menos margen que el mercado de goles.","Partido muy igualado, con ambos equipos limitando las ocasiones claras; el valor está fuera del mercado de ganador.","La esperada superioridad territorial del Grêmio no se tradujo en ocasiones, y el Cruzeiro aprovechó las dos transiciones."],
  fr: ["Arsenal se crée les occasions les plus dangereuses à domicile, même si les deux équipes restent menaçantes devant le but.","Les deux équipes maintiennent un rythme offensif élevé, avec une probabilité de but en fin de match supérieure à la moyenne du championnat.","Salzbourg maîtrise le territoire, mais le match reste assez ouvert pour permettre une réaction en seconde période.","Le volume offensif du Celtic à domicile lui donne l’avantage, même si la cote laisse moins de marge que le marché des buts.","Une affiche serrée où les deux équipes limitent les occasions franches ; la valeur se trouve ailleurs que sur le vainqueur du match.","La domination territoriale attendue de Grêmio ne s’est pas concrétisée, et Cruzeiro a sanctionné les deux transitions."],
  de: ["Arsenal erspielt sich zu Hause die besseren Chancen, doch beide Teams bleiben torgefährlich.","Beide Teams spielen mit hohem Angriffstempo; die Wahrscheinlichkeit für späte Tore liegt über dem Ligadurchschnitt.","Salzburg kontrolliert die Räume, doch das Spiel bleibt offen genug für eine Reaktion in der zweiten Halbzeit.","Celtics hohes Offensivvolumen zu Hause verschafft ihnen Vorteile, allerdings bietet die Quote weniger Spielraum als der Tormarkt.","Ein enges Duell, in dem beide Teams klare Chancen verhindern; der bessere Ansatz liegt abseits des Siegersmarkts.","Gremios erwarteter Raumvorteil führte nicht zu Ertrag, während Cruzeiro beide Umschaltsituationen nutzte."],
  it: ["L’Arsenal crea occasioni di qualità superiore in casa, ma entrambe le squadre restano pericolose in zona gol.","Entrambe le squadre mantengono un ritmo offensivo elevato e la probabilità di gol nel finale supera la media del campionato.","Il Salisburgo controlla il territorio, ma la partita resta abbastanza aperta per una reazione nella ripresa.","Il volume offensivo casalingo del Celtic gli dà un vantaggio, anche se la quota offre meno margine rispetto al mercato dei gol.","Una sfida equilibrata in cui entrambe limitano le occasioni nitide; il valore è lontano dal mercato sul vincente.","Il previsto vantaggio territoriale del Grêmio non ha prodotto occasioni, mentre il Cruzeiro ha sfruttato entrambe le transizioni."],
  pt: ["O Arsenal cria as melhores chances em casa, embora os dois times continuem oferecendo perigo de gol.","Os dois times mantêm ataques em ritmo alto, e a probabilidade de gols no fim supera a média da competição.","O Salzburg controla o território, mas o jogo segue aberto o bastante para uma reação no segundo tempo.","O volume ofensivo do Celtic em casa lhe dá vantagem, embora a odd ofereça menos margem do que o mercado de gols.","Um confronto equilibrado, com os dois times limitando chances claras; o valor está fora do mercado de vencedor.","A superioridade territorial esperada do Grêmio não se transformou em chances, e o Cruzeiro aproveitou as duas transições."],
};

export function translateInsight(locale:Locale, insight:string) {
  if(locale==="en") return insight;
  const index=english.indexOf(insight as (typeof english)[number]);
  return index < 0 ? insight : translations[locale][index];
}
