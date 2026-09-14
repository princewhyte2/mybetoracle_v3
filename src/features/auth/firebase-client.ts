"use client";

import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/app";
import { isAuthConfigured } from "@/lib/firebase/config";

export function firebaseAuth() {
  if (!isAuthConfigured()) throw new Error("Firebase web authentication is not configured");
  const auth = getAuth(getFirebaseApp()); return setPersistence(auth, inMemoryPersistence).then(() => auth);
}
