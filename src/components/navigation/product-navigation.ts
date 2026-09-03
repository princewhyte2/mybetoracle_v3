import { BarChart3, Bookmark, Compass, Home, ReceiptText, WandSparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

const items = [
  { key: "today", icon: Home, route: "today" },
  { key: "explore", icon: Compass, route: "explore" },
  { key: "accas", icon: WandSparkles, route: "multi-picks" },
  { key: "results", icon: BarChart3, route: "results" },
  { key: "saved", icon: Bookmark, route: "saved" },
  { key: "betslip", icon: ReceiptText, route: "betslip" },
] as const;

export function getProductNavigation(locale: Locale) {
  const common = getMessages(locale).common;
  return items.map((item) => ({ ...item, label: common[item.key] }));
}
