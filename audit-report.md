# Архитектурный Аудит Проекта: Vercel и Cloudflare Worker

Отчет составлен по результатам анализа кодовой базы проекта (Next.js). Цель: выявить причины повышенного потребления "Function Invocations" и "Fluid Active CPU" на Vercel.

## 1. Связка Next.js и Cloudflare Worker

### URL и конфигурация API
Для обращения к API используется переменная окружения `NEXT_PUBLIC_API_HOST`.
- **Файл:** `lib/api-client.ts`
- **Код:** `this.baseUrl = process.env.NEXT_PUBLIC_API_HOST || ''`
- **Документация:** В `ТЕХНИЧЕСКАЯ_ДОКУМЕНТАЦИЯ.md` указано `NEXT_PUBLIC_API_HOST=https://images.belautocenter.by`. Эта же ссылка `https://images.belautocenter.by` используется в `app/adminbel/page.tsx` по умолчанию.
- Это означает, что Cloudflare Worker настроен под доменом `images.belautocenter.by`. Однако по умолчанию, если переменная не задана в `.env`, используются относительные пути к API Next.js.

### Запросы к API (fetch)
В проекте используется кастомный клиент для запросов `ApiClient` (`lib/api-client.ts`), который оборачивает нативный `fetch`.
Примеры использования (в клиентских и серверных компонентах/хуках):
1. **Запрос курсов валют:** `fetch('https://api.nbrb.by/exrates/rates/431')` (`components/providers/usd-byn-rate-provider.tsx`, `components/admin/admin-finance.tsx`).
2. **Запрос данных кэша Firestore:** Хук `use-firestore-cache.ts` делает запросы, но он сам внутри использует нативный `fetch`.
3. Запросы к Telegram API: `fetch("/api/send-telegram", ...)` в `components/header.tsx` и `components/credit-leasing-modal.tsx`.

Полноценного массового перехода на запросы вида `fetch(NEXT_PUBLIC_API_HOST + '/api/cars')` в клиентских компонентах **не обнаружено**. В большинстве случаев данные из Firebase тянутся **напрямую через Firebase SDK**.

### Работа с изображениями
Эндпоинты Cloudflare Worker (`/upload`, `/delete-image`) не используются фронтендом напрямую для загрузки картинок. В проекте **до сих пор используется Firebase Storage**.
- **Файл:** `lib/firebase.js` содержит `import { getStorage } from "firebase/storage"` и `export const storage = getStorage(app)`.
- **Файл:** `package.json` и лок-файлы (`package-lock.json`, `bun.lock`) содержат установленный модуль `@firebase/storage`.
То есть загрузка картинок всё еще идет мимо воркера, напрямую в Firebase.

---

## 2. Использование нативного Firebase SDK

Firebase SDK **активно и повсеместно** используется в проекте, являясь главной причиной "утечки" нагрузки с Cloudflare Worker обратно на серверы/клиенты Next.js.

### В каких файлах используется:
- **`lib/firebase.js`**: Инициализация `firebase/firestore`, `firebase/storage`, `firebase/auth`.
- **`lib/firestore-api.ts`** и **`lib/firestore-cache.ts`**: Обертки для работы с БД.
- **Компоненты админки (`components/admin/`)**: Почти во всех файлах админки (например, `admin-cars.tsx`, `admin-leads.tsx`, `admin-settings.tsx`) используются прямые импорты:
  `import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"`
- **Клиентские компоненты (`components/`)**:
  - `credit-cars-carousel.tsx` (`getDocs`)
  - `stories.tsx` (`getDocs`, `getDoc`)
  - `leasing-calculator.tsx`, `credit-conditions.tsx` (`getDoc`)
- **Динамические импорты Firebase в компонентах**:
  Для уменьшения бандла разработчики сделали отложенную загрузку (dynamic import), но она всё равно происходит:
  - `app/sale/sale-modal.tsx`: `const { doc, getDoc } = await import("firebase/firestore")`
  - `app/catalog/[id]/car-details-client.tsx`: `const { collection, addDoc } = await import('firebase/firestore')`
  - `components/FinancialAssistantDrawer.tsx`: `import('firebase/firestore').then(...)`

### Используются ли импорты Firebase SDK внутри серверных компонентов?
**Да.**
- В серверном компоненте **`app/page.tsx`** вызывается `firestoreApi.getDocument("pages", "main")` и `firestoreApi.getCollection("cars")`. Эти методы под капотом используют `firebase-admin` или обычный `firebase/firestore`.
- Хук `use-settings.ts` и другие данные тянутся при SSR.

---

## 3. Стратегии рендеринга в Next.js

### Кэширование запросов `fetch`
Там, где используется нативный `fetch` (например, в серверных API-рутах или при генерации страниц), передается параметр `cache: 'force-cache'`, что является **правильным** решением для снижения нагрузки.
- Примеры: `app/catalog/page.tsx` (стр. 62), `app/catalog/[id]/page.tsx` (стр. 57, 97, 211), `app/api/cars/[id]/price/route.ts` (стр. 27).
- `fetch(..., { cache: 'no-store' })` в проекте **отсутствует**.

### Директивы страниц
- `export const dynamic = 'force-dynamic'` — **не используется**.
- `export const revalidate = 0` — **не используется**.
Вместо этого на главных страницах используется On-Demand ISR:
- **`app/page.tsx`**: `export const revalidate = false`
- **`app/catalog/page.tsx`**: `export const revalidate = false`
- **`app/catalog/[id]/page.tsx`**: `export const revalidate = false`
Это означает, что страницы генерируются статически, что должно экономить CPU Vercel.

### Использование динамических функций (`cookies()`, `headers()`, `useSearchParams()`)
- Функции `cookies()` и `headers()` из `next/headers` **не используются** в проекте.
- `useSearchParams` также **не используется**.
Единственные функции из `next/navigation` — это `usePathname` и `useRouter` в клиентских компонентах (например, `components/header.tsx`, `app/catalog/[id]/car-details-client.tsx`), которые **не делают** страницу динамической на сервере.

---

## 4. Общие итоги аудита для архитектора

1. **Завязка Next.js на Cloudflare Worker: ~10-15%.**
   Воркер почти не используется по своему прямому назначению. Архитектура предполагала, что воркер будет проксировать запросы к Firestore и R2, но по факту фронтенд и бэкенд Next.js продолжают использовать тяжелый официальный Firebase SDK (`firebase/firestore`, `firebase/storage`) как на клиенте, так и на сервере.

2. **Почему Vercel тратит ресурсы (Function Invocations / CPU):**
   Несмотря на то что страницы настроены на статическую генерацию (`revalidate = false`), проблема кроется в **клиентских запросах и серверных API рутах**.
   Каждый раз, когда пользователь заходит на сайт, клиентские компоненты (например, карусель кредитных авто, истории, отправка лидов) и клиентские хуки делают прямые запросы в Firestore через SDK. Если эти запросы обернуты в API-роуты Next.js (в папке `app/api/`), то каждый вызов такого роута — это Function Invocation на стороне Vercel, внутри которого инициализируется и работает тяжелый Firebase SDK.

3. **Что нагружает Vercel больше всего:**
   - **Firebase SDK на клиенте/сервере**: Он открывает веб-сокеты или использует long-polling (в коде включено `experimentalForceLongPolling: true`), что держит соединения открытыми и тратит активное время (Fluid Active CPU) в бессерверных функциях Vercel.
   - **Картинки**: Загрузка картинок всё еще идет через `firebase/storage` (вместо эндпоинта воркера `/upload` в R2).

### Вывод
Next.js обходит Cloudflare Worker стороной. Чтобы Worker начал выполнять свою функцию и снял нагрузку с Vercel, необходимо **полностью удалить** импорты `firebase/firestore` и `firebase/storage` из проекта, переписав все обращения к базе данных и хранилищу на обычные REST `fetch` запросы к URL вашего воркера (`https://images.belautocenter.by`).
