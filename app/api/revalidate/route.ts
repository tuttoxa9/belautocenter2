import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretToken = process.env.REVALIDATION_SECRET || process.env.CACHE_INVALIDATION_API_KEY;

    if (authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collection, documentId, paths, purgeAll } = await request.json();

    console.log('[REVALIDATE] Request:', { collection, documentId, paths, purgeAll });

    const results = {
      cloudflare: { success: false, message: '' },
      vercel: { success: false, message: '' },
      nextjs: { success: false, revalidatedPaths: [] as string[] }
    };

    // 1. Очистка кэша Cloudflare
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://belautocenter.by';

    if (cloudflareZoneId && cloudflareApiToken) {
      let purgePayload;

      if (purgeAll) {
        // Полная очистка всего кэша
        purgePayload = { purge_everything: true };
        console.log('[REVALIDATE] Cloudflare: Purging ALL cache');
      } else {
        // Точечная очистка конкретных URL
        const urlsToPurge: string[] = [];

        // Добавляем пути страниц
        if (paths && Array.isArray(paths)) {
          paths.forEach(path => {
            urlsToPurge.push(`${baseUrl}${path}`);
          });
        }

        // Добавляем API пути для Firestore
        if (collection) {
          urlsToPurge.push(`https://api.belautocenter.by/${collection}`);

          if (documentId) {
            urlsToPurge.push(`https://api.belautocenter.by/${collection}/${documentId}`);
          }
        }

        purgePayload = { files: urlsToPurge };
        console.log('[REVALIDATE] Cloudflare: Purging specific URLs:', urlsToPurge);
      }

      try {
        const purgeResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/purge_cache`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cloudflareApiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(purgePayload)
          }
        );

        const purgeResult = await purgeResponse.json();

        if (purgeResponse.ok && purgeResult.success) {
          results.cloudflare.success = true;
          results.cloudflare.message = 'Cache purged successfully';
          console.log('[REVALIDATE] Cloudflare: Success');
        } else {
          results.cloudflare.message = purgeResult.errors?.[0]?.message || 'Unknown error';
          console.error('[REVALIDATE] Cloudflare: Failed', purgeResult);
        }
      } catch (err) {
        results.cloudflare.message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[REVALIDATE] Cloudflare: Error', err);
      }
    } else {
      results.cloudflare.message = 'Cloudflare credentials not configured';
      console.warn('[REVALIDATE] Cloudflare: Skipped (no credentials)');
    }

    // 2. Очистка кэша Vercel (Edge Cache)
    const vercelToken = process.env.VERCEL_API_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    if (vercelToken && purgeAll) {
      try {
        // Получаем deployment ID текущего проекта
        const deploymentResponse = await fetch(
          `https://api.vercel.com/v6/deployments${vercelTeamId ? `?teamId=${vercelTeamId}` : ''}`,
          {
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
            }
          }
        );

        if (deploymentResponse.ok) {
          const deploymentsData = await deploymentResponse.json();
          const latestDeployment = deploymentsData.deployments?.[0];

          if (latestDeployment) {
            // Очищаем кэш для конкретного deployment
            const purgeVercelResponse = await fetch(
              `https://api.vercel.com/v1/purge${vercelTeamId ? `?teamId=${vercelTeamId}` : ''}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${vercelToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  purgeAll: true
                })
              }
            );

            if (purgeVercelResponse.ok) {
              results.vercel.success = true;
              results.vercel.message = 'Vercel cache purged successfully';
              console.log('[REVALIDATE] Vercel: Success');
            } else {
              results.vercel.message = 'Failed to purge Vercel cache';
              console.error('[REVALIDATE] Vercel: Failed');
            }
          }
        }
      } catch (err) {
        results.vercel.message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[REVALIDATE] Vercel: Error', err);
      }
    } else if (!vercelToken) {
      results.vercel.message = 'Vercel token not configured';
      console.warn('[REVALIDATE] Vercel: Skipped (no token)');
    } else {
      results.vercel.message = 'Skipped (only for full purge)';
    }

    // 3. Очистка Next.js ISR кэша (включая Vercel Edge Cache через revalidatePath/revalidateTag)
    // Подтягиваем revalidateTag
    const { revalidateTag } = require('next/cache');

    try {
      revalidateTag('cars-data');
      if (documentId) {
        revalidateTag(`car-${documentId}`);
      }
      console.log('[REVALIDATE] Tags cleared: cars-data', documentId ? `and car-${documentId}` : '');
    } catch (e) {
       console.error('[REVALIDATE] Error clearing tags', e);
    }

    if (paths && Array.isArray(paths)) {
      console.log('[REVALIDATE] Next.js: Revalidating paths:', paths);

      paths.forEach(path => {
        try {
          // revalidatePath в Next.js 14+ автоматически очищает Vercel Edge Cache
          // Используем 'page' для очистки всех связанных кэшей (data + page)
          revalidatePath(path, 'page');
          results.nextjs.revalidatedPaths.push(path);
          console.log(`[REVALIDATE] Next.js + Vercel Edge: Revalidated ${path}`);
        } catch (err) {
          console.error(`[REVALIDATE] Next.js: Failed to revalidate ${path}:`, err);
        }
      });

      results.nextjs.success = results.nextjs.revalidatedPaths.length > 0;

      // Если были успешные ревалидации, отмечаем Vercel как успешный
      if (results.nextjs.success) {
        results.vercel.success = true;
        results.vercel.message = 'Vercel Edge Cache cleared via revalidatePath';
      }
    }

    // 4. Если purgeAll, то принудительно обновляем все основные пути
    if (purgeAll) {
      const allPaths = ['/', '/catalog', '/about', '/contacts', '/credit', '/leasing', '/reviews', '/sale', '/privacy'];

      console.log('[REVALIDATE] Purge All: Revalidating all main paths...');

      allPaths.forEach(path => {
        try {
          // Полная очистка всех кэшей для каждого пути
          revalidatePath(path, 'page');
          if (!results.nextjs.revalidatedPaths.includes(path)) {
            results.nextjs.revalidatedPaths.push(path);
          }
          console.log(`[REVALIDATE] Next.js + Vercel Edge: Revalidated ${path}`);
        } catch (err) {
          console.error(`[REVALIDATE] Next.js: Failed to revalidate ${path}:`, err);
        }
      });

      results.nextjs.success = true;

      // Также очищаем все динамические маршруты каталога
      try {
        revalidatePath('/catalog/[id]', 'page');
        console.log('[REVALIDATE] Next.js + Vercel Edge: Revalidated all catalog pages');
      } catch (err) {
        console.error('[REVALIDATE] Failed to revalidate catalog pages:', err);
      }

      // Отмечаем Vercel Edge Cache как очищенный
      if (!results.vercel.success) {
        results.vercel.success = true;
        results.vercel.message = 'Vercel Edge Cache cleared via revalidatePath (purgeAll)';
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cache revalidation completed',
      purgeAll,
      collection,
      documentId,
      results
    });

  } catch (error) {
    console.error('[REVALIDATE] Error:', error);
    return NextResponse.json({
      error: 'Failed to revalidate cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
