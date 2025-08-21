import { apiClient } from './api-client'

export interface FirestoreDocument {
  id: string
  [key: string]: any
}

export class FirestoreApi {
  /**
   * Получить список документов из коллекции
   */
  async getCollection(collectionName: string): Promise<FirestoreDocument[]> {
    try {
      const response = await apiClient.get<any>(`/${collectionName}`)

      if (!response.documents) {
        return []
      }

      return response.documents.map((doc: any) => {
        const id = doc.name.split('/').pop() || ''
        const fields: Record<string, any> = {}

        // Преобразуем Firestore поля в обычные объекты
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
      const doc = await apiClient.get<any>(`/${collectionName}/${documentId}`)

      if (!doc || !doc.fields) {
        return null
      }

      const fields: Record<string, any> = {}

      // Преобразуем Firestore поля в обычные объекты
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
      const response = await apiClient.post<any>(`/${collectionName}`, { fields: firebaseData })
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
      await apiClient.put<any>(`/${collectionName}/${documentId}`, { fields: firebaseData })
    } catch (error) {
      console.error(`Error updating document ${collectionName}/${documentId}:`, error)
      throw error
    }
  }

  /**
   * Удалить документ
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      await apiClient.delete<any>(`/${collectionName}/${documentId}`)
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
              return item
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
      return parseInt(value.integerValue)
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
