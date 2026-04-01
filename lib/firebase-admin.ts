import admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'belauto-f2b93';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Replace literal '\n' characters with actual line breaks for Vercel env vars
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized with credentials');
    } else {
      console.warn('FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY is missing. Admin SDK initialized without credentials.');
      admin.initializeApp({ projectId });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const db = admin.firestore()
export default admin
