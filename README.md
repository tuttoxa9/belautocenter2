# Autobel - Автомобильный каталог

Современное веб-приложение для автомобильного салона, построенное на Next.js 14 с использованием React, TypeScript, Tailwind CSS и Firebase.

## 🚀 Технологии

- **Next.js 14** - React фреймворк для производственных приложений
- **React 18** - Библиотека для создания пользовательских интерфейсов
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Firebase** - Backend-as-a-Service для аутентификации и базы данных
- **Bun** - Быстрый JavaScript runtime и пакетный менеджер

## 📦 Установка

```bash
# Клонировать репозиторий
git clone https://github.com/tuttoxa9/autobel1.git
cd autobel1

# Установить зависимости
bun install

# Создать файл окружения
cp .env.example .env.local
```

## 🔧 Настройка переменных окружения

Создайте файл `.env.local` в корне проекта и добавьте следующие переменные:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## 🛠️ Разработка

```bash
# Запустить сервер разработки
bun run dev

# Собрать для продакшена
bun run build

# Запустить продакшн сервер
bun run start

# Линтинг
bun run lint
```

## 🚀 Деплой на Vercel

### Автоматический деплой

1. Подключите ваш GitHub репозиторий к Vercel
2. Vercel автоматически определит, что это Next.js проект
3. Добавьте переменные окружения в настройках Vercel:
   - Перейдите в Project Settings → Environment Variables
   - Добавьте все переменные из `.env.example`

### Ручной деплой

```bash
# Установить Vercel CLI
npm i -g vercel

# Авторизоваться
vercel login

# Деплой
vercel --prod
```

### Настройки Vercel

Проект уже настроен для деплоя на Vercel с помощью `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "outputDirectory": ".next"
}
```

## 📁 Структура проекта

```
autobel1/
├── app/                    # Next.js App Router
│   ├── about/             # Страница "О нас"
│   ├── adminbel/          # Админ панель
│   ├── catalog/           # Каталог автомобилей
│   ├── contacts/          # Контакты
│   ├── credit/            # Кредит
│   ├── leasing/           # Лизинг
│   └── reviews/           # Отзывы
├── components/            # React компоненты
│   ├── admin/            # Админ компоненты
│   └── ui/               # UI компоненты (shadcn/ui)
├── lib/                  # Утилиты и конфигурация
├── public/               # Статические файлы
├── styles/               # Стили
└── uploads/              # Загруженные файлы
```

## 🔑 Основные функции

- 📱 Адаптивный дизайн
- 🚗 Каталог автомобилей с фильтрацией
- 👨‍💼 Административная панель
- 📞 Форма обратной связи
- 💳 Калькулятор кредита и лизинга
- ⭐ Система отзывов
- 🔥 Интеграция с Firebase
- 🌙 Темная/светлая тема

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add some amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в GitHub репозитории.
