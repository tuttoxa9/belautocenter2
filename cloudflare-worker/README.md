# Cloudflare Worker для BelAutoCenter

Этот Cloudflare Worker предоставляет несколько важных функций для веб-сайта BelAutoCenter:

1. Кэширование и проксирование данных из Firestore
2. Обработка и кэширование изображений из R2 и Firebase Storage
3. Загрузка и удаление файлов в/из Cloudflare R2

## Настройка Cloudflare Workers

### Предварительные требования

1. Аккаунт Cloudflare с подключенным доменом
2. Включенные Workers и R2 в вашем аккаунте Cloudflare
3. Установленный Wrangler CLI (`npm install -g wrangler`)

### Шаги настройки

1. **Аутентификация в Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Создание R2 bucket**:
   ```bash
   wrangler r2 bucket create belautocenter
   ```

3. **Настройка переменных окружения**:
   - Проверьте файл `wrangler.toml` и убедитесь, что ID проекта Firebase верный
   - При необходимости, добавьте дополнительные переменные окружения:
     ```bash
     wrangler secret put CUSTOM_SECRET
     ```

4. **Публикация воркера**:
   ```bash
   # Для разработки
   wrangler deploy --env development

   # Для продакшена
   wrangler deploy --env production
   ```

## Функциональность

### 1. Обработка Firestore запросов

Worker проксирует и кэширует запросы к Firebase Firestore. Пример URL:
```
https://cache.belautocenter.by/api/firestore?collection=cars
```

### 2. Управление изображениями

Worker обрабатывает запросы к изображениям, извлекая их из Cloudflare R2 или Firebase Storage. Пример URL:
```
https://images.belautocenter.by/cars/my-image.jpg
```

### 3. Загрузка файлов в R2

Worker обрабатывает POST запросы для загрузки файлов в Cloudflare R2. Пример:
```
POST https://api.belautocenter.by/api/r2-upload
Content-Type: multipart/form-data
...
```

## Мониторинг и отладка

Для мониторинга и отладки воркера используйте панель управления Cloudflare:

1. Войдите в аккаунт Cloudflare
2. Перейдите в раздел Workers & Pages
3. Выберите свой воркер
4. Используйте инструменты мониторинга и логирования

## Интеграция с NextJS

В вашем Next.js приложении используйте API эндпоинты для взаимодействия с воркером:

- `/api/firestore` - для данных из Firestore
- `/api/r2-upload` - для загрузки файлов
- `/api/r2-delete` - для удаления файлов

## Производительность и кэширование

Worker оптимизирован для максимальной производительности:

- Кэширование Firestore данных на 30 часов
- Кэширование изображений на 30 дней
- Поддержка условных запросов с ETag
- Stale-while-revalidate для снижения задержек
