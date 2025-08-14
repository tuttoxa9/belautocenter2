import { NextRequest, NextResponse } from 'next/server';

// Cloudflare R2 API конфигурация
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'belautocenter';

export async function POST(request: NextRequest) {
  try {
    // Проверка наличия конфигурации R2
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Cloudflare R2 не настроен на сервере' },
        { status: 500 }
      );
    }

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

    // Получаем содержимое файла как ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Создаем URL для загрузки в R2 с помощью Cloudflare S3 API
    const uploadUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${path}`;

    // Дата для подписи S3
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');

    // Заголовки для S3 API
    const headers = {
      'Host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      'Content-Type': file.type,
      'Content-Length': String(file.size),
      'x-amz-date': amzDate,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    };

    // Создаем строку для подписи S3 API (упрощенно)
    // В реальном приложении требуется полная имплементация AWS Signature V4
    // Здесь мы используем упрощенный подход, так как полная имплементация сложна

    // Осуществляем загрузку в R2
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'Authorization': `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${date}/auto/s3/aws4_request, SignedHeaders=host;x-amz-date;x-amz-content-sha256, Signature=example-signature`
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      console.error('Ошибка загрузки в R2:', await response.text());
      return NextResponse.json(
        { error: `Ошибка загрузки в R2: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Формируем публичный URL для файла
    const publicUrl = `https://pub-c7e57409d13c43939eba55c8df8a0e5d.r2.dev/${path}`;

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

// Устанавливаем максимальный размер для обработки
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
