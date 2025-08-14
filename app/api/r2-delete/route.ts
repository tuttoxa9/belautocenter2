import { NextRequest, NextResponse } from 'next/server';

// Используем новый формат конфигурации для App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Cloudflare R2 API конфигурация
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'belautocenter';

export async function DELETE(request: NextRequest) {
  try {
    // Проверка наличия конфигурации R2
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Cloudflare R2 не настроен на сервере' },
        { status: 500 }
      );
    }

    // Получаем данные из запроса
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'Отсутствует путь файла для удаления' },
        { status: 400 }
      );
    }

    // Создаем URL для удаления из R2 с помощью Cloudflare S3 API
    const deleteUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${path}`;

    // Дата для подписи S3
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');

    // Заголовки для S3 API
    const headers = {
      'Host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    };

    // Создаем строку для подписи S3 API (упрощенно)
    // В реальном приложении требуется полная имплементация AWS Signature V4

    // Осуществляем удаление из R2
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'x-amz-date': amzDate,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'Authorization': `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${date}/auto/s3/aws4_request, SignedHeaders=host;x-amz-date;x-amz-content-sha256, Signature=example-signature`
      }
    });

    if (!response.ok) {
      console.error('Ошибка удаления из R2:', await response.text());
      return NextResponse.json(
        { error: `Ошибка удаления из R2: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Файл успешно удален' },
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
