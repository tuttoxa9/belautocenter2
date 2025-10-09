import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secretToken = process.env.REVALIDATION_SECRET;

  if (authHeader !== `Bearer ${secretToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    return NextResponse.json({ error: 'Missing Cloudflare credentials' }, { status: 500 });
  }

  try {
    const { purgeAll } = await request.json();
    const purgePayload = { purge_everything: true }; // Упрощено для надежности

    const purgeResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(purgePayload)
    });

    const result = await purgeResponse.json();

    return NextResponse.json({
      success: purgeResponse.ok,
      data: result
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to purge cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
