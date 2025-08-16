-- D1-схема для сайта belautocenter.by
-- Версия 2.0 (оптимизированная)

-- -----------------------------------------------------
-- Таблица `cars`
-- Основная таблица для каталога автомобилей.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price REAL NOT NULL,
  mileage REAL NOT NULL,
  engineVolume REAL,
  fuelType TEXT NOT NULL,
  transmission TEXT NOT NULL,
  driveTrain TEXT NOT NULL,
  bodyType TEXT,
  color TEXT,
  description TEXT,
  isAvailable INTEGER NOT NULL DEFAULT 1, -- 1 = true, 0 = false
  createdAt INTEGER NOT NULL, -- unix timestamp
  updatedAt INTEGER NOT NULL, -- unix timestamp
  imageUrls TEXT, -- JSON array of strings
  specifications TEXT, -- JSON object
  features TEXT -- JSON array of strings
);

-- Индексы для быстрой фильтрации и сортировки
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars (make, model);
CREATE INDEX IF NOT EXISTS idx_cars_isAvailable_price ON cars (isAvailable, price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars (year);
CREATE INDEX IF NOT EXISTS idx_cars_createdAt ON cars (createdAt);


-- -----------------------------------------------------
-- Таблица `pages`
-- Хранит контент для всех статических страниц (О нас, Политика и т.д.).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY, -- 'about-us', 'privacy-policy', 'contacts'
  title TEXT NOT NULL,
  content TEXT, -- HTML or Markdown content
  updatedAt INTEGER NOT NULL -- unix timestamp
);


-- -----------------------------------------------------
-- Таблица `reviews`
-- Хранит отзывы клиентов.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  carModel TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'published', 'rejected'
  createdAt INTEGER NOT NULL, -- unix timestamp
  updatedAt INTEGER NOT NULL -- unix timestamp
);

-- Индексы для модерации и отображения отзывов
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_createdAt ON reviews (createdAt);


-- -----------------------------------------------------
-- Таблица `settings`
-- Единое хранилище для всех настроек сайта (контакты, условия кредита и т.д.).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY, -- 'main_contacts', 'credit_terms', 'leasing_terms'
  content TEXT NOT NULL, -- JSON object with all settings for this key
  updatedAt INTEGER NOT NULL -- unix timestamp
);


-- -----------------------------------------------------
-- Таблица `leads`
-- Хранит все заявки от клиентов.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  type TEXT NOT NULL, -- 'callback', 'credit_request', etc.
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'completed'
  message TEXT,
  payload TEXT, -- JSON object for any extra data (car price, company name etc.)
  createdAt INTEGER NOT NULL, -- unix timestamp
  updatedAt INTEGER NOT NULL -- unix timestamp
);

-- Индексы для CRM-системы
CREATE INDEX IF NOT EXISTS idx_leads_status_type ON leads (status, type);
CREATE INDEX IF NOT EXISTS idx_leads_createdAt ON leads (createdAt);


-- -----------------------------------------------------
-- Таблица `stories`
-- Хранит "истории" для главной страницы.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  mediaUrl TEXT NOT NULL,
  mediaType TEXT NOT NULL, -- 'image' or 'video'
  caption TEXT,
  linkUrl TEXT,
  displayOrder INTEGER NOT NULL, -- Порядок отображения
  createdAt INTEGER NOT NULL, -- unix timestamp
  updatedAt INTEGER NOT NULL -- unix timestamp
);

-- Индекс для сортировки
CREATE INDEX IF NOT EXISTS idx_stories_displayOrder ON stories (displayOrder);