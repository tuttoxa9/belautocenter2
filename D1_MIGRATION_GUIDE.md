# Руководство по миграции с Firebase Firestore на Cloudflare D1

Этот документ содержит информацию о миграции данных с Firebase Firestore на Cloudflare D1, включая объяснение разработанной схемы и особенности перехода.

## Схема базы данных

SQL-схема определена в файле `d1-schema.sql`. Она включает следующие таблицы:

1. **cars** - автомобили в каталоге
2. **pages** - статические страницы (about, credit, leasing)
3. **privacy** - политика конфиденциальности
4. **reviews** - отзывы клиентов
5. **settings** - настройки сайта
6. **leads** - заявки клиентов
7. **stories** - истории/новости
8. **credit_conditions** - условия кредитования
9. **leasing_conditions** - условия лизинга
10. **contacts** - контактная информация
11. **cache_keys** - таблица для управления кэшированием

## Особенности миграции

### 1. Сложные типы данных

В Firestore документы могут содержать вложенные объекты и массивы. В SQL такие структуры хранятся как сериализованные JSON в текстовых полях:

- `cars.imageUrls`: массив URL-адресов изображений
- `cars.specifications`: объект с характеристиками автомобиля
- `cars.features`: массив особенностей автомобиля
- `settings.content`: JSON объект с настройками

При работе с такими полями потребуется:
1. Сериализовать данные при записи: `JSON.stringify(data)`
2. Десериализовать при чтении: `JSON.parse(textField)`

### 2. Первичные ключи

В Firestore каждый документ имеет уникальный ID. В D1 мы используем эти же ID как первичные ключи в таблицах. Для новых записей можно использовать UUID.

### 3. Типы данных

SQLite (и D1) имеет ограниченный набор типов данных:
- `TEXT` - для строк
- `INTEGER` - для целых чисел
- `REAL` - для чисел с плавающей точкой
- `BLOB` - для бинарных данных

Булевы значения в SQLite представлены как INTEGER: 1 (true) или 0 (false).

### 4. Временные метки

В Firestore временные метки хранятся как объекты типа `Timestamp`. В D1 используются числа типа `INTEGER` (unix timestamp - количество секунд с начала эпохи).

При миграции необходимо конвертировать:
```javascript
// Из Firestore в D1
const unixTimestamp = firestoreTimestamp.seconds;

// Из D1 в JavaScript Date
const date = new Date(unixTimestamp * 1000);
```

### 5. Индексы

Для оптимизации запросов созданы индексы по наиболее часто используемым полям.

## Пример миграции данных

Пример кода для миграции коллекции `cars`:

```javascript
import { db as firestoreDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { env } from "@cloudflare/workers-types";

export async function migrateCars(d1Db: D1Database) {
  // Получить все документы из Firestore
  const snapshot = await getDocs(collection(firestoreDb, "cars"));

  // Для каждого документа создать запись в D1
  for (const doc of snapshot.docs) {
    const data = doc.data();

    await d1Db.prepare(`
      INSERT INTO cars (
        id, make, model, year, price, mileage, engineVolume,
        fuelType, transmission, driveTrain, bodyType, color,
        description, isAvailable, createdAt, updatedAt,
        imageUrls, specifications, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      doc.id,
      data.make,
      data.model,
      data.year,
      data.price,
      data.mileage,
      data.engineVolume,
      data.fuelType,
      data.transmission,
      data.driveTrain,
      data.bodyType || null,
      data.color || null,
      data.description || null,
      data.isAvailable ? 1 : 0,
      data.createdAt?.seconds || Math.floor(Date.now() / 1000),
      data.updatedAt?.seconds || Math.floor(Date.now() / 1000),
      JSON.stringify(data.imageUrls || []),
      JSON.stringify(data.specifications || {}),
      JSON.stringify(data.features || [])
    ).run();
  }
}
```

## Изменение API-маршрутов

Необходимо создать новые API-маршруты для работы с D1 вместо Firestore. Пример:

```typescript
// app/api/cars/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const env = request.cf;
  const db = env.D1DATABASE;

  try {
    if (id) {
      // Получить один автомобиль
      const car = await db.prepare(
        `SELECT * FROM cars WHERE id = ?`
      ).bind(id).first();

      if (!car) {
        return NextResponse.json({ error: 'Car not found' }, { status: 404 });
      }

      // Преобразовать JSON поля
      car.imageUrls = JSON.parse(car.imageUrls || '[]');
      car.specifications = JSON.parse(car.specifications || '{}');
      car.features = JSON.parse(car.features || '[]');

      return NextResponse.json(car);
    } else {
      // Получить список автомобилей с фильтрами
      let query = `SELECT * FROM cars WHERE 1=1`;
      const queryParams = [];

      // Добавление фильтров
      const isAvailable = searchParams.get('isAvailable');
      if (isAvailable !== null) {
        query += ` AND isAvailable = ?`;
        queryParams.push(isAvailable === 'true' ? 1 : 0);
      }

      // Добавление сортировки
      const orderBy = searchParams.get('orderBy');
      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      } else {
        query += ` ORDER BY createdAt DESC`;
      }

      // Лимит
      const limit = searchParams.get('limit');
      if (limit) {
        query += ` LIMIT ?`;
        queryParams.push(parseInt(limit));
      }

      const cars = await db.prepare(query).bind(...queryParams).all();

      // Преобразовать JSON поля для каждого автомобиля
      cars.results = cars.results.map(car => {
        return {
          ...car,
          imageUrls: JSON.parse(car.imageUrls || '[]'),
          specifications: JSON.parse(car.specifications || '{}'),
          features: JSON.parse(car.features || '[]')
        };
      });

      return NextResponse.json(cars.results);
    }
  } catch (error) {
    console.error('D1 error:', error);
    return NextResponse.json(
      { error: 'Database error', details: error.message },
      { status: 500 }
    );
  }
}
```

## Кэширование

В проекте используется система кэширования для оптимизации запросов. Для работы с D1 создана таблица `cache_keys`, которая позволяет отслеживать изменения сущностей для инвалидации кэша.

## Следующие шаги

1. Создание базы данных D1 в Cloudflare
2. Применение схемы SQL
3. Миграция данных из Firestore
4. Обновление API-маршрутов
5. Обновление клиентских компонентов для работы с новым API
6. Тестирование и отладка
7. Переключение на новую базу данных
