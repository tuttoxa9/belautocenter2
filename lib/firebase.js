import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

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

// ─── Other Firebase services ─────────────────────────────────────
export const auth = getAuth(app)

// Firestore и Storage удалены.
// Все запросы к БД и картинкам идут через Cloudflare Worker (NEXT_PUBLIC_API_HOST)
