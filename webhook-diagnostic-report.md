# ОТЧЁТ О ДИАГНОСТИКЕ WEBHOOK

## 1. Анализ Кода:

Я проанализировал код в `app/api/meta-webhook/route.ts`.

### Логика верификации (`GET`):
✅ **Код выглядит корректным:**
- Правильно извлекаются параметры `hub.mode`, `hub.challenge`, `hub.verify_token` из URL через `request.nextUrl.searchParams`
- Сравнение `hub.verify_token` с `process.env.META_VERIFY_TOKEN` происходит корректно с точным совпадением
- При успешной верификации возвращается `challenge` со статусом 200
- При ошибке возвращается 403 или 500 с понятными сообщениями
- Код обернут в try-catch для обработки непредвиденных ошибок

⚠️ **Потенциальная проблема:**
- До моих изменений отсутствовало логирование входящих запросов, что делало невозможной диагностику проблем с верификацией

### Логика обработки лидов (`POST`):
✅ **Код выглядит корректным и хорошо продуман:**
- Правильный парсинг тела запроса через `await request.json()`
- Корректное извлечение `leadgen_id` из структуры Meta: `body?.entry?.[0]?.changes?.[0]?.value?.leadgen_id`
- Запрос полной информации о лиде через Meta Graph API v18.0
- Обработка данных и сохранение в Firestore через REST API
- Отправка уведомлений в Telegram
- Весь код обернут в блоки try-catch для обработки ошибок

✅ **Обработка ошибок:**
- Есть детальная обработка ошибок на каждом этапе (Meta API, Firestore, Telegram)
- Логирование ошибок с помощью `console.error()`
- Корректные HTTP статусы при ошибках

⚠️ **Замечание:**
- До моих изменений не было лога в самом начале POST обработчика с единообразным форматом

---

## 2. Внесенные Изменения (Добавлено Логирование):

Я модифицировал файл `app/api/meta-webhook/route.ts` для добавления расширенного логирования:

### Изменения в GET обработчике (верификация):
1. **Строка 4:** Добавлен лог в самом начале функции: `console.log("META WEBHOOK: GET request received.");`
2. **Строка 8:** Добавлен вывод всех query-параметров: `console.log("Query params received:", request.nextUrl.searchParams.toString());`
3. **Строки 16-18:** Добавлено сравнение токенов с выводом обоих значений:
   ```typescript
   const tokenFromMeta = token;
   const tokenFromEnv = VERIFY_TOKEN;
   console.log(`Comparing tokens: [From Meta: '${tokenFromMeta}'] vs [From Env: '${tokenFromEnv}']`);
   ```

### Изменения в POST обработчике:
1. **Строка 34:** Обновлен лог в начале функции на единый формат: `console.log("META WEBHOOK: POST request received.");`
2. **Строка 38:** Обновлен формат вывода тела запроса на более стандартный: `console.log("Request Body:", JSON.stringify(body, null, 2));`

---

## 3. Ключевой Фрагмент Кода для Проверки (Верификация):

Вот полный код `GET` обработчика после моих изменений:

```typescript
export async function GET(request: NextRequest) {
  console.log("META WEBHOOK: GET request received.");

  try {
    const searchParams = request.nextUrl.searchParams
    console.log("Query params received:", request.nextUrl.searchParams.toString());

    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN

    const tokenFromMeta = token;
    const tokenFromEnv = VERIFY_TOKEN;
    console.log(`Comparing tokens: [From Meta: '${tokenFromMeta}'] vs [From Env: '${tokenFromEnv}']`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 })
    } else {
      return new NextResponse('Forbidden', { status: 403 })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Verification error' },
      { status: 500 }
    )
  }
}
```

---

## 4. ПЛАН ДАЛЬНЕЙШИХ ДЕЙСТВИЙ ДЛЯ ПОЛЬЗОВАТЕЛЯ:

### Шаг 1: Развертывание изменений
1. Разверните (Deploy) внесенные мной изменения на Vercel
2. Дождитесь успешного завершения деплоя

### Шаг 2: Тестирование Webhook
1. Перейдите в настройки Webhooks в вашем приложении Meta (Meta for Developers)
2. Нажмите кнопку **"Тестировать"** (Test) напротив поля `leadgen`
3. Если тест пройдет, Meta отправит тестовый запрос на ваш Webhook

### Шаг 3: Проверка логов в Vercel
1. Перейдите в **Vercel** → Ваш проект → вкладка **"Logs"** (Логи)
2. Отфильтруйте логи по функции `/api/meta-webhook`
3. Найдите логи от функции, которые появились после теста

### Шаг 4: Анализ результатов
Теперь логи **не могут быть пустыми**. Вы увидите одно из следующего:

#### Если Meta отправляет GET запрос (верификация):
```
META WEBHOOK: GET request received.
Query params received: hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=1234567890
Comparing tokens: [From Meta: 'YOUR_TOKEN'] vs [From Env: 'YOUR_TOKEN']
```

**Что проверить:**
- ✅ Оба токена совпадают → Верификация должна пройти
- ❌ Токены не совпадают → Проверьте переменную окружения `META_VERIFY_TOKEN` в Vercel
- ❌ `From Env: 'undefined'` → Переменная окружения не установлена

#### Если Meta отправляет POST запрос (лид):
```
META WEBHOOK: POST request received.
Request Body: {
  "entry": [
    {
      "changes": [
        {
          "value": {
            "leadgen_id": "123456789"
          }
        }
      ]
    }
  ]
}
Извлеченный leadgen_id: 123456789
...
```

**Что проверить:**
- ✅ `leadgen_id` найден → Обработка продолжится
- ❌ `leadgen_id` не найден → Проверьте структуру данных от Meta

### Шаг 5: Отправка результатов
**Скопируйте ВЕСЬ вывод из лога**, который появится после теста, и отправьте его в чат. Это даст окончательный ответ о причине проблемы.

---

## 5. Возможные Сценарии и Решения:

### Сценарий 1: Логи полностью пустые
**Проблема:** Meta вообще не отправляет запросы на ваш Webhook
**Решение:**
- Проверьте правильность URL Webhook в настройках Meta
- Убедитесь, что URL доступен публично (не localhost)

### Сценарий 2: Видны GET запросы, но токены не совпадают
**Проблема:** Неправильно настроена переменная окружения `META_VERIFY_TOKEN`
**Решение:**
- В Vercel → Settings → Environment Variables → Проверьте значение `META_VERIFY_TOKEN`
- Оно должно совпадать с токеном, указанным в настройках Meta

### Сценарий 3: Видны POST запросы, но `leadgen_id` отсутствует
**Проблема:** Meta отправляет данные в другой структуре
**Решение:**
- Изучите полный вывод `Request Body` из логов
- Скорректируйте путь извлечения `leadgen_id` согласно реальной структуре

### Сценарий 4: Ошибка при запросе к Meta Graph API
**Проблема:** Неверный или истекший `META_PAGE_ACCESS_TOKEN`
**Решение:**
- Сгенерируйте новый Page Access Token в Meta for Developers
- Обновите переменную окружения `META_PAGE_ACCESS_TOKEN` в Vercel

---

## 6. Техническая Информация:

- **Файл:** `app/api/meta-webhook/route.ts`
- **Фреймворк:** Next.js App Router
- **API:** Next.js Edge Functions
- **Meta Graph API версия:** v18.0
- **Метод верификации:** GET запрос с параметрами `hub.mode`, `hub.verify_token`, `hub.challenge`
- **Метод получения лидов:** POST запрос с JSON телом

---

## 7. Заключение:

Диагностика завершена. Код Webhook корректен и хорошо написан. Добавлено **критически важное логирование**, которое теперь позволит точно определить:

1. ✅ Приходят ли запросы от Meta на Webhook
2. ✅ Какие именно параметры отправляет Meta
3. ✅ Совпадают ли токены верификации
4. ✅ Какую структуру данных присылает Meta в POST запросах
5. ✅ На каком этапе происходит ошибка (если она есть)

**Следующий шаг:** Разверните изменения и протестируйте Webhook, следуя плану действий выше.
