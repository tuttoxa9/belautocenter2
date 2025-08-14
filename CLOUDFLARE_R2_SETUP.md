# Настройка Cloudflare R2 для хранения изображений

Этот документ описывает процесс настройки Cloudflare R2 для хранения изображений в проекте belautocenter2.

## Предварительные требования

1. Аккаунт Cloudflare с доступом к R2 (https://dash.cloudflare.com)
2. Созданный R2 bucket с названием `belautocenter` (или другим на ваш выбор)
3. Настроенный Cloudflare Worker для обработки загрузок и запросов

## Настройка переменных окружения

Добавьте следующие переменные окружения в ваш проект (например, в файл `.env.local`):

```
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=<Ваш Cloudflare Account ID>
R2_ACCESS_KEY_ID=<Ваш R2 Access Key ID>
R2_SECRET_ACCESS_KEY=<Ваш R2 Secret Access Key>
R2_BUCKET_NAME=belautocenter
NEXT_PUBLIC_R2_PUBLIC_URL=https://images.belautocenter.by
```

## Настройка Cloudflare R2 (пошаговая инструкция)

### 1. Создание R2 Bucket

1. Войдите в Cloudflare Dashboard: https://dash.cloudflare.com
2. Перейдите в раздел R2 в боковом меню
3. Нажмите "Create bucket"
4. Введите имя bucket: `belautocenter`
5. Нажмите "Create bucket" для завершения

### 2. Создание API ключей доступа

1. В разделе R2 перейдите на вкладку "Manage R2 API Tokens"
2. Нажмите "Create API token"
3. Выберите тип токена "S3 Auth (Access Key ID & Secret Access Key)"
4. Введите имя токена (например, "BelAutoCenter Upload")
5. Выберите права:
   - Object Read (Чтение объектов)
   - Object Write (Запись объектов)
   - Object Delete (Удаление объектов)
6. Укажите TTL (срок действия) - рекомендуется "No expiration" для долгосрочного использования
7. Нажмите "Create API Token"
8. **ВАЖНО**: Скопируйте и сохраните:
   - Access Key ID
   - Secret Access Key

   Эта информация отображается только один раз!

### 3. Настройка публичного доступа через Cloudflare Worker

Для правильной работы загрузки и отображения изображений, необходимо настроить Cloudflare Worker:

1. Перейдите в раздел "Workers & Pages" в Cloudflare Dashboard
2. Нажмите "Create application" и выберите "Create Worker"
3. Загрузите код Worker из директории `cloudflare-worker` вашего проекта
4. Перейдите в настройки Worker и привяжите его к R2 bucket:
   - Перейдите в "Settings" > "Variables" > "R2 Bucket Bindings"
   - Добавьте новую привязку:
     - Variable name: `R2_BUCKET`
     - Bucket: выберите ваш bucket `belautocenter`

### 4. Настройка Custom Domain для Worker

1. В настройках Worker перейдите в "Triggers" > "Custom Domains"
2. Нажмите "Add Custom Domain"
3. Введите домен для изображений (например, `images.belautocenter.by`)
4. Убедитесь, что домен добавлен в ваш Cloudflare DNS
5. Повторите процесс для второго домена для API (например, `api.belautocenter.by`)

## Проверка настройки

После настройки R2 и Cloudflare Worker:

1. Обновите переменные окружения в вашем Next.js приложении
2. Перезапустите приложение
3. Попробуйте загрузить изображение через админ-панель
4. Проверьте, что изображение успешно загрузилось и отображается на сайте

## Тестирование Worker

Для проверки правильной работы Worker и R2:

```bash
# Проверка загрузки изображения
curl -X POST -F "file=@test.jpg" -F "path=test/image.jpg" https://api.belautocenter.by/api/r2-upload

# Проверка получения изображения
curl https://images.belautocenter.by/test/image.jpg -v
```

## Устранение распространенных ошибок

### Ошибка 403 Forbidden

- Проверьте права доступа в токене API
- Убедитесь, что Worker правильно настроен для доступа к R2

### Ошибка 404 Not Found

- Убедитесь, что путь к изображению правильный
- Проверьте, что файл был успешно загружен в R2
- Проверьте логи Worker в Cloudflare Dashboard

### Ошибка 500 Internal Server Error

- Проверьте переменные окружения в Next.js
- Проверьте логи Worker в Cloudflare Dashboard
- Убедитесь, что AWS SDK правильно настроен

## Мониторинг и анализ использования

Cloudflare предоставляет инструменты мониторинга:

1. Перейдите в раздел R2 > ваш bucket > Metrics
2. Отслеживайте использование хранилища и запросов
3. Настройте оповещения при приближении к лимитам

## Дополнительная информация

- [Документация Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [AWS SDK для JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
