"use client"

import { useState, useEffect, useCallback } from "react"

interface FetchProgressResult {
  progress: number
  isLoaded: boolean
  dataUrl: string | null
  error: Error | null
  reset: () => void
}

export function useFetchProgress(url: string | null, enabled: boolean = true): FetchProgressResult {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const reset = useCallback(() => {
    setProgress(0)
    setIsLoaded(false)
    setDataUrl(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!url || !enabled || isLoaded) return

    let isMounted = true
    const controller = new AbortController()

    const fetchWithProgress = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentLength = response.headers.get("content-length")
        const total = contentLength ? parseInt(contentLength, 10) : 0
        
        if (total === 0) {
          // If no content-length, we can't track real progress, just mark as loaded
          const blob = await response.blob()
          if (isMounted) {
            setDataUrl(URL.createObjectURL(blob))
            setProgress(100)
            setIsLoaded(true)
          }
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("ReadableStream not supported")
        }

        let loaded = 0
        const chunks: Uint8Array[] = []

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          if (value) {
            chunks.push(value)
            loaded += value.length
            if (isMounted) {
              setProgress(Math.round((loaded / total) * 100))
            }
          }
        }

        if (isMounted) {
          const blob = new Blob(chunks)
          setDataUrl(URL.createObjectURL(blob))
          setIsLoaded(true)
        }
      } catch (err) {
        if (isMounted && (err as Error).name !== "AbortError") {
          console.error("Fetch progress error:", err)
          setError(err as Error)
        }
      }
    }

    fetchWithProgress()

    return () => {
      isMounted = false
      controller.abort()
      if (dataUrl) {
        URL.revokeObjectURL(dataUrl)
      }
    }
  }, [url, enabled]) // isLoaded excluded to allow external reset if needed

  return { progress, isLoaded, dataUrl, error, reset }
}
