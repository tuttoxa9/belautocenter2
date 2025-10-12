# 🚀 Инструкция по настройке кэширования для BelAutoCenter

## ⚠️ Важно: Настройка переменных окружения в Vercel

Для работы системы кэширования необходимо настроить переменные окружения в **Vercel Dashboard**.

---

## 📝 Шаг 1: Откройте Vercel Dashboard

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите в ваш проект **belautocenter2**
3. Нажмите **Settings** (Настройки)
4. Перейдите в раздел **Environment Variables** (Переменные окружения)

---

## 🔑 Шаг 2: Добавьте обязательные переменные

### 2.1. API ключ для очистки кэша

Этот ключ используется для защиты API очистки кэша.

```
Name: CACHE_INVALIDATION_API_KEY
Value: любой_случайный_ключ_например_abc123xyz456
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY
Value: тот_же_ключ_abc123xyz456
Environment: Production, Preview, Development
```

⚠️ **Важно**: Оба ключа должны быть **одинаковыми**!

**Как сгенерировать случайный ключ:**
- Используйте любой генератор паролей
- Или введите в терминале: `openssl rand -base64 32`
- Или просто придумайте: `mySecretKey123!@#`

---

### 2.2. Cloudflare Zone ID (опционально, но рекомендуется)

Для очистки кэша Cloudflare CDN.

```
Name: CLOUDFLARE_ZONE_ID
Value: ваш_zone_id_из_cloudflare
Environment: Production
```

**Где найти Zone ID:**
1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Выберите ваш домен `belautocenter.by`
3. В правой панели найдите **Zone ID** и скопируйте

---

### 2.3. Cloudflare API Token (опционально, но рекомендуется)

Для очистки кэша Cloudflare CDN.

```
Name: CLOUDFLARE_API_TOKEN
Value: ваш_cloudflare_api_token
Environment: Production
```

**Как создать API Token:**
1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Перейдите в **My Profile** → **API Tokens**
3. Нажмите **Create Token**
4. Выберите шаблон **"Edit zone DNS"** или **"Custom token"**
5. Настройте права:
   - ✅ **Zone → Cache Purge** (обязательно)
   - ✅ **Zone → Zone Read** (обязательно)
6. Выберите зоны: **Specific zone** → `belautocenter.by`
7. Создайте токен и скопируйте его (он покажется только один раз!)

---

### 2.4. URL сайта

```
Name: NEXT_PUBLIC_BASE_URL
Value: https://belautocenter.by
Environment: Production, Preview, Development
```

---

### 2.5. Vercel API Token (опционально)

Для программной очистки Vercel Edge Cache.

```
Name: VERCEL_API_TOKEN
Value: ваш_vercel_api_token
Environment: Production
```

**Как создать Vercel API Token:**
1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите на ваш аватар → **Settings**
3. Перейдите в **Tokens**
4. Нажмите **Create**
5. Введите имя токена (например: `Cache Invalidation`)
6. Выберите **Scope**: Full Access или ограничьте до вашего проекта
7. Скопируйте токен

---

## ✅ Шаг 3: Сохраните и переразвертите

1. После добавления всех переменных нажмите **Save**
2. Vercel автоматически переразвертит ваш проект
3. Подождите завершения деплоя (1-2 минуты)

---

## 🧪 Шаг 4: Проверьте работу

1. Откройте админку: `https://belautocenter.by/adminbel`
2. Перейдите в **Настройки**
3. Нажмите кнопку **"Сбросить весь кэш"**
4. Если всё настроено правильно, вы увидите сообщение:
   ```
   ✅ Кэш успешно очищен!
   Все страницы будут загружать свежие данные.
   ```

❌ Если видите ошибку:
```
❌ Ошибка очистки кэша:
API key не настроен...
```

Значит переменные `CACHE_INVALIDATION_API_KEY` не добавлены или проект не переразвернулся.

---

## 🎯 Как работает система кэширования

### Уровни кэша:

```
┌─────────────────────────────────────────────┐
│  1. Браузер (5 минут)                       │
├─────────────────────────────────────────────┤
│  2. Vercel Edge Cache (24 часа)             │
├─────────────────────────────────────────────┤
│  3. Cloudflare CDN (24 часа)                │
├─────────────────────────────────────────────┤
│  4. Cloudflare Worker (кэш API/изображения) │
├─────────────────────────────────────────────┤
│  5. Next.js ISR (24 часа)                   │
├─────────────────────────────────────────────┤
│  6. Firebase Firestore (первоисточник)      │
└─────────────────────────────────────────────┘
```

### Автоматическая очистка кэша:

✅ **При изменении автомобиля:**
- Очищается: `/catalog`, `/catalog/[id]`, `/`

✅ **При изменении отзывов:**
- Очищается: `/reviews`, `/`

✅ **При изменении настроек:**
- Очищается: все основные страницы

✅ **Кнопка "Сбросить весь кэш":**
- Очищает **ВСЁ**: Cloudflare + Vercel + Next.js ISR

---

## 📊 Мониторинг кэша

### Проверка заголовков кэширования:

Откройте DevTools (F12) → Network → выберите любую страницу → Response Headers:

```
Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=3600
CDN-Cache-Control: public, max-age=86400, stale-while-revalidate=3600
X-Vercel-Cache: HIT (если страница из кэша)
```

### Cloudflare Analytics:

1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Выберите домен `belautocenter.by`
3. Перейдите в **Analytics & Logs** → **Traffic**
4. Смотрите **Cached Requests** (должно быть >80%)

---

## ❓ FAQ / Решение проблем

### 1. Ошибка "API key not configured"

**Решение:**
1. Добавьте переменные в Vercel Environment Variables
2. Дождитесь автоматического редеплоя
3. Обновите страницу админки

### 2. Кэш не очищается

**Проверьте:**
1. ✅ Настроены ли `CLOUDFLARE_ZONE_ID` и `CLOUDFLARE_API_TOKEN`
2. ✅ Права API токена (Cache Purge)
3. ✅ Правильный ли Zone ID

### 3. Старые данные всё ещё отображаются

**Решение:**
1. Нажмите **"Сбросить весь кэш"** в админке
2. Жёсткое обновление браузера: `Ctrl+Shift+R` (Windows) или `Cmd+Shift+R` (Mac)
3. Откройте страницу в режиме инкогнито

### 4. Vercel не очищает кэш

**Проверьте:**
1. Добавлен ли `VERCEL_API_TOKEN` (необязательно, но рекомендуется)
2. Next.js `revalidatePath` работает автоматически для Vercel Edge Cache

---

## 📈 Ожидаемые улучшения

После настройки системы кэширования:

- ⚡ **Скорость загрузки**: ↑ в 3-5 раз
- 💰 **Запросы к Firestore**: ↓ на 90%
- 📊 **Cache Hit Rate**: 85-95%
- 💵 **Экономия**: ~$50-100/месяц на Firestore

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера (F12 → Console)
2. Проверьте логи Vercel (Dashboard → Deployments → View Function Logs)
3. Проверьте документацию в `CACHE_SYSTEM.md`

---

✅ **После настройки всех переменных система кэширования будет работать полностью автоматически!**
