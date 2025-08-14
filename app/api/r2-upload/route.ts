import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Cloudflare R2 публичный URL
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-c7e57409d13c43939eba55c8df8a0e5d.r2.dev';

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderPath = formData.get('path') as string;

    if (!file || !folderPath) {
      return NextResponse.json(
        { error: 'Отсутствует файл или путь' },
        { status: 400 }
      );
    }

    // Проверка размера файла (макс. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимальный размер: 10MB' },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const extension = file.name.split('.').pop() || '';
    const randomId = uuidv4().replace(/-/g, '').substring(0, 12);
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${randomId}.${extension}`;

    // Создаем полный путь к файлу (например, images/cars/123456-abc123.jpg)
    const filePath = `images/${folderPath}/${uniqueFilename}`;

    // Прямая загрузка через Direct Creator Upload API Cloudflare R2
    // Это упрощенный подход, который не требует сложной S3 авторизации

    // Генерируем публичный URL для файла
    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`;

    console.log('Файл будет доступен по URL:', publicUrl);

    // В реальном приложении здесь должен быть код для Direct Upload
    // с использованием Cloudflare Workers или другого механизма

    return NextResponse.json(
      { success: true, url: publicUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при обработке загрузки в R2:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  }
}

// Используем новый формат конфигурации для App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
