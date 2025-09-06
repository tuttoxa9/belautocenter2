import { ApiClient } from './api-client'
import { FIRESTORE_PROXY_URL } from './firestore-client'

export interface FirestoreDocument {
  id: string
  [key: string]: any
}

// This class now expects clean, pre-parsed JSON from the worker.
// All the complex Firestore parsing logic has been removed.
export class FirestoreApi {
  private client: ApiClient

  constructor() {
    this.client = new ApiClient(FIRESTORE_PROXY_URL)
  }

  /**
   * Gets a collection of documents. Assumes the worker returns a clean array.
   */
  async getCollection(collectionName: string): Promise<FirestoreDocument[]> {
    try {
      // The worker now returns a simple array of objects.
      const response = await this.client.get<FirestoreDocument[]>(`/${collectionName}`)
      return response || []
    } catch (error) {
      console.error(`Error fetching collection ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Gets a single document. Assumes the worker returns a clean object.
   */
  async getDocument(collectionName: string, documentId: string): Promise<FirestoreDocument | null> {
    try {
      // The worker now returns a single, clean object.
      const response = await this.client.get<FirestoreDocument>(`/${collectionName}/${documentId}`)
      return response
    } catch (error) {
      console.error(`Error fetching document ${collectionName}/${documentId}:`, error)
      // Return null if document is not found (e.g., 404 error)
      return null
    }
  }

  /**
   * Adds a new document. The data object is sent as-is.
   * The worker needs to convert it to Firestore format if necessary.
   * Note: The new worker doesn't handle writes, so this will fail unless the worker is updated.
   * This part of the code is kept for structural consistency.
   */
  async addDocument(collectionName: string, data: Record<string, any>): Promise<{ id: string }> {
    try {
      const response = await this.client.post<any>(`/${collectionName}`, data)
      return response
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Updates an existing document.
   * Note: The new worker doesn't handle writes.
   */
  async updateDocument(collectionName: string, documentId: string, data: Record<string, any>): Promise<void> {
    try {
      await this.client.put<void>(`/${collectionName}/${documentId}`, data)
    } catch (error)      {
      console.error(`Error updating document ${collectionName}/${documentId}:`, error)
      throw error
    }
  }

  /**
   * Deletes a document.
   * Note: The new worker doesn't handle writes.
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      await this.client.delete<void>(`/${collectionName}/${documentId}`)
    } catch (error) {
      console.error(`Error deleting document ${collectionName}/${documentId}:`, error)
      throw error
    }
  }
}

export const firestoreApi = new FirestoreApi()
