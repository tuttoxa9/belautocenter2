import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

// Создаем кэшированную функцию для получения курса валют.
// Next.js будет автоматически кэшировать результат этой функции на 1 час (3600 секунд).
const getCachedRate = unstable_cache(
  async () => {
    try {
      console.log('Fetching fresh USD/BYN rate from NBRB API...');
      const res = await fetch('https://api.nbrb.by/exrates/rates/431', {
        headers: { 'User-Agent': 'AutoBelCenter/1.0' },
      });

      if (!res.ok) {
        throw new Error(`NBRB API responded with status: ${res.status}`);
      }

      const data = await res.json();
      const rate = data.Cur_OfficialRate;

      if (!rate) {
        throw new Error('Rate not found in NBRB API response');
      }

      console.log('Successfully fetched and cached new rate:', rate);
      return rate;
    } catch (error) {
      console.error('Failed to fetch USD/BYN rate:', error);
      // В случае ошибки возвращаем null, чтобы не сломать приложение
      return null;
    }
  },
  ['usd-byn-rate'], // Ключ кэша
  { revalidate: 3600 } // Время жизни кэша в секундах (1 час)
);

export async function GET() {
  const rate = await getCachedRate();

  if (rate === null) {
    return NextResponse.json(
      { error: 'Failed to fetch currency rate' },
      { status: 500 }
    );
  }

  // Отправляем ответ клиенту с указанием кэшировать его на 5 минут
  return NextResponse.json(
    { rate },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    }
  );
}