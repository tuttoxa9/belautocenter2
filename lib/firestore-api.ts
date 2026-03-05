import { db } from './firebase'
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'

export interface FirestoreDocument {
  id: string
  [key: string]: any
}

export class FirestoreApi {
  /**
   * Получить список документов из коллекции
   */
  async getCollection(collectionName: string, forceRefresh = false, requireAuth = false): Promise<FirestoreDocument[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const documents: FirestoreDocument[] = []

      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() })
      })

      return documents
    } catch (error) {
      console.error(`Failed to get collection ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Получить один документ из коллекции
   */
  async getDocument(collectionName: string, documentId: string, requireAuth = false): Promise<FirestoreDocument | null> {
    try {
      const docRef = doc(db, collectionName, documentId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        return null
      }
    } catch (error) {
      console.error(`Failed to get document ${documentId} in ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Добавить новый документ в коллекцию
   */
  async addDocument(collectionName: string, data: Record<string, any>): Promise<{ id: string }> {
    try {
      const docRef = await addDoc(collection(db, collectionName), data)
      return { id: docRef.id }
    } catch (error) {
      console.error(`Failed to add document to ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Обновить существующий документ
   */
  async updateDocument(collectionName: string, documentId: string, data: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId)
      await updateDoc(docRef, data)
    } catch (error) {
      console.error(`Failed to update document ${documentId} in ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Удалить документ
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(`Failed to delete document ${documentId} from ${collectionName}:`, error)
      throw error
    }
  }
}

export const firestoreApi = new FirestoreApi()
