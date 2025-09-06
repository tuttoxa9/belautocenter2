import { ApiClient } from './api-client'
import { FIRESTORE_PROXY_URL } from './firestore-client'

export interface FirestoreDocument {
  id: string
  [key: string]: any
}

// Этот класс будет общаться с нашим Cloudflare Worker, который проксирует запросы в Firestore.
// Он использует настроенный ApiClient.
export class FirestoreApi {
  private client: ApiClient

  constructor() {
    // Создаем экземпляр ApiClient, который будет указывать на наш воркер
    this.client = new ApiClient(FIRESTORE_PROXY_URL)
  }

  /**
   * Получить список документов из коллекции
   */
  async getCollection(collectionName: string): Promise<FirestoreDocument[]> {
    try {
      // Используем this.client вместо глобального apiClient
      const response = await this.client.get<any>(`/${collectionName}`)

      // Воркер может вернуть либо сырой ответ Firestore, либо уже обработанный массив.
      // Этот код обрабатывает оба случая.
      if (Array.isArray(response)) {
        return response as FirestoreDocument[]
      }

      if (!response.documents) {
        return []
      }

      return response.documents.map((doc: any) => {
        const id = doc.name.split('/').pop() || ''
        const fields: Record<string, any> = {}

        for (const [key, value] of Object.entries(doc.fields || {})) {
          fields[key] = this.convertFieldValue(value)
        }

        return { id, ...fields }
      })
    } catch (error) {
      console.error(`Error fetching collection ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Получить один документ из коллекции
   */
  async getDocument(collectionName: string, documentId: string): Promise<FirestoreDocument | null> {
    try {
      const doc = await this.client.get<any>(`/${collectionName}/${documentId}`)

      // Обработка случая, когда воркер вернул уже готовый объект
      if (doc && !doc.fields && doc.id) {
        return doc
      }

      if (!doc || !doc.fields) {
        return null
      }

      const fields: Record<string, any> = {}

      for (const [key, value] of Object.entries(doc.fields || {})) {
        fields[key] = this.convertFieldValue(value)
      }

      const id = doc.name.split('/').pop() || documentId
      return { id, ...fields }
    } catch (error) {
      console.error(`Error fetching document ${collectionName}/${documentId}:`, error)
      throw error
    }
  }

  /**
   * Добавить новый документ в коллекцию
   */
  async addDocument(collectionName: string, data: Record<string, any>): Promise<{ id: string }> {
    try {
      const firebaseData = this.convertToFirestoreFormat(data)
      // Для POST-запросов на создание документа Firestore ожидает определенную структуру
      const response = await this.client.post<any>(`/${collectionName}`, { fields: firebaseData })
      const id = response.name.split('/').pop() || ''
      return { id }
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Обновить существующий документ
   */
  async updateDocument(collectionName: string, documentId: string, data: Record<string, any>): Promise<void> {
    try {
      const firebaseData = this.convertToFirestoreFormat(data)
      // PATCH используется для обновления документа
      await this.client.fetch<any>(`/${collectionName}/${documentId}`, {
        method: 'PUT',
        body: { fields: firebaseData },
      })
    } catch (error)      {
      console.error(`Error updating document ${collectionName}/${documentId}:`, error)
      throw error
    }
  }

  /**
   * Удалить документ
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      await this.client.delete<any>(`/${collectionName}/${documentId}`)
    } catch (error) {
      console.error(`Error deleting document ${collectionName}/${documentId}:`, error)
      throw error
    }
  }

  /**
   * Конвертировать обычный объект в формат Firestore
   */
  private convertToFirestoreFormat(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        result[key] = { nullValue: null }
      } else if (typeof value === 'string') {
        result[key] = { stringValue: value }
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          result[key] = { integerValue: value.toString() }
        } else {
          result[key] = { doubleValue: value }
        }
      } else if (typeof value === 'boolean') {
        result[key] = { booleanValue: value }
      } else if (value instanceof Date) {
        result[key] = { timestampValue: value.toISOString() }
      } else if (Array.isArray(value)) {
        result[key] = {
          arrayValue: {
            values: value.map(item => {
              if (typeof item === 'string') return { stringValue: item }
              if (typeof item === 'number') {
                if (Number.isInteger(item)) return { integerValue: item.toString() }
                return { doubleValue: item }
              }
              if (typeof item === 'boolean') return { booleanValue: item }
              if (item instanceof Date) return { timestampValue: item.toISOString() }
              return { stringValue: String(item) } // Default to string
            })
          }
        }
      } else if (typeof value === 'object') {
        result[key] = {
          mapValue: {
            fields: this.convertToFirestoreFormat(value)
          }
        }
      }
    }

    return result
  }

  /**
   * Конвертировать значение поля из формата Firestore в обычный формат
   */
  private convertFieldValue(value: any): any {
    if (value.stringValue !== undefined) {
      return value.stringValue
    } else if (value.integerValue !== undefined) {
      return parseInt(value.integerValue, 10)
    } else if (value.doubleValue !== undefined) {
      return parseFloat(value.doubleValue)
    } else if (value.booleanValue !== undefined) {
      return value.booleanValue
    } else if (value.timestampValue !== undefined) {
      return new Date(value.timestampValue)
    } else if (value.arrayValue !== undefined) {
      return value.arrayValue.values?.map((v: any) => this.convertFieldValue(v)) || []
    } else if (value.mapValue !== undefined) {
      const result: Record<string, any> = {}
      for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
        result[k] = this.convertFieldValue(v)
      }
      return result
    } else if (value.nullValue !== undefined) {
      return null
    }
    return value
  }
}

export const firestoreApi = new FirestoreApi()
