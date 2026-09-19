"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import styles from "./route-pending-indicator.module.css";

// Filters, date navigation, and pagination all push a new URL on the
// *same* route (searchParams only) -- Next only re-triggers loading.tsx on
// a segment change, not a searchParams-only push on an already-mounted
// page, so without this the click freezes with no feedback until the RSC
// payload returns, then snaps to new content. useTransition gives us
// isPending to show real, immediate feedback instead.
export function useRoutePendingTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pushTransition = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );
  return { isPending, pushTransition };
}

export function RoutePendingIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className={styles.bar} aria-hidden="true" />;
}
