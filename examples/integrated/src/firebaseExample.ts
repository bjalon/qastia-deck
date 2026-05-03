import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export type ExampleFirebaseServices = {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly db: Firestore;
  readonly googleProvider: GoogleAuthProvider;
};

export type ExampleFirebaseConfig = {
  readonly apiKey?: string;
  readonly authDomain?: string;
  readonly projectId?: string;
  readonly storageBucket?: string;
  readonly messagingSenderId?: string;
  readonly appId?: string;
};

export function readExampleFirebaseConfig(): ExampleFirebaseConfig {
  const env = import.meta.env as Record<string, string | undefined>;

  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
}

export function hasUsableFirebaseConfig(config: ExampleFirebaseConfig): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export function createExampleFirebaseServices(config: ExampleFirebaseConfig): ExampleFirebaseServices {
  const app = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    googleProvider,
  };
}
