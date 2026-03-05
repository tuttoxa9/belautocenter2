# Архитектурный отчет по проекту Autobel (Next.js + Firebase)

Этот отчет содержит анализ кодовой базы для принятия решения о дальнейшей оптимизации затрат на Vercel или переезде на Cloudflare Pages.

## 1. Общий стек и маршрутизация

*   **Версия Next.js:** Используется `14.2.35` (указано в `package.json`).
*   **Роутер:** Проект полностью использует **App Router** (папка `app/`). Папка `pages/` отсутствует. Маршрутизация организована через серверные компоненты (например, `app/page.tsx`, `app/catalog/page.tsx`).

## 2. Работа с Firebase (Критично для затрат)

В проекте используются оба SDK: и серверный `firebase-admin`, и клиентский `firebase/app`, а также прямые запросы к REST API Firestore.

*   **Серверный SDK (`firebase-admin`):**
    Инициализируется в файле `lib/firebase-admin.ts`:
    ```typescript
    import admin from 'firebase-admin'

    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93',
      })
    }
    export const db = admin.firestore()
    ```
    *(Примечание: В текущей кодовой базе `lib/firebase-admin.ts` объявлен, но почти нигде не используется напрямую. Вместо этого активно применяются прямые `fetch` запросы к REST API Firestore и клиентский SDK).*

*   **Клиентский SDK (`firebase/app`, `firebase/firestore` и др.):**
    Инициализируется в `lib/firebase.js`.
    Используется очень широко, особенно в:
    *   Всех компонентах админки (папка `components/admin/`: `admin-cars.tsx`, `admin-leads.tsx` и т.д.) для CRUD операций.
    *   Клиентских компонентах для отправки данных (например, `components/FinancialAssistantDrawer.tsx`, `app/catalog/[id]/car-details-client.tsx`, `app/sale/sale-modal.tsx`).

*   **Самые тяжелые/частые запросы (Прямой REST API Firestore):**
    Для серверного рендеринга и генерации статики проект делает прямые запросы к REST API Firestore с использованием `fetch`. Это происходит на самых посещаемых страницах.

    **Пример 1: Запрос списка машин для SSG (`app/catalog/[id]/page.tsx`)**
    ```typescript
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars?mask.fieldPaths=name&pageSize=300`

    const response = await fetch(firestoreUrl, {
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'NextJS-Direct-Firestore/1.0' },
      cache: 'force-cache',
      next: { tags: ['cars-list'] }
    })
    ```

    **Пример 2: Динамический API-роут для получения цены (`app/api/cars/[id]/price/route.ts`)**
    ```typescript
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${carId}`;

    const response = await fetch(firestoreUrl, {
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'NextJS-Price-API/1.0' },
      cache: 'force-cache',
      next: { tags: [`car-${carId}`, 'cars-list'] }
    });
    ```

## 3. Стратегии рендеринга (Function Invocations и CPU на Vercel)

Так как используется App Router, `getServerSideProps` отсутствует. Проект сильно опирается на статическую генерацию (SSG) с On-Demand Revalidation.

*   **Кэширование и ISR:**
    На основных страницах (`app/page.tsx`, `app/catalog/page.tsx`, `app/catalog/[id]/page.tsx`) жестко отключена автоматическая ревалидация по времени:
    ```typescript
    export const revalidate = false // Статическая генерация для Vercel. Кэш будет обновляться On-Demand.
    ```
    Все данные запрашиваются через `fetch` с `cache: 'force-cache'` и тегами (например, `next: { tags: ['cars-list', `car-${params.id}`] }`).

*   **Инвалидация кэша (On-Demand ISR):**
    Реализована через выделенный API-роут `app/api/revalidate/route.ts`. Он принимает POST-запросы от вебхуков или из админки и вызывает `revalidatePath(path, 'page')`.
    Этот механизм хорош, но если контент меняется часто, каждое обновление провоцирует Function Invocation и тратит CPU на перегенерацию страниц на Vercel.

*   **API-роуты (`app/api/...`):**
    *   `/api/cars/[id]/price/route.ts` — получение актуальной цены авто.
    *   `/api/exchange-rate/route.ts` — курсы валют.
    *   `/api/revalidate/route.ts` — эндпоинт для сброса кэша Next.js, Vercel Edge и Cloudflare.
    *   `/api/send-telegram/route.ts` — отправка заявок/лидов в Telegram.
    *   `/api/meta-webhook/route.ts` — вебхуки для Facebook/Meta Leads.

## 4. Оценка времени сборок (Build Minutes)

*   **Секция `scripts` в `package.json`:**
    ```json
    "scripts": {
      "build": "next build",
      "dev": "next dev -H 0.0.0.0",
      "pages:build": "npx @cloudflare/next-on-pages",
      "deploy": "npm run pages:build && wrangler pages deploy",
      // ... скрипты для worker
    }
    ```
    Уже присутствует интеграция `@cloudflare/next-on-pages` для билда под Cloudflare.

*   **Генерация статических страниц (`generateStaticParams`):**
    В `app/catalog/[id]/page.tsx` используется `generateStaticParams`. Он запрашивает до 300 документов из Firestore (только их имена/ID) во время сборки:
    ```typescript
    export async function generateStaticParams() {
      // ... fetch: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars?mask.fieldPaths=name&pageSize=300`
      return data.documents.map((doc: any) => ({ id: doc.name.split('/').pop() }))
    }
    ```
    Если автомобилей много, генерация сотен статических страниц при каждом билде может занимать значительное время (Build Minutes).

## 5. Блокеры для переезда на Cloudflare Pages (Edge Runtime)

Проект уже частично адаптирован под Cloudflare Pages (есть скрипты `pages:build` и `wrangler.toml`), но остаются важные нюансы:

*   **Node.js модули (`fs`, `path`, `crypto` и др.):**
    Явных импортов серверных модулей `fs`, `path`, `crypto` в компонентах и API роутах **не обнаружено**. В `next.config.mjs` уже предусмотрен фикс для клиентского бандла:
    ```javascript
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false, crypto: false }
    ```

*   **Компонент `<Image />` из `next/image`:**
    **Используется повсеместно!** Во многих файлах (например, `app/catalog/[id]/car-details-client.tsx`, `components/header.tsx`, `components/lazy-thumbnail.tsx` и др.).
    *Критично:* На Cloudflare Pages стандартная серверная оптимизация изображений Next.js не работает "из коробки" так же, как на Vercel. Однако, в `next.config.mjs` уже выставлено `unoptimized: true` в настройках `images`, что отключает оптимизацию Next.js и позволяет изображениям работать на Cloudflare.

*   **Middleware (`middleware.ts`):**
    Присутствует. Логика достаточно легкая: устанавливает заголовки безопасности (`X-Frame-Options` и др.) и жестко управляет заголовками кэширования `Cache-Control` и `CDN-Cache-Control` (для API Firestore и публичных страниц).
    При переезде на Cloudflare Pages придется убедиться, что эти заголовки корректно обрабатываются их Edge-кэшем, так как `CDN-Cache-Control` (с `s-maxage`) — это специфика Vercel/CDN. Cloudflare использует директивы `s-maxage` из обычного `Cache-Control` или настраивается через Page Rules/Cache Rules.

### Итог для DevOps
Кодовая база уже подготовлена к Cloudflare Pages (отключена оптимизация `<Image>`, добавлены скрипты `@cloudflare/next-on-pages`, нет жесткой привязки к `fs`/`path`). Главная причина "сжирания" лимитов на Vercel — это `revalidatePath` в `app/api/revalidate/route.ts`, который при каждом обновлении данных в Firebase пересобирает статические страницы каталога On-Demand (Function Invocations) и частые прямые `fetch` к Firestore.
