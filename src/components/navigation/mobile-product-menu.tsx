"use client";

import { Flame, HelpCircle, ReceiptText, SlidersHorizontal, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import styles from "@/features/today/today-experience.module.css";

const moreItems = [
  { label: "betslip", icon: ReceiptText, route: "betslip" },
  { label: "streaks", icon: Flame, route: "streaks" },
  { label: "profile", icon: UserCircle, route: "profile" },
  { label: "preferences", icon: SlidersHorizontal, route: "preferences" },
  { label: "support", icon: HelpCircle, route: "support" },
] as const;

export function MobileProductMenu({ locale, activeRoute, onNavigate }: { locale: Locale; activeRoute: string; onNavigate?: () => void }) {
  const router = useRouter();
  const copy = getMessages(locale).common;
  const navigate = (route: string) => {
    onNavigate?.();
    router.push(`/${locale}/${route}`);
  };

  return <nav className={styles.mobileMenu} aria-label={copy.mobileNavigation}>
    <span className={styles.mobileMenuHeading}>{copy.more}</span>
    {moreItems.map(({ label, icon: Icon, route }) => <button key={route} aria-current={activeRoute === route ? "page" : undefined} onClick={() => navigate(route)}><Icon size={17} />{copy[label]}</button>)}
  </nav>;
}
