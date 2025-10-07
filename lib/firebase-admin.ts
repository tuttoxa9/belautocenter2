import admin from 'firebase-admin'

// Проверяем, есть ли уже инициализированные приложения
if (!admin.apps.length) {
  // Проверяем наличие необходимых учетных данных в переменных окружения
  // Это могут быть GOOGLE_APPLICATION_CREDENTIALS или другие переменные,
  // которые Firebase Admin SDK использует для авто-конфигурации.
  // Для простоты, мы можем проверить наличие хотя бы ID проекта.
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  // Инициализируем приложение, только если все необходимые данные есть
  if (projectId && privateKey && clientEmail) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Заменяем \n на реальные переносы строк для приватного ключа
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  } else {
    console.warn('Firebase Admin SDK credentials not found. Skipping initialization.');
  }
}

// Экспортируем db, только если приложение было успешно инициализировано
const db = admin.apps.length ? admin.firestore() : null;

export { db };
export default admin;