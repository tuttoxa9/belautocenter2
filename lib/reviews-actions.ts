"use server"

import { db } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export interface Review {
  id: string
  name: string
  rating: number
  text: string
  createdAt: Date
  product?: {
    id: string
    name: string
    slug: string
    image: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  images: { url: string }[]
}

// Типизация для курсора пагинации
type LastVisible = {
  createdAt: string
} | null

export async function getReviews(
  limitCount: number,
  lastVisible: LastVisible = null
): Promise<{ reviews: Review[]; lastVisible: LastVisible }> {
  try {
    let query = db
      .collection("reviews")
      .where("status", "==", "published")
      .orderBy("createdAt", "desc")

    if (lastVisible) {
      query = query.startAfter(new Date(lastVisible.createdAt))
    }

    query = query.limit(limitCount)

    const snapshot = await query.get()

    if (snapshot.empty) {
      return { reviews: [], lastVisible: null }
    }

    const reviewsData: Review[] = []
    const productIds = new Set<string>()

    snapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.productId) {
        productIds.add(data.productId)
      }
      reviewsData.push({
        id: doc.id,
        name: data.name,
        rating: data.rating,
        text: data.text,
        createdAt: (data.createdAt.toDate() as Date),
        // Временно оставляем поле product пустым
      })
    })

    // Получаем данные о продуктах одним запросом
    const productsData = new Map<string, Product>()
    if (productIds.size > 0) {
      const productDocs = await db.collection("cars").where(FieldValue.documentId(), "in", Array.from(productIds)).get()

      productDocs.forEach(doc => {
        const data = doc.data()
        productsData.set(doc.id, {
          id: doc.id,
          name: data.name,
          slug: data.slug,
          images: data.images,
        })
      })
    }

    // Добавляем информацию о продуктах к отзывам
    const populatedReviews = reviewsData.map(review => {
      const doc = snapshot.docs.find(d => d.id === review.id)
      const productId = doc?.data().productId
      if (productId && productsData.has(productId)) {
        const product = productsData.get(productId)
        return {
          ...review,
          product: {
            id: product!.id,
            name: product!.name,
            slug: product!.slug,
            image: product!.images?.[0]?.url || "",
          },
        }
      }
      return review
    })

    // Определяем новый курсор для следующей страницы
    const newLastVisibleDoc = snapshot.docs[snapshot.docs.length - 1]
    const newLastVisible: LastVisible = newLastVisibleDoc
      ? { createdAt: (newLastVisibleDoc.data().createdAt.toDate() as Date).toISOString() }
      : null

    return { reviews: populatedReviews, lastVisible: newLastVisible }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return { reviews: [], lastVisible: null }
  }
}