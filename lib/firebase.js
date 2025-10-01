import { initializeApp } from "firebase/app"
import {
  initializeFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"

// ─── Firebase config ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD42mXAjxiPCiapSVcqlVnEJi8ss7Kontk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "belauto-f2b93.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "belauto-f2b93",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "belauto-f2b93.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "755007664493",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:755007664493:web:dd034dae4f524b83122a64",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-C2B4Y8GGM3",
}

// ─── Initialize core SDKs ────────────────────────────────────────
const app = initializeApp(firebaseConfig)

// One -- and only one -- call to initializeFirestore registers
// the "firestore" component, preventing the "Component … not registered"
// and "Service … is not available" errors.
const firestoreSettings = typeof window === "undefined"
  ? {} // server / node – default settings
  : { experimentalForceLongPolling: true } // browser – required in sandboxed iframes (Next.js)

const db = initializeFirestore(app, firestoreSettings)

// Optional: offline persistence (ignore "already enabled" errors from another tab)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {})
}

// If you use the local emulator suite while developing, uncomment:
// if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR === "true") {
//   connectFirestoreEmulator(db, "localhost", 8080)
// }

// ─── Other Firebase services ─────────────────────────────────────
export { db }
export const storage = getStorage(app)
export const auth = getAuth(app)

// Analytics works only in the browser.
export const analytics = typeof window !== "undefined" && typeof getAnalytics !== "undefined"
  ? (() => {
      try {
        return getAnalytics(app)
      } catch (error) {
        return undefined
      }
    })()
  : undefined
