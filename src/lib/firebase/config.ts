const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const AUTH_REQUIRED_KEYS = ["apiKey", "authDomain", "projectId", "messagingSenderId", "appId"] as const;

export { firebaseConfig };

export function isAuthConfigured(): boolean {
  return AUTH_REQUIRED_KEYS.every((key) => !!firebaseConfig[key]);
}

export function isMeasurementConfigured(): boolean {
  return !!firebaseConfig.measurementId;
}
