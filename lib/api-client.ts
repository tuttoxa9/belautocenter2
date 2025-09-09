import { getAuth } from 'firebase/auth'

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
}

export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_HOST || 'https://api.belautocenter.by'
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

    // Если требуется авторизация, добавляем заголовок Authorization с Firebase ID-токеном
    if (requireAuth) {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) {
          throw new Error('Требуется авторизация')
        }
        const token = await user.getIdToken(true)
        requestHeaders['Authorization'] = `Bearer ${token}`
      } catch (error) {
        console.error('Ошибка получения токена авторизации:', error)
        throw new Error('Не удалось получить токен авторизации')
      }
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders
    }

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    try {
      const fullUrl = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
      console.log(`Making ${method} request to: ${fullUrl}`)

      const response = await fetch(fullUrl, requestOptions)

      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP error response body:`, errorText)
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
        console.log(`Response data:`, responseData)
        return responseData
      }

      return {} as T
    } catch (error) {
      console.error(`API ошибка (${method} ${path}):`, error)
      throw error
    }
  }

  // Вспомогательные методы для разных типов запросов
  async get<T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'GET' })
  }

  async post<T>(path: string, body: any, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'POST', body })
  }

  async put<T>(path: string, body: any, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'PUT', body })
  }

  async delete<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
