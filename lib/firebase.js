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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBFGDZi2gWFBlHtsh2JIgklXlmzbokE7jM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "belauto-5dd94.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "belauto-5dd94",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "belauto-5dd94.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "6074251913",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:6074251913:web:60187760e6d86929016458",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SQGZS410D5",
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
        console.warn("Analytics initialization failed:", error)
        return undefined
      }
    })()
  : undefined
