import { apiClient } from './api-client'

export interface FirestoreDocument {
  id: string
  [key: string]: any
}

// Извлекаем Project ID из переменной окружения
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';

export class FirestoreApi {
  /**
   * Формирует базовый путь для коллекции в Firestore REST API
   */
  private getBasePath(collectionName: string, documentId?: string): string {
    // ВАЖНО: Воркер пользователя (v3.0) ожидает, что мы будем отправлять запросы
    // просто как /collectionName/documentId. Воркер сам добавляет /v1/projects/...
    let path = `/${collectionName}`;
    if (documentId) {
      path += `/${documentId}`;
    }
    return path;
  }

  /**
   * Получить список документов из коллекции
   */
  async getCollection(collectionName: string, forceRefresh = false, requireAuth = false): Promise<FirestoreDocument[]> {
    try {
      const headers: Record<string, string> = {};
      if (forceRefresh) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }

      const allDocuments: FirestoreDocument[] = [];
      let pageToken: string | undefined = undefined;
      const basePath = this.getBasePath(collectionName);

      do {
        let path = `${basePath}?pageSize=100`;
        if (pageToken) {
          path += `&pageToken=${pageToken}`;
        }

        if (forceRefresh && !requireAuth) {
          // Добавляем timestamp только если не идем через авторизацию
          path += `&_t=${Date.now()}`;
        }

        // Воркер возвращает плоский JSON массив (если он перехватил response.documents)
        // Но если в ответе есть nextPageToken, он мог вернуть объект { documents: [...], nextPageToken: "..." }
        // (зависит от того, как мы написали flattenFirestoreResponse)
        const response = await apiClient.get<any>(path, { headers, requireAuth });

        if (Array.isArray(response)) {
          allDocuments.push(...response);
          pageToken = undefined; // Если пришел просто массив, значит пагинации нет (или воркер ее стер)
        } else if (response.documents) {
          // Если воркер вернул объект с documents и (возможно) nextPageToken
          allDocuments.push(...(Array.isArray(response.documents) ? response.documents : []));
          pageToken = response.nextPageToken;
        } else if (response.name && !response.documents) {
          allDocuments.push(response);
          pageToken = undefined;
        } else {
          pageToken = undefined;
        }
      } while (pageToken);

      return allDocuments;
    } catch (error) {
      console.error(`Failed to get collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Получить один документ из коллекции
   */
  async getDocument(collectionName: string, documentId: string, requireAuth = false): Promise<FirestoreDocument | null> {
    try {
      const path = this.getBasePath(collectionName, documentId);
      const doc = await apiClient.get<any>(path, { requireAuth })

      if (!doc) {
        return null;
      }

      // Воркер отдает плоский JSON
      return doc as FirestoreDocument;
    } catch (error) {
      console.error(`Failed to get document ${documentId} in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Добавить новый документ в коллекцию
   * Для POST запросов в Firestore REST API структура требует { fields: { ... } },
   * но наш воркер не разворачивает POST тела на пути ТУДА. Мы должны отправить
   * данные в формате Firestore.
   */
  async addDocument(collectionName: string, data: Record<string, any>): Promise<{ id: string }> {
    try {
      const firebaseData = this.convertToFirestoreFormat(data)
      const path = this.getBasePath(collectionName);

      const response = await apiClient.post<any>(path, { fields: firebaseData })

      // Имя возвращается в формате projects/.../documents/коллекция/ID
      const id = response.name ? response.name.split('/').pop() || '' : (response.id || '');
      return { id }
    } catch (error) {
      console.error(`Failed to add document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Обновить существующий документ (PATCH)
   */
  async updateDocument(collectionName: string, documentId: string, data: Record<string, any>): Promise<void> {
    try {
      const firebaseData = this.convertToFirestoreFormat(data);
      const path = this.getBasePath(collectionName, documentId);

      // В Firestore REST API обновление - это PATCH
      await apiClient.fetch<any>(path, {
        method: 'PATCH',
        body: { fields: firebaseData },
        requireAuth: true
      });
    } catch (error) {
      console.error(`Failed to update document ${documentId} in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Удалить документ
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      const path = this.getBasePath(collectionName, documentId);
      await apiClient.delete<any>(path)
    } catch (error) {
      console.error(`Failed to delete document ${documentId} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Конвертировать обычный объект в формат Firestore
   * (необходимо для POST и PATCH запросов, которые отправляются в REST API)
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
}

export const firestoreApi = new FirestoreApi()
