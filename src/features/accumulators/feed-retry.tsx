import Link from "next/link";
import type { Locale } from "@/i18n/config";

const copy = {
  en:["We couldn’t load this page. Please try again.","Try again","Today"],
  fr:["Impossible de charger cette page. Veuillez réessayer.","Réessayer","Aujourd’hui"],
  es:["No pudimos cargar esta página. Inténtalo de nuevo.","Reintentar","Hoy"],
  de:["Diese Seite konnte nicht geladen werden. Bitte erneut versuchen.","Erneut versuchen","Heute"],
  it:["Impossibile caricare questa pagina. Riprova.","Riprova","Oggi"],
  pt:["Não foi possível carregar esta página. Tente novamente.","Tentar novamente","Hoje"],
};
export function FeedRetry({locale,title,href}:{locale:Locale;title:string;href:string}) {
  const c=copy[locale];
  return <main style={{minHeight:"70vh",display:"grid",placeItems:"center",padding:"2rem"}}>
    <section style={{maxWidth:560,textAlign:"center"}}><span>MyBetOracle</span><h1>{title}</h1><p>{c[0]}</p>
      <nav style={{display:"flex",justifyContent:"center",gap:24,marginTop:24}}>
        <a href={href}>{c[1]}</a><Link href={`/${locale}/today`}>{c[2]}</Link>
      </nav>
    </section>
  </main>;
}
