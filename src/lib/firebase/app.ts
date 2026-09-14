"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { firebaseConfig } from "./config";

// Single call site for initializeApp() across the whole client bundle.
// Auth and Analytics must never each call initializeApp() with their own
// config object -- whichever module runs first would "win" via
// getApps().length ? getApp() : ..., silently dropping any fields (like
// measurementId) that only the second caller's config included.
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
