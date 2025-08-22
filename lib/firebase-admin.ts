import admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93',
    })
  } catch (error) {
    console.error('Firebase admin initialization error', error)
  }
}

export const db = admin.firestore()
export default admin
