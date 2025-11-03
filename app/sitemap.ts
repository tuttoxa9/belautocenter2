import { MetadataRoute } from 'next'

// Функция для парсинга данных Firestore
const parseFirestoreDoc = (doc: any): any => {
  if (!doc || !doc.fields) return null

  const result: any = {}
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = convertFieldValue(value)
  }
  return result
}

const convertFieldValue = (value: any): any => {
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

// Функция для получения всех автомобилей из Firestore
async function getAllCars() {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`

    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Sitemap/1.0'
      },
      next: { revalidate: 3600 } // Кешируем на 1 час
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    
    if (!data.documents) {
      return []
    }

    return data.documents.map((doc: any) => {
      const id = doc.name.split('/').pop()
      const carData = parseFirestoreDoc(doc)
      return {
        id,
        ...carData
      }
    }).filter((car: any) => car.isAvailable !== false) // Только доступные авто
  } catch (error) {
    console.error('Error fetching cars for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://belautocenter.by'

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/credit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/leasing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    }
  ]

  // Получаем все автомобили
  const cars = await getAllCars()

  // Динамические страницы автомобилей
  const carPages: MetadataRoute.Sitemap = cars.map((car: any) => ({
    url: `${baseUrl}/catalog/${car.id}`,
    lastModified: car.updatedAt || car.createdAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85, // Высокий приоритет для страниц автомобилей
  }))

  return [...staticPages, ...carPages]
}
