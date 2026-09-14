"use client";

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { predictionMarketLabel } from '@/i18n/prediction-markets';
import type { Match, MarketSelection, PredictionMarket } from './types';
import styles from './market-intelligence.module.css';

import { intelligenceCopy } from './market-intelligence-copy';
export { intelligenceCopy } from './market-intelligence-copy';

export function selectionText(selection: MarketSelection, locale: Locale): string {
  if (selection.selectionShortLabel) return selection.selectionShortLabel;
  const w = intelligenceCopy(locale);
  const sides: Record<string,string> = { HOME: w[11], DRAW: w[12], AWAY: w[13], YES: w[16], NO: w[17] };
  if (selection.marketType === 'HALFTIME_FULLTIME') return selection.marketValue.split('_').map(s => sides[s]).join(' / ');
  if (sides[selection.marketValue]) return sides[selection.marketValue];
  const handicap = /^(HOME|AWAY)_(PLUS|MINUS)_(\d+)(?:_(\d+))?$/.exec(selection.marketValue);
  if (handicap) return `${sides[handicap[1]]} ${handicap[2] === 'PLUS' ? '+' : '−'}${new Intl.NumberFormat(locale).format(Number(`${handicap[3]}.${handicap[4] ?? 0}`))}`;
  const total = /^(OVER|UNDER)_(\d+)_(\d+)$/.exec(selection.marketValue);
  return total ? `${total[1] === 'OVER' ? w[14] : w[15]} ${new Intl.NumberFormat(locale).format(Number(`${total[2]}.${total[3]}`))}` : selection.marketValue;
}

export function MarketIntelligence({ match, group, locale }: { match: Match; group: PredictionMarket; locale: Locale }) {
  const w = intelligenceCopy(locale);
  const [inPlay, setInPlay] = useState(match.state === 'live');
  const [line, setLine] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(timer); }, []);
  const market = match.markets[group];
  const live = match.livePrediction;
  const age = live ? now - Date.parse(live.sourceObservedAt) : Infinity;
  const liveMarket = live?.markets.find(item => item.marketGroup === group);
  const liveAvailable = match.state === 'live' && age >= 0 && age <= 180000 && liveMarket?.availability === 'AVAILABLE';
  const selections = (inPlay ? liveAvailable ? liveMarket.selections : [] : market.selections?.length ? market.selections : market.available && market.marketType && market.marketValue && market.probability != null ? [{ marketType: market.marketType, marketValue: market.marketValue, probability: market.probability, selectionShortLabel: market.shortSelection }] : []).filter(s => Number.isFinite(s.probability));
  const lineKey = (s: MarketSelection) => String(s.marketType === 'ASIAN_HANDICAP' && s.marketValue.startsWith('AWAY') ? -s.line! : s.line);
  const lines = [...new Set(selections.filter(s=>s.line !== undefined).map(lineKey))].sort((a,b)=>Number(a)-Number(b));
  const selectedLine = lines.includes(line) ? line : lines.includes(group==='CORNERS'?'9.5':group==='CARDS'?'3.5':'-1.5') ? (group==='CORNERS'?'9.5':group==='CARDS'?'3.5':'-1.5') : lines[0];
  const visible = selections.filter(s=>s.line===undefined || lineKey(s)===selectedLine);
  const percent = (p:number) => new Intl.NumberFormat(locale,{ style:'percent', maximumFractionDigits:1 }).format(p);
  const sample = market.evidence?.samples;
  return <section className={styles.panel} aria-label={w[0]}>
    <header><div><small>{w[0]}</small><h3>{predictionMarketLabel(locale,group)}</h3></div>
      {match.state==='live' && <div className={styles.phase}><button aria-pressed={!inPlay} onClick={()=>setInPlay(false)}>{w[1]}</button><button aria-pressed={inPlay} onClick={()=>setInPlay(true)}>{w[2]}</button></div>}
    </header>
    {inPlay && <p className={styles.freshness}>{!liveAvailable?w[7]:`${age>90000?w[8]:w[9]} · ${new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(live!.sourceObservedAt))}`}</p>}
    {lines.length>1 && <label className={styles.line}>{w[5]}<select value={selectedLine} onChange={e=>setLine(e.target.value)}>{lines.map(value=><option key={value} value={value}>{group==='HANDICAP'?`${w[11]} `:''}{new Intl.NumberFormat(locale,{signDisplay:group==='HANDICAP'?'always':'auto'}).format(Number(value))}</option>)}</select></label>}
    {visible.length===0 ? <p className={styles.empty}>{inPlay?w[7]:w[6]}</p> : <>
      <div className={styles.legend}><span>{group==='HALFTIME_FULLTIME'?`${w[23]} / ${w[24]}`:w[3]}</span><span>{w[3]}</span></div>
      <div className={group==='HALFTIME_FULLTIME'?styles.matrix:styles.outcomes}>{visible.map(s=><div key={s.marketValue} className={styles.outcome}>
        <span>{selectionText(s,locale)}</span><strong>{percent(s.probability)}</strong><meter min={0} max={1} value={s.probability} aria-label={selectionText(s,locale)} />
        {!inPlay && s.latestOdds?.[0] && <small>{w[4]} {new Intl.NumberFormat(locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(s.latestOdds[0].decimalOdds)}</small>}
        {s.distribution && <small>{Object.entries(s.distribution).filter(([,p])=>p>0.0005).map(([key,p])=>`${key==='WON'?'✓':key==='LOST'?'×':key==='PUSH'?'↔':key==='HALF_WON'?'½ ✓':'½ ×'} ${percent(p)}`).join(' · ')}</small>}
      </div>)}</div>
    </>}
    {group==='CARDS' && <p className={styles.note}>{w[18]}</p>}
    {sample && <footer>{sample.homeOverall ?? 0} / {sample.awayOverall ?? 0} {w[10]} · {inPlay?w[2]:w[1]}</footer>}
  </section>;
}
