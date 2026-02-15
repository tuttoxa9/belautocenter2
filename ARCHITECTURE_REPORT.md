# Архитектурный анализ системы кэширования BelAutoCenter

## 1. Request Lifecycle (Жизненный цикл запроса)

### Путь запроса к странице автомобиля (`/catalog/[id]`):
1.  **Browser → Cloudflare CDN**: Запрос попадает на пограничный сервер Cloudflare.
    *   Если HTML-страница есть в кэше Cloudflare (благодаря заголовкам `s-maxage` или `CDN-Cache-Control`), она отдается мгновенно.
2.  **Cloudflare CDN → Vercel (Next.js)**: Если в Cloudflare промах (MISS), запрос передается на Vercel.
3.  **Vercel (Next.js Layer)**:
    *   Проверяется **Vercel Edge Cache** (ISR). Если страница закэширована и TTL не истек, отдается она.
    *   Если требуется регенерация (MISS или STALE):
        *   Выполняется `generateMetadata`: делает прямой запрос в Firestore API (`firestore.googleapis.com`).
        *   Выполняется `getCarData`: делает прямой запрос в Firestore API.
        *   **Next.js Data Cache**: Результаты этих `fetch` запросов также кэшируются внутри Vercel на 24 часа (согласно `next: { revalidate: 86400 }`).
4.  **Рендеринг**: Next.js собирает HTML и возвращает его Cloudflare.
5.  **Cloudflare CDN**: Кэширует полученный HTML (на 24 часа) и отдает пользователю.

### Путь запроса к API данных (Client-side):
1.  **Browser → Cloudflare Worker**: Клиентский JS делает запрос через прокси-воркер.
2.  **Cloudflare Worker**:
    *   Проверяет свой **Cache API**. Если JSON есть в кэше, он отдается.
    *   Если промах: проксирует запрос в Firestore, кэширует результат на 24 часа (`API_CACHE_TTL_SECONDS`).

---

## 2. Анализ слоев кэширования

| Слой | Тип данных | TTL | Источник TTL (в коде) |
| :--- | :--- | :--- | :--- |
| **Cloudflare Worker** | JSON (Firestore) | 24ч | `image-cache-worker.js` (line 10) |
| **Next.js Data Cache** | JSON (Firestore) | 24ч | `app/catalog/[id]/page.tsx` (line 155) |
| **Vercel Edge Cache** | HTML (Page) | 24ч | `app/catalog/[id]/page.tsx` (line 5) |
| **Cloudflare CDN** | HTML (Page) | 24ч | `middleware.ts` (line 46) |
| **Browser Cache** | HTML/JSON | 5мин | `middleware.ts` (line 46 - `max-age=300`) |

### Конфликты и проблемы:
- **Многослойность**: Даже при очистке кэша Vercel, Cloudflare CDN может продолжать отдавать старый HTML.
- **Data Cache vs ISR**: Очистка страницы (`revalidatePath`) не всегда сбрасывает внутренний `fetch` кэш, если он настроен жестко.
- **Bypass Worker**: Серверные компоненты ходят в Firestore напрямую, а клиентские — через Worker. Это создает две разные "версии" кэша данных.

---

## 3. R2 vs Firestore

- **Разделение**: Происходит внутри `image-cache-worker.js` на основе URL и метода.
- **Изображения**: `GET` запросы с расширениями файлов обрабатываются функцией `handleGetImage`, которая читает из **R2**.
- **Данные**: Все остальные запросы проксируются через `proxyFirestore` в **Google Firestore API**.
- **Кэширование**: У изображений TTL 30 дней, у данных — 24 часа.

---

## 4. Вердикт: Почему обновление занимает 24 часа?

Причина в **каскадном кэшировании с жестко заданным TTL 86400 секунд**.

### Проблемные участки кода:

1.  **В странице (`app/catalog/[id]/page.tsx`):**
    ```typescript
    export const revalidate = 86400 // Блокирует обновление HTML на сутки
    // ...
    const response = await fetch(firestoreUrl, {
      next: { revalidate: 86400 } // Блокирует обновление данных внутри Next.js на сутки
    })
    ```
2.  **В Воркере (`image-cache-worker.js`):**
    ```javascript
    const API_CACHE_TTL_SECONDS = 86400; // Блокирует обновление JSON в Cloudflare на сутки
    ```
3.  **В Middleware (`middleware.ts`):**
    ```javascript
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=86400, ...') // Говорит Cloudflare хранить HTML сутки
    ```

---

## Рекомендации по переходу на On-Demand Revalidation

1.  **Унификация путей**: Заставить и сервер, и клиент ходить за данными через одно место (лучше напрямую в Firestore API с использованием `tags` для Next.js fetch).
2.  **Использование тегов (Tags)**:
    - Заменить `revalidate: 86400` на `tags: ['cars']`.
3.  **Webhook Инвалидация**:
    - Настроить вызов `/api/revalidate` не только из админки, но и (в идеале) через Firebase Functions при изменении документа.
4.  **Синхронизация Cloudflare**:
    - При вызове `revalidatePath` в Next.js, API роут должен также отправлять запрос в Cloudflare API для очистки конкретного URL (`purge_cache`). Сейчас это реализовано частично, нужно убедиться в корректности `NEXT_PUBLIC_BASE_URL`.
