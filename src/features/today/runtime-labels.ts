import type { Locale } from "@/i18n/config";

type TodayRuntimeLabels = {
  international: string;
  lastDays: string;
  unavailableTitle: string;
  unavailableHelp: string;
  noFixturesTitle: string;
  noFixturesHelp: string;
};

export const todayRuntimeLabels: Record<Locale, TodayRuntimeLabels> = {
  en: { international: "International", lastDays: "Last {days} days", unavailableTitle: "Today is temporarily unavailable", unavailableHelp: "Your last verified feed could not be retrieved. Please try again shortly.", noFixturesTitle: "No fixtures for this date", noFixturesHelp: "Try another match day. The feed will update when verified fixtures are available." },
  es: { international: "Internacional", lastDays: "Últimos {days} días", unavailableTitle: "La agenda de hoy no está disponible temporalmente", unavailableHelp: "No se pudo recuperar la última agenda verificada. Vuelve a intentarlo en breve.", noFixturesTitle: "No hay partidos para esta fecha", noFixturesHelp: "Prueba otro día. La agenda se actualizará cuando haya partidos verificados." },
  fr: { international: "International", lastDays: "{days} derniers jours", unavailableTitle: "Le programme du jour est temporairement indisponible", unavailableHelp: "Le dernier programme vérifié n’a pas pu être récupéré. Réessayez dans quelques instants.", noFixturesTitle: "Aucun match à cette date", noFixturesHelp: "Essayez une autre journée. Le programme sera actualisé dès que des matchs vérifiés seront disponibles." },
  de: { international: "International", lastDays: "Letzte {days} Tage", unavailableTitle: "Die heutige Übersicht ist vorübergehend nicht verfügbar", unavailableHelp: "Der letzte verifizierte Spielplan konnte nicht geladen werden. Versuche es in Kürze erneut.", noFixturesTitle: "Keine Spiele an diesem Datum", noFixturesHelp: "Wähle einen anderen Spieltag. Der Spielplan wird aktualisiert, sobald verifizierte Spiele verfügbar sind." },
  it: { international: "Internazionale", lastDays: "Ultimi {days} giorni", unavailableTitle: "Il programma di oggi non è temporaneamente disponibile", unavailableHelp: "Non è stato possibile recuperare l’ultimo programma verificato. Riprova tra poco.", noFixturesTitle: "Nessuna partita per questa data", noFixturesHelp: "Prova un altro giorno. Il programma verrà aggiornato quando saranno disponibili partite verificate." },
  pt: { international: "Internacional", lastDays: "Últimos {days} dias", unavailableTitle: "A programação de hoje está temporariamente indisponível", unavailableHelp: "Não foi possível recuperar a última programação verificada. Tente novamente em instantes.", noFixturesTitle: "Nenhum jogo nesta data", noFixturesHelp: "Escolha outro dia. A programação será atualizada quando houver jogos verificados." },
};

export function interpolateRuntimeLabel(value: string, fields: Record<string, string | number>) {
  return Object.entries(fields).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}
