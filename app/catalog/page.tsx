import CatalogClient from './catalog-client'

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  driveTrain: string;
}

// Функция для конвертации значения поля из формата Firestore
function convertFieldValue(value: any): any {
  if (value.stringValue !== undefined) {
    return value.stringValue
  } else if (value.integerValue !== undefined) {
    return parseInt(value.integerValue)
  } else if (value.doubleValue !== undefined) {
    return parseFloat(value.doubleValue)
  } else if (value.booleanValue !== undefined) {
    return value.booleanValue
  } else if (value.timestampValue !== undefined) {
    return new Date(value.timestampValue)
  } else if (value.arrayValue !== undefined) {
    return value.arrayValue.values?.map((v: any) => convertFieldValue(v)) || []
  } else if (value.mapValue !== undefined) {
    const result: Record<string, any> = {}
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      result[k] = convertFieldValue(v)
    }
    return result
  } else if (value.nullValue !== undefined) {
    return null
  }
  return value
}

// Серверная функция для загрузки автомобилей напрямую из Firestore
async function loadCarsFromFirestore(): Promise<Car[]> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`

    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Direct-Firestore/1.0'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error(`Failed to fetch from Firestore: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()

    if (!data.documents) {
      return []
    }

    return data.documents
      .map((doc: any) => {
        const id = doc.name.split('/').pop() || ''
        const fields: Record<string, any> = {}

        // Преобразуем Firestore поля в обычные объекты
        for (const [key, value] of Object.entries(doc.fields || {})) {
          fields[key] = convertFieldValue(value)
        }

        return { id, ...fields }
      })
      .filter((car: any) => car.isAvailable !== false) // Исключаем проданные автомобили из каталога
  } catch (error) {
    console.error('Error loading cars from Firestore:', error)
    return []
  }
}

export default async function CatalogPage() {
  // Загружаем автомобили на сервере
  const cars = await loadCarsFromFirestore()

  return <CatalogClient initialCars={cars} />
}
