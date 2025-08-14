# Настройка Cloudflare R2 для хранения изображений

Этот документ описывает процесс настройки Cloudflare R2 для хранения изображений в проекте belautocenter2.

## Предварительные требования

1. Аккаунт Cloudflare с доступом к R2 (https://dash.cloudflare.com)
2. Созданный R2 bucket с названием `belautocenter` (или другим на ваш выбор)
3. Настроенный публичный доступ к bucket через Cloudflare

## Настройка переменных окружения

Добавьте следующие переменные окружения в ваш проект (например, в файл `.env.local`):

```
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=<Ваш Cloudflare Account ID>
R2_ACCESS_KEY_ID=<Ваш R2 Access Key ID>
R2_SECRET_ACCESS_KEY=<Ваш R2 Secret Access Key>
R2_BUCKET_NAME=belautocenter
NEXT_PUBLIC_R2_PUBLIC_URL=https://<ваш-поддомен>.r2.dev
```

## Создание ключей доступа R2

1. Войдите в Cloudflare Dashboard: https://dash.cloudflare.com
2. Перейдите в раздел R2
3. В левом меню выберите "Manage R2 API Tokens"
4. Создайте новый токен с правами на чтение и запись для вашего bucket
5. Сохраните ключи доступа (Access Key ID и Secret Access Key) в безопасном месте

## Настройка публичного доступа к R2 bucket

1. В Cloudflare Dashboard перейдите в раздел R2
2. Выберите ваш bucket `belautocenter`
3. Перейдите на вкладку "Settings"
4. В разделе "Public Access" включите публичный доступ
5. Скопируйте предоставленный публичный URL (вида `https://<ваш-поддомен>.r2.dev`) и добавьте его в переменную окружения `NEXT_PUBLIC_R2_PUBLIC_URL`

## Проверка настройки

После настройки R2 и переменных окружения, ваш проект будет автоматически использовать Cloudflare R2 для хранения новых изображений. Существующие изображения в Firebase Storage будут по-прежнему доступны через механизм кэширования.

## Миграция существующих изображений из Firebase Storage в R2 (опционально)

Для миграции существующих изображений из Firebase Storage в Cloudflare R2 можно использовать скрипт миграции. Этот скрипт не включен в базовую конфигурацию и должен быть разработан отдельно с учетом структуры ваших данных.

## Устранение неполадок

Если у вас возникают проблемы с доступом к изображениям:

1. Убедитесь, что переменные окружения настроены правильно
2. Проверьте публичный доступ к вашему R2 bucket
3. Проверьте права доступа ключей API
4. Проверьте логи в консоли браузера при загрузке изображений

## Дополнительная информация

- [Документация Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare R2 API Reference](https://developers.cloudflare.com/r2/api/s3/api/)
- [Настройка S3-совместимого доступа](https://developers.cloudflare.com/r2/api/s3/tokens/)
