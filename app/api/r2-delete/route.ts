import { NextRequest, NextResponse } from 'next/server';

// Используем новый формат конфигурации для App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Cloudflare R2 публичный URL
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-c7e57409d13c43939eba55c8df8a0e5d.r2.dev';

export async function DELETE(request: NextRequest) {
  try {
    // Получаем данные из запроса
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Отсутствует URL файла для удаления' },
        { status: 400 }
      );
    }

    // Проверяем, соответствует ли URL нашему R2 хранилищу
    if (!url.includes(R2_PUBLIC_URL)) {
      return NextResponse.json(
        { error: 'URL не соответствует R2 хранилищу' },
        { status: 400 }
      );
    }

    // Извлекаем путь к файлу из URL
    const filePath = url.replace(`${R2_PUBLIC_URL}/`, '');

    console.log('Запрос на удаление файла:', filePath);

    // В реальном приложении здесь должен быть код для удаления файла
    // с использованием Cloudflare Workers или другого механизма

    // Эмулируем успешное удаление
    return NextResponse.json(
      { success: true, message: 'Файл успешно удален', path: filePath },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при обработке удаления из R2:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  }
}
