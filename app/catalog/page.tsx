import CatalogClient from './catalog-client'

// ISR: кэширование на 24 часа
export const revalidate = 86400

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
    return { seconds: new Date(value.timestampValue).getTime() / 1000 }
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

export default async function CatalogPage() {
  let cars = []

  try {
    // Прямой запрос к Firestore REST API
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`

    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Direct-Firestore/1.0'
      },
      next: { revalidate: 86400 }
    })

    if (response.ok) {
      const data = await response.json()

      // Парсим документы Firestore
      cars = data.documents?.map((doc: any) => {
        const id = doc.name.split('/').pop() || ''
        const fields = parseFirestoreDoc(doc)
        return { id, ...fields }
      }) || []

      // Фильтруем только доступные автомобили
      cars = cars.filter((car: any) => car.isAvailable !== false)
    }
  } catch (error) {
    console.error('Error loading cars:', error)
  }

  // Передаем данные в клиентский компонент
  return <CatalogClient initialCars={cars} />
}
