/**
 * API для инвалидации кэша Cloudflare
 *
 * Используется админ-панелью для сброса кэша при изменении данных
 *
 * Защита: Bearer токен из переменной окружения REVALIDATION_SECRET
 *
 * Использование:
 * POST /api/revalidate
 * Headers:
 *   Authorization: Bearer <REVALIDATION_SECRET>
 * Body:
 *   {
 *     "paths": ["/catalog", "/catalog/car-123"],  // Опционально: конкретные пути
 *     "purgeAll": true                             // Опционально: очистить весь кэш
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
    // ============================================

    const authHeader = request.headers.get('authorization');
    const secretToken = process.env.REVALIDATION_SECRET;

    if (!secretToken) {
      console.error('❌ REVALIDATION_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ Invalid authorization header');
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Убираем 'Bearer '

    if (token !== secretToken) {
      console.warn('⚠️ Invalid token provided');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      );
    }

    // ============================================
    // 2. ПАРСИНГ ПАРАМЕТРОВ
    // ============================================

    const body = await request.json();
    const { paths, purgeAll } = body;

    // ============================================
    // 3. ОЧИСТКА CLOUDFLARE CACHE
    // ============================================

    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!zoneId || !apiToken) {
      console.error('❌ Cloudflare credentials not configured');
      return NextResponse.json(
        { error: 'Cloudflare not configured' },
        { status: 500 }
      );
    }

    const cloudflareUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

    let purgePayload: any;

    if (purgeAll) {
      // Очистка всего кэша
      purgePayload = { purge_everything: true };
      console.log('🗑️ Purging ALL cache...');
    } else if (paths && Array.isArray(paths) && paths.length > 0) {
      // Очистка конкретных путей
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belautocenter.by';
      const fullUrls = paths.map(path => `${siteUrl}${path}`);

      purgePayload = { files: fullUrls };
      console.log('🗑️ Purging specific paths:', fullUrls);
    } else {
      // По умолчанию - очистка каталога
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belautocenter.by';
      purgePayload = {
        files: [
          `${siteUrl}/catalog`,
          `${siteUrl}/catalog/*`,
        ]
      };
      console.log('🗑️ Purging catalog cache...');
    }

    const purgeResponse = await fetch(cloudflareUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purgePayload)
    });

    const purgeResult = await purgeResponse.json();

    if (!purgeResponse.ok) {
      console.error('❌ Cloudflare purge failed:', purgeResult);
      return NextResponse.json(
        {
          error: 'Cache purge failed',
          details: purgeResult
        },
        { status: 500 }
      );
    }

    console.log('✅ Cache purged successfully');

    // ============================================
    // 4. ВОЗВРАТ РЕЗУЛЬТАТА
    // ============================================

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated successfully',
      purged: purgeAll ? 'all' : paths || 'catalog',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Revalidation error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Метод GET для проверки доступности API
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation API is available',
    usage: 'POST with Authorization: Bearer <token>'
  });
}