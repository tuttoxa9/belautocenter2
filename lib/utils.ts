import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchUsdBynRate() {
  try {
    // Получаем курс напрямую от НБ РБ, минуя Vercel Function
    const res = await fetch('https://api.nbrb.by/exrates/rates/431', {
      headers: {
        'User-Agent': 'AutoBelCenter/1.0'
      },
      next: { revalidate: 3600 } // Кэшируем на 1 час
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.Cur_OfficialRate ?? null;
  } catch {
    return null;
  }
}

export function convertUsdToByn(usd: number, rate: number): string {
  if (!rate || !usd) return '';
  return Math.round(usd * rate).toLocaleString('ru-BY');
}

/**
 * Транслитерирует кириллические символы в латиницу и очищает строку для использования в URL
 * @param str - Исходная строка (например, название банка на кириллице)
 * @returns Очищенная строка для использования в URL
 */
/**
 * Функция для конвертации значения поля из формата Firestore в обычное значение
 */
function parseFirestoreValue(value: any): any {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.mapValue !== undefined) return parseFirestoreDoc(value.mapValue); // Рекурсивно для вложенных объектов
  if (value.arrayValue !== undefined) return value.arrayValue.values?.map(parseFirestoreValue) || []; // Для массивов
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  return value;
}

/**
 * Функция для конвертации всего документа Firestore в простой объект
 */
export function parseFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return {};

  const result: { [key: string]: any } = {};
  for (const key in doc.fields) {
    result[key] = parseFirestoreValue(doc.fields[key]);
  }
  return result;
}

/**
 * Функция для конвертации коллекции документов Firestore в массив простых объектов
 */
export function parseFirestoreCollection(collection: any): any[] {
  if (!collection || !collection.documents || !Array.isArray(collection.documents)) {
    return [];
  }

  return collection.documents.map((doc: any) => {
    const parsed = parseFirestoreDoc(doc);
    // Добавляем ID документа из пути документа
    if (doc.name) {
      const id = doc.name.split('/').pop();
      return { id, ...parsed };
    }
    return parsed;
  });
}

export function sanitizePath(str: string): string {
  if (!str) return '';

  // Таблица транслитерации кириллических символов
  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
    'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH', 'Ъ': '',
    'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA'
  };

  // Транслитерация кириллических символов
  let latinStr = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    latinStr += cyrillicToLatin[char] || char;
  }

  // Замена пробелов на дефисы и удаление спецсимволов
  return latinStr
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Удаляем все спецсимволы кроме пробелов и дефисов
    .replace(/\s+/g, '-')     // Заменяем пробелы на дефисы
    .replace(/-+/g, '-')      // Заменяем множественные дефисы на один
    .trim();                  // Удаляем пробелы в начале и конце строки
}

export function formatPrice(price: number, currency: 'USD' | 'BYN') {
  const locale = currency === 'BYN' ? 'ru-BY' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatPhoneNumber(value: string): string {
  // Удаляем все нецифровые символы кроме +
  let numbers = value.replace(/[^\d+]/g, "");

  // Если нет + в начале, добавляем +375
  if (!numbers.startsWith("+375")) {
    numbers = "+375";
  }

  // Берем только +375 и следующие 9 цифр максимум
  const prefix = "+375";
  const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9);

  return prefix + afterPrefix;
}

export function isPhoneValid(phone: string): boolean {
  return phone.length === 13 && phone.startsWith("+375");
}
