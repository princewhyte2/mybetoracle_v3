// Shared schema.org EventAttendanceMode-adjacent status mapping, used
// wherever a real fixture status code needs to become a schema.org
// eventStatus value -- Match Detail's SportsEvent JSON-LD, and Today/
// Tomorrow's ItemList of SportsEvent entries.
export function schemaEventStatus(code: string): string {
  if (["FT", "AET", "PEN"].includes(code)) return "https://schema.org/EventCompleted";
  if (["PST", "CANC", "ABD"].includes(code)) return code === "PST" ? "https://schema.org/EventPostponed" : "https://schema.org/EventCancelled";
  if (["NS", "TBD"].includes(code)) return "https://schema.org/EventScheduled";
  return "https://schema.org/EventInProgress";
}
