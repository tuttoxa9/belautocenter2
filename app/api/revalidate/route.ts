import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

// Route Handler для POST-запросов
export async function POST(request: Request) {
  // Получаем секретный токен из переменных окружения
  const secret = process.env.REVALIDATE_SECRET_TOKEN;

  // Получаем тело запроса
  const body = await request.json();

  // Извлекаем токен и тег из тела запроса
  const requestSecret = body.secret;
  const tag = body.tag;

  // 1. Проверка безопасности: сверяем секретный токен
  if (requestSecret !== secret) {
    // Если токен не совпадает, возвращаем ошибку
    return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 });
  }

  // 2. Проверка наличия тега
  if (!tag) {
    return NextResponse.json({ message: 'Tag is required' }, { status: 400 });
  }

  try {
    // 3. Выполняем ревалидацию по тегу
    revalidateTag(tag);

    // 4. Возвращаем успешный ответ
    return NextResponse.json({ revalidated: true, tag: tag, now: Date.now() });
  } catch (error) {
    // В случае ошибки возвращаем сообщение
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error revalidating', error: errorMessage }, { status: 500 });
  }
}