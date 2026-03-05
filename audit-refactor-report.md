# Отчет по рефакторингу: Полное удаление Firebase SDK и прокачка Cloudflare Worker

Работа завершена. Vercel больше не будет запускать ресурсоемкие процессы инициализации Firebase, так как все компоненты теперь используют легкие `fetch` запросы.

## 1. Изменения в Cloudflare Worker
- **Файл:** `cloudflare-worker/image-cache-worker.js` (перезаписан)
- **Суть изменений:**
  - Восстановлена функция `proxyFirestore`, которая проксирует запросы на `v1/projects/{projectId}/...`.
  - Внедрен парсер `flattenFirestoreDocument`. Он перехватывает ответы от Firestore REST API и преобразовывает структуру вида `{ name: "...", fields: { price: { integerValue: "100" } } }` в чистый, плоский JSON: `{ id: "...", price: 100 }`.
  - Добавлена логика обработки загрузки (`/upload`) и удаления (`/delete-image`) изображений в бакет R2 (с базовой валидацией токена через заголовок `Authorization`).

## 2. Удаление Firebase SDK из Next.js
- Firebase SDK полностью вырезан из проекта.
- **Измененные файлы (более 30 файлов):**
  - **Конфигурация:** `lib/firebase.js` (удалены `getStorage` и `initializeFirestore`).
  - **API клиенты:** `lib/firestore-api.ts` и `lib/api-client.ts`.
  - **Админка:** Все компоненты в `components/admin/` (`admin-cars.tsx`, `admin-leads.tsx`, `admin-stories.tsx` и др.).
  - **Клиентские компоненты:** `components/credit-cars-carousel.tsx`, `components/stories.tsx`, `components/FinancialAssistantDrawer.tsx`, `components/leasing-calculator.tsx`, `components/credit-conditions.tsx` и др.
  - **Страницы:** `app/catalog/[id]/car-details-client.tsx`, `app/sale/sale-modal.tsx`, `app/reviews/debug/page.tsx` и др.
- Логика загрузки/удаления картинок в `lib/storage.ts` переведена на использование POST-запросов (`/upload` и `/delete-image`) к эндпоинтам Воркера, Firebase Storage SDK больше не используется.

## 3. Пример типичного запроса ДО и ПОСЛЕ

**Как было (до рефакторинга):**
```tsx
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Загружало весь Firebase SDK, открывало сокеты (Long Polling)
const leadsQuery = query(collection(db, "leads"), orderBy("createdAt", "desc"))
const snapshot = await getDocs(leadsQuery)
const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

// Обновление
await setDoc(doc(db, "settings", "funnel"), data, { merge: true })
```

**Как стало (после рефакторинга):**
```tsx
import { firestoreApi } from '@/lib/firestore-api'

// Использует легкий fetch к https://images.belautocenter.by/v1/projects/...
// Воркер уже отдает отформатированный JSON, мы только применяем сортировку на клиенте
const data = await firestoreApi.getCollection("leads")
const leadsData = data.map(doc => ({ ...doc }))
leadsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

// Обновление
await firestoreApi.updateDocument("settings", "funnel", data)
```

## 4. Что нужно протестировать вручную
Поскольку мы полностью изменили архитектуру общения с базой данных, вам необходимо проверить:
1. **Загрузка и удаление картинок:** Зайдите в админку и попробуйте добавить новую машину или историю с картинкой. Убедитесь, что запрос на загрузку проходит, а картинка появляется.
2. **Отправка лидов (форм):** Попробуйте оставить заявку "Купить в кредит", "Обратный звонок" и "Оценить авто" на сайте. Убедитесь, что лид попадает в админку.
3. **Обновление настроек в админке:** Попробуйте изменить любой текст в `Настройки -> Воронка` или `Страницы -> О нас`. Нажмите сохранить и обновите страницу.
4. **Сортировка данных:** Так как REST API Firestore не поддерживает сложную сортировку напрямую (мы перенесли `orderBy` на клиент), проверьте, что отзывы, истории и лиды отображаются в правильном порядке (самые новые сверху).
