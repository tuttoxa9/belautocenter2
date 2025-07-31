const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyBFGDZi2gWFBlHtsh2JIgklXlmzbokE7jM",
  authDomain: "belauto-5dd94.firebaseapp.com",
  projectId: "belauto-5dd94",
  storageBucket: "belauto-5dd94.firebasestorage.app",
  messagingSenderId: "6074251913",
  appId: "1:6074251913:web:60187760e6d86929016458",
  measurementId: "G-SQGZS410D5"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedSettings() {
  try {
    // Настройки main
    const mainSettings = {
      companyName: "Белавто Центр",
      phone: "+375 29 123-45-67",
      email: "info@belavto.by",
      address: "г. Минск, ул. Примерная, 123",
      workingHours: "Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00",
      socialMedia: {
        instagram: "#",
        telegram: "#",
        avby: "#",
        tiktok: "#",
      },
      yandexMapsApiKey: "",
      showroomInfo: {
        title: "Где посмотреть",
        companyName: "Автохаус Белавто Центр",
        address: "г. Минск, ул. Большое Стиклево 83",
        phone: "+375 29 123-45-67",
        workingHours: {
          weekdays: "Пн-Пт: 9:00-21:00",
          weekends: "Сб-Вс: 10:00-20:00"
        }
      }
    };

    await setDoc(doc(db, "settings", "main"), mainSettings, { merge: true });
    console.log("✅ Настройки успешно инициализированы в Firestore");
  } catch (error) {
    console.error("❌ Ошибка при инициализации настроек:", error);
  }
}

seedSettings();
