import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Конфигурация R2
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME || 'belauto-images';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    // 1. Проверка авторизации
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // 2. Получение файла из FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file || !path) {
      return NextResponse.json({ error: 'Missing file or path' }, { status: 400 });
    }

    // 3. Преобразование в Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Оптимизация через sharp
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    // Заменяем расширение на .webp в пути
    const webpPath = path.replace(/\.[^/.]+$/, '.webp');
    // Если расширения не было, просто добавляем .webp
    const finalPath = webpPath.endsWith('.webp') ? webpPath : `${path}.webp`;

    // 5. Загрузка в R2
    const putObjectCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: finalPath,
      Body: optimizedBuffer,
      ContentType: 'image/webp',
    });

    await s3Client.send(putObjectCommand);

    const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://images.belautocenter.by'}/${finalPath}`;

    // 6. Возврат результата
    return NextResponse.json({
      success: true,
      path: finalPath,
      url: imageUrl,
      key: finalPath,
      originalType: file.type,
      savedAs: 'image/webp',
      conversionResult: {
        status: 'SUCCESS',
        reason: 'Converted and optimized',
        originalSize: buffer.length,
        convertedSize: optimizedBuffer.length,
      }
    });

  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
