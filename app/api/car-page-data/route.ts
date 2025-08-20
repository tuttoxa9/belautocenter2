import { NextResponse } from 'next/server'
import { doc, getDoc, documentId, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    // Используем Promise.all для параллельного выполнения запросов
    const [creditDoc, leasingDoc, contactsDoc] = await Promise.all([
      getDoc(doc(db, "pages", "credit")),
      getDoc(doc(db, "pages", "leasing")),
      getDoc(doc(db, "pages", "contacts"))
    ])

    const result = {
      banks: [],
      leasingCompanies: [],
      contactPhone: "+375 29 123-45-67" // fallback
    }

    // Обработка данных банков из Firestore
    if (creditDoc.exists() && creditDoc.data()?.partners) {
      const rawData = creditDoc.data()
      const cleanData = JSON.parse(JSON.stringify(rawData))
      const partners = cleanData?.partners || []

      result.banks = partners.map((partner: any, index: number) => ({
        id: index + 1,
        name: partner.name || "",
        logo: partner.logoUrl || "",
        rate: partner.minRate || 15,
        minDownPayment: 15,
        maxTerm: partner.maxTerm || 60,
        features: ["Выгодные условия", "Быстрое одобрение"],
        color: ["emerald", "blue", "purple", "red"][index % 4]
      })).sort((a: any, b: any) => a.rate - b.rate)
    }

    // Обработка данных лизинговых компаний из Firestore
    if (leasingDoc.exists() && leasingDoc.data()?.leasingCompanies) {
      const rawData = leasingDoc.data()
      const cleanData = JSON.parse(JSON.stringify(rawData))
      const companies = cleanData?.leasingCompanies || []

      result.leasingCompanies = companies.sort((a: any, b: any) => (a.minAdvance || 0) - (b.minAdvance || 0))
    }

    // Обработка контактных данных
    if (contactsDoc.exists()) {
      const rawData = contactsDoc.data()
      const cleanData = JSON.parse(JSON.stringify(rawData))
      result.contactPhone = cleanData?.phone || "+375 29 123-45-67"
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200', // Кэш на 1 час
        'Vary': 'Accept-Encoding'
      }
    })
  } catch (error) {
    console.error("Ошибка загрузки данных страницы автомобиля:", error)
    return NextResponse.json(
      {
        error: "Ошибка загрузки данных",
        banks: [],
        leasingCompanies: [],
        contactPhone: "+375 29 123-45-67"
      },
      { status: 500 }
    )
  }
}
