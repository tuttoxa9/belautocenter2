export interface FirestoreDocument {
  name: string;
  fields: Record<string, any>;
  createTime: string;
  updateTime: string;
}

export interface FirestoreCollection {
  documents: FirestoreDocument[];
}

export class FirestoreCache {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_HOST || window.location.origin
      : process.env.NEXT_PUBLIC_API_HOST || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  async getCollection(collectionName: string, forceRefresh = false): Promise<any[]> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      // Если нужно принудительное обновление, добавляем заголовки для обхода кэша
      if (forceRefresh) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }

      const url = forceRefresh
        ? `${this.baseUrl}/${collectionName}?_t=${Date.now()}`
        : `${this.baseUrl}/${collectionName}`;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${collectionName}: ${response.status}`);
      }

      const data: FirestoreCollection = await response.json();

      return data.documents?.map(doc => {
        const id = doc.name.split('/').pop() || '';
        const fields: Record<string, any> = {};

        // Преобразуем Firestore поля в обычные объекты
        for (const [key, value] of Object.entries(doc.fields || {})) {
          if (value.stringValue) {
            fields[key] = value.stringValue;
          } else if (value.integerValue) {
            fields[key] = parseInt(value.integerValue);
          } else if (value.doubleValue) {
            fields[key] = parseFloat(value.doubleValue);
          } else if (value.booleanValue !== undefined) {
            fields[key] = value.booleanValue;
          } else if (value.timestampValue) {
            fields[key] = new Date(value.timestampValue);
          } else if (value.arrayValue) {
            fields[key] = value.arrayValue.values?.map((v: any) => {
              if (v.stringValue) return v.stringValue;
              if (v.integerValue) return parseInt(v.integerValue);
              if (v.doubleValue) return parseFloat(v.doubleValue);
              return v;
            }) || [];
          } else if (value.mapValue) {
            fields[key] = this.convertMapValue(value.mapValue);
          } else {
            fields[key] = value;
          }
        }

        return { id, ...fields };
      }) || [];

    } catch (error) {
      throw error;
    }
  }

  async getDocument(collectionName: string, documentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${collectionName}/${documentId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${collectionName}/${documentId}: ${response.status}`);
      }

      const doc: FirestoreDocument = await response.json();
      const fields: Record<string, any> = {};

      // Преобразуем Firestore поля в обычные объекты
      for (const [key, value] of Object.entries(doc.fields || {})) {
        if (value.stringValue) {
          fields[key] = value.stringValue;
        } else if (value.integerValue) {
          fields[key] = parseInt(value.integerValue);
        } else if (value.doubleValue) {
          fields[key] = parseFloat(value.doubleValue);
        } else if (value.booleanValue !== undefined) {
          fields[key] = value.booleanValue;
        } else if (value.timestampValue) {
          fields[key] = new Date(value.timestampValue);
        } else if (value.arrayValue) {
          fields[key] = value.arrayValue.values?.map((v: any) => {
            if (v.stringValue) return v.stringValue;
            if (v.integerValue) return parseInt(v.integerValue);
            if (v.doubleValue) return parseFloat(v.doubleValue);
            return v;
          }) || [];
        } else if (value.mapValue) {
          fields[key] = this.convertMapValue(value.mapValue);
        } else {
          fields[key] = value;
        }
      }

      const id = doc.name.split('/').pop() || documentId;
      return { id, ...fields };

    } catch (error) {
      throw error;
    }
  }

  private convertMapValue(mapValue: any): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(mapValue.fields || {})) {
      if ((value as any).stringValue) {
        result[key] = (value as any).stringValue;
      } else if ((value as any).integerValue) {
        result[key] = parseInt((value as any).integerValue);
      } else if ((value as any).doubleValue) {
        result[key] = parseFloat((value as any).doubleValue);
      } else if ((value as any).booleanValue !== undefined) {
        result[key] = (value as any).booleanValue;
      } else if ((value as any).timestampValue) {
        result[key] = new Date((value as any).timestampValue);
      } else if ((value as any).arrayValue) {
        result[key] = (value as any).arrayValue.values?.map((v: any) => {
          if (v.stringValue) return v.stringValue;
          if (v.integerValue) return parseInt(v.integerValue);
          if (v.doubleValue) return parseFloat(v.doubleValue);
          return v;
        }) || [];
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

// Создаем единый экземпляр для использования в приложении
export const firestoreCache = new FirestoreCache();
