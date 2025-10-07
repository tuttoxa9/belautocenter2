import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Этот API маршрут будет использоваться для сброса кэша по требованию (On-Demand Revalidation)
export async function POST(request: NextRequest) {
  // 1. Безопасность: Проверяем секретный токен
  // Токен должен быть установлен в переменных окружения на Vercel
  const secret = request.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 })
  }

  // 2. Получаем путь для ревалидации из тела запроса
  const body = await request.json()
  const path = body.path

  if (!path) {
    return NextResponse.json({ message: 'Path to revalidate is required' }, { status: 400 })
  }

  try {
    // 3. Выполняем ревалидацию
    revalidatePath(path)
    console.log(`Revalidated path: ${path}`)
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    console.error(`Error revalidating path ${path}:`, error)
    return NextResponse.json({ message: 'Error revalidating', error: (error as Error).message }, { status: 500 })
  }
}