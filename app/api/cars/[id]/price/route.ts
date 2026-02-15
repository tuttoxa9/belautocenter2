import { NextRequest, NextResponse } from 'next/server';

// Функция для парсинга одного поля Firestore
const convertFieldValue = (value: any): any => {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  return value;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const carId = params.id;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${carId}`;

  try {
    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Price-API/1.0'
      },
      // Используем тот же кэш и теги, что и на страницах
      cache: 'force-cache',
      next: { tags: [`car-${carId}`, 'cars-list'] }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const doc = await response.json();
    const priceValue = doc.fields?.price;
    const price = priceValue ? convertFieldValue(priceValue) : null;

    return NextResponse.json({ price });
  } catch (error) {
    console.error(`[Price API] Error fetching car ${carId}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
