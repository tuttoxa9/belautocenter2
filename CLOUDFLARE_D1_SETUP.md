# Настройка Cloudflare D1 для проекта

Этот документ содержит инструкции по настройке базы данных Cloudflare D1 и интеграции ее с вашим Next.js проектом.

## Что такое Cloudflare D1?

Cloudflare D1 — это распределенная, реляционная база данных SQL, построенная на движке SQLite. D1 работает на глобальной сети Cloudflare и предоставляет:

- Высокую производительность
- Автоматическое масштабирование
- Низкую стоимость
- Совместимость с SQLite
- Интеграцию с Cloudflare Workers и Pages

## Предварительные требования

1. Аккаунт на Cloudflare
2. Установленный Wrangler CLI (`npm install -g wrangler`)
3. Авторизация Wrangler в аккаунте Cloudflare (`wrangler login`)

## Шаги по настройке D1

### 1. Создание базы данных D1

```bash
# Создать новую базу данных D1
wrangler d1 create belautocenter-db

# Вы увидите примерно такой вывод:
# ✅ Successfully created DB 'belautocenter-db' in region 'eeur'
# Created D1 database 'belautocenter-db' with id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Сохраните ID базы данных (последняя строка вывода), он понадобится для конфигурации.

### 2. Создание таблиц

```bash
# Создание таблиц из SQL-файла
wrangler d1 execute belautocenter-db --file=./d1-schema.sql
```

### 3. Настройка Cloudflare Pages

Если вы используете Cloudflare Pages для хостинга, нужно настроить привязку D1 к вашему проекту:

1. Перейдите в Cloudflare Dashboard -> Pages -> ваш проект
2. Перейдите в раздел Settings -> Functions -> D1 database bindings
3. Добавьте новую привязку:
   - Variable name: `D1DATABASE` (будет доступно в коде как `env.D1DATABASE`)
   - D1 database: выберите созданную базу данных `belautocenter-db`

### 4. Настройка локальной разработки

Обновите файл `wrangler.toml` в корне проекта (создайте его, если его нет):

```toml
[[d1_databases]]
binding = "D1DATABASE"
database_name = "belautocenter-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # ID вашей базы данных
```

### 5. Обновление Next.js для работы с D1

#### Обновление файла `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ваши существующие настройки

  // Добавьте поддержку Cloudflare Pages
  experimental: {
    isrMemoryCacheSize: 0, // Отключите ISR-кэш для страниц, чтобы всегда получать актуальные данные
  },
};

export default nextConfig;
```

#### Обновление типов для Cloudflare Workers

Создайте или обновите файл `env.d.ts` в корне проекта:

```typescript
/// <reference types="@cloudflare/workers-types" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    // Добавьте другие переменные окружения, если необходимо
  }
}

// Расширение интерфейса IncomingMessage для запросов NextJS
declare module 'http' {
  interface IncomingMessage {
    cf?: {
      D1DATABASE: D1Database;
      // Другие CF-биндинги
    };
  }
}
```

## Работа с D1 в API-маршрутах

Для доступа к D1 в маршрутах API Next.js (Edge Runtime), используйте следующий шаблон:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const env = request.cf;
  const db = env.D1DATABASE;

  try {
    const result = await db.prepare('SELECT * FROM my_table LIMIT 10').all();
    return NextResponse.json(result.results);
  } catch (error) {
    console.error('D1 error:', error);
    return NextResponse.json(
      { error: 'Database error', details: error.message },
      { status: 500 }
    );
  }
}
```

## Локальное тестирование с D1

Для локальной разработки можно использовать локальный сервер D1:

```bash
# Запуск локального сервера разработки с D1
wrangler pages dev . --binding D1DATABASE=belautocenter-db
```

Это запустит ваш Next.js проект с подключенной локальной базой данных D1, которая эмулирует поведение реальной базы данных Cloudflare.

## Миграция данных из Firebase

Смотрите файл `D1_MIGRATION_GUIDE.md` для подробных инструкций по миграции данных из Firebase Firestore в Cloudflare D1.

## Полезные команды для работы с D1

```bash
# Просмотр списка баз данных
wrangler d1 list

# Создание локальной копии базы данных для разработки
wrangler d1 create belautocenter-db-local --local

# Выполнение SQL-запроса
wrangler d1 execute belautocenter-db --command "SELECT * FROM cars LIMIT 10"

# Резервное копирование базы данных
wrangler d1 backup belautocenter-db

# Восстановление базы данных из резервной копии
wrangler d1 restore belautocenter-db ./path/to/backup.sql
```

## Дополнительные ресурсы

- [Документация Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Руководство по интеграции D1 с Cloudflare Pages](https://developers.cloudflare.com/pages/functions/d1-and-pages-functions/)
- [SQLite документация](https://www.sqlite.org/docs.html)
