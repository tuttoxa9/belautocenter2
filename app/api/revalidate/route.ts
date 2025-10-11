import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretToken = process.env.REVALIDATION_SECRET;

    if (authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collection, documentId, paths, purgeAll } = await request.json();

    console.log('[REVALIDATE] Request:', { collection, documentId, paths, purgeAll });

    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    // 1. Очистка кэша Cloudflare (если указаны credentials)
    if (zoneId && apiToken) {
      let purgePayload;

      if (purgeAll) {
        // Полная очистка (использовать только в крайних случаях)
        purgePayload = { purge_everything: true };
        console.log('[REVALIDATE] Purging ALL cache');
      } else {
        // Точечная очистка (предпочтительно)
        const urlsToPurge = [];

        // Добавляем URL коллекции
        if (collection) {
          urlsToPurge.push(`https://api.belautocenter.by/${collection}`);

          // Добавляем URL конкретного документа
          if (documentId) {
            urlsToPurge.push(`https://api.belautocenter.by/${collection}/${documentId}`);
          }
        }

        // Добавляем кастомные пути
        if (paths && Array.isArray(paths)) {
          paths.forEach(path => {
            urlsToPurge.push(`https://belautocenter.by${path}`);
          });
        }

        purgePayload = { files: urlsToPurge };
        console.log('[REVALIDATE] Purging specific URLs:', urlsToPurge);
      }

      const purgeResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(purgePayload)
        }
      );

      const purgeResult = await purgeResponse.json();
      console.log('[REVALIDATE] Cloudflare purge result:', purgeResult);
    }

    // 2. Очистка Next.js ISR кэша
    if (paths && Array.isArray(paths)) {
      console.log('[REVALIDATE] Revalidating Next.js paths:', paths);
      paths.forEach(path => {
        try {
          revalidatePath(path);
          console.log(`[REVALIDATE] Revalidated: ${path}`);
        } catch (err) {
          console.error(`[REVALIDATE] Failed to revalidate ${path}:`, err);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cache revalidation triggered',
      collection,
      documentId,
      paths
    });

  } catch (error) {
    console.error('[REVALIDATE] Error:', error);
    return NextResponse.json({
      error: 'Failed to revalidate cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
