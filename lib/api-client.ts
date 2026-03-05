// Оставляем firebase/auth для получения JWT токена
import { auth } from './firebase'

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
}

export class ApiClient {
  private baseUrl: string

  constructor() {
    // Используем Worker URL по умолчанию
    this.baseUrl = process.env.NEXT_PUBLIC_API_HOST || ''
    console.log('[API Client] Base URL:', this.baseUrl || 'relative paths')
  }

  async fetch<T>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = method !== 'GET'
    } = options

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    }

    if (requireAuth && !requestHeaders['Authorization']) {
      try {
        const user = auth.currentUser
        if (!user) {
          throw new Error('Требуется авторизация')
        }
        const token = await user.getIdToken(true)
        requestHeaders['Authorization'] = `Bearer ${token}`
      } catch (error) {
        throw new Error('Не удалось получить токен авторизации')
      }
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    }

    // Добавляем кэширование для GET запросов, если не указано иное
    if (method === 'GET') {
      if (requireAuth) {
        // Запросы с авторизацией (админка) никогда не должны кэшироваться в Next.js
        requestOptions.cache = 'no-store';
        requestHeaders['Cache-Control'] = 'no-store, no-cache, must-revalidate';
      } else if (!headers['Cache-Control']) {
        // Пытаемся взять тег из заголовков, если он есть
        if (headers['Next-Tags']) {
          requestOptions.next = { tags: [headers['Next-Tags']] };
          delete requestHeaders['Next-Tags'];
        } else {
          requestOptions.cache = 'force-cache';
        }
      } else {
        // Если Cache-Control явно задан (например, no-cache), Next.js fetch API
        // может ругаться, если передать force-cache
        requestOptions.cache = 'no-store';
      }
    }

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    try {
      const fullUrl = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`

      const response = await fetch(fullUrl, requestOptions)

      if (!response.ok) {
        const errorText = await response.text()
        const errorData = (() => {
          try {
            return JSON.parse(errorText)
          } catch {
            return { message: errorText || 'Неизвестная ошибка' }
          }
        })()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Для некоторых запросов (например, DELETE) может не быть JSON-ответа
      if (response.headers.get('content-type')?.includes('application/json')) {
        const responseData = await response.json() as T
        return responseData
      }

      return {} as T
    } catch (error) {
      console.error(`[API Client] Error fetching ${path}:`, error)
      throw error
    }
  }

  get<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.fetch<T>(path, { ...options, method: 'GET' })
  }

  post<T>(path: string, body: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'POST', body })
  }

  put<T>(path: string, body: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'PUT', body })
  }

  delete<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.fetch<T>(path, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
