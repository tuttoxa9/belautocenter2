# Оптимизация кэширования Firestore через Cloudflare Workers

## Что было реализовано

### 1. Улучшенный Cloudflare Worker
- **Файл**: `cloudflare-worker/image-cache-worker.js`
- **Новые возможности**:
  - Улучшенное кэширование данных Firestore с ETag поддержкой
  - Поддержка CORS preflight запросов
  - Автоматическое сжатие и оптимизация заголовков
  - Детальная диагностика кэша (`X-Cache-Status`)
  - Поддержка условных запросов (If-None-Match)

### 2. Новый API роут для кэшированного доступа к Firestore
- **Файл**: `app/api/firestore/route.ts`
- **Улучшения**:
  - Автоматическое использование Cloudflare Worker при доступности
  - Fallback на прямое подключение к Firestore
  - Улучшенная генерация ETag
  - Поддержка параметров запросов (orderBy, limit)
  - Детальная статистика запросов

### 3. Библиотека для кэшированного доступа к Firestore
- **Файл**: `lib/firestore-cache.ts`
- **Функции**:
  - Автоматическое преобразование Firestore REST API ответов
  - Поддержка сложных типов данных (timestamps, arrays, maps)
  - Единый интерфейс для работы с кэшированными данными

### 4. React хуки для кэшированных данных
- **Файл**: `hooks/use-firestore-cache.ts`
- **Возможности**:
  - `useFirestoreCollection` - для коллекций
  - `useFirestoreDocument` - для документов
  - `usePrefetchFirestore` - для предзагрузки
  - Автоматическое управление состоянием загрузки
  - Поддержка stale-time и автообновления

### 5. Улучшенный middleware
- **Файл**: `middleware.ts`
- **Добавлено**:
  - Дифференцированное кэширование по типам страниц
  - Заголовки безопасности
  - Улучшенная поддержка CORS для API
  - Оптимизация для статических ресурсов

## Схема работы кэширования

```
Пользователь → Next.js App → Cloudflare Worker → Firestore
     ↑              ↑              ↑              ↑
  Browser        Edge Cache    Worker Cache   Database
  Cache         (5 мин)        (5 мин)
```

### Уровни кэширования:

1. **Browser Cache**: Кэш браузера (5 минут для данных, 1 год для статики)
2. **Cloudflare Edge Cache**: CDN кэш (5 минут с stale-while-revalidate)
3. **Worker Cache**: Кэш в Cloudflare Worker (5 минут)
4. **Application Cache**: Кэш на уровне React хуков (5 минут)

## Инструкция по развертыванию

### Шаг 1: Обновление переменных окружения

Добавьте в `.env.local`:

```env
# URL Cloudflare Worker для кэширования
NEXT_PUBLIC_FIRESTORE_CACHE_WORKER_URL=https://cache.belautocenter.by

# Или URL для разработки
# NEXT_PUBLIC_FIRESTORE_CACHE_WORKER_URL=https://autobel-cache-worker.your-account.workers.dev
```

### Шаг 2: Развертывание обновленного Worker

```bash
cd cloudflare-worker
wrangler deploy
```

### Шаг 3: Настройка DNS записей

В Cloudflare Dashboard:
1. Добавьте CNAME запись: `cache` → `autobel-cache-worker.your-account.workers.dev`
2. Убедитесь что оранжевое облако включено (проксирование)

### Шаг 4: Настройка Routes (опционально)

В Cloudflare Workers Dashboard:
1. Перейдите в Routes
2. Добавьте маршрут: `cache.belautocenter.by/*`

### Шаг 5: Тестирование

```bash
# Тест кэширования данных
curl -I "https://cache.belautocenter.by/api/firestore?collection=cars"

# Должны увидеть заголовки:
# X-Cache-Status: MISS (первый запрос)
# X-Cache-Status: HIT (повторные запросы)
# ETag: "abc123..."
# Cache-Control: public, max-age=300, stale-while-revalidate=60
```

## Мигрирование существующего кода

### Вместо прямого использования Firebase:

```typescript
// Старый код
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const snapshot = await getDocs(collection(db, "cars"))
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
```

### Используйте новые хуки:

```typescript
// Новый код
import { useFirestoreCollection } from '@/hooks/use-firestore-cache'

const { data: cars, loading, error } = useFirestoreCollection<Car>('cars', {
  staleTime: 5 * 60 * 1000, // 5 минут
  refetchOnWindowFocus: true
})
```

### Или используйте API напрямую:

```typescript
// API подход
import { firestoreCache } from '@/lib/firestore-cache'

const cars = await firestoreCache.getCollection('cars')
```

## Мониторинг производительности

### Метрики для отслеживания:

1. **Cache Hit Rate**: Процент попаданий в кэш
2. **Response Time**: Время ответа API
3. **Error Rate**: Частота ошибок
4. **Bandwidth**: Использование трафика

### Проверка в браузере:

```javascript
// В DevTools Console
fetch('/api/firestore?collection=cars')
  .then(response => {
    console.log('Cache Status:', response.headers.get('X-Cache-Status'))
    console.log('Cache Source:', response.headers.get('X-Cache-Source'))
    console.log('ETag:', response.headers.get('ETag'))
  })
```

### Cloudflare Analytics:

1. Перейдите в Workers → Analytics
2. Отслеживайте метрики производительности
3. Проверяйте логи ошибок

## Оптимизация производительности

### Настройки TTL:

- **Статические данные**: 30 минут - 1 час
- **Динамические данные**: 5-10 минут
- **Пользовательские данные**: 1-2 минуты

### Стратегии кэширования:

1. **Cache First**: Для статических данных
2. **Stale While Revalidate**: Для часто изменяющихся данных
3. **Network First**: Для критических данных

### Предзагрузка данных:

```typescript
import { usePrefetchFirestore } from '@/hooks/use-firestore-cache'

const { prefetch } = usePrefetchFirestore()

// Предзагрузка при наведении
<Link
  href="/catalog/car-123"
  onMouseEnter={() => prefetch('cars', 'car-123')}
>
  Автомобиль
</Link>
```

## Troubleshooting

### Проблемы с кэшированием:

1. **Данные не кэшируются**:
   - Проверьте DNS настройки
   - Убедитесь что Worker развернут
   - Проверьте переменные окружения

2. **Старые данные в кэше**:
   - Используйте инвалидацию кэша через админку
   - Проверьте настройки TTL
   - Убедитесь что ETag корректно генерируется

3. **Ошибки CORS**:
   - Проверьте настройки middleware
   - Убедитесь что Worker возвращает правильные заголовки
   - Проверьте конфигурацию Cloudflare

### Команды для отладки:

```bash
# Просмотр логов Worker в реальном времени
wrangler tail

# Очистка кэша Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Тест с принудительным обновлением
curl -H "Cache-Control: no-cache" "https://cache.belautocenter.by/api/firestore?collection=cars"
```

## Ожидаемые результаты

### Улучшения производительности:

- **Время загрузки страниц**: снижение на 60-80%
- **Нагрузка на Firestore**: снижение на 70-90%
- **Трафик**: снижение на 50-70%
- **TTFB (Time to First Byte)**: улучшение в 3-5 раз

### Экономия ресурсов:

- **Firestore reads**: снижение затрат до 90%
- **Bandwidth**: экономия трафика
- **Server load**: снижение нагрузки на сервер
