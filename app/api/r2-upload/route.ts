import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 публичный URL
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-c7e57409d13c43939eba55c8df8a0e5d.r2.dev';

// Настройка клиента S3 для Cloudflare R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'belautocenter';

// Инициализация S3 клиента для Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file || !path) {
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

    // Извлекаем директорию из пути (например, 'cars' из 'images/cars/123.jpg')
    const folderPath = path.split('/')[0];

    // Генерируем уникальное имя файла
    const extension = file.name.split('.').pop() || '';
    const randomId = uuidv4().replace(/-/g, '').substring(0, 12);
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${randomId}.${extension}`;

    // Создаем полный путь к файлу в R2 (например, 'images/cars/123456-abc123.jpg')
    const filePath = `${folderPath}/${uniqueFilename}`;

    console.log('Начало загрузки в Cloudflare R2:', filePath);

    // Получаем содержимое файла как массив байтов
    const fileArrayBuffer = await file.arrayBuffer();

    // Загрузка файла в R2 с помощью AWS SDK
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
      Body: Buffer.from(fileArrayBuffer),
      ContentType: file.type,
      // Установка публичного доступа
      ACL: 'public-read',
    });

    // Выполняем загрузку в R2
    await s3Client.send(command);

    // Генерируем публичный URL для файла
    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`;
    console.log('Файл успешно загружен, публичный URL:', publicUrl);

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
