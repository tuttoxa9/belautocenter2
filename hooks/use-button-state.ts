import { useState, useCallback, useRef, useEffect } from 'react'

export type ButtonState = 'idle' | 'loading' | 'success' | 'error'

interface UseButtonStateOptions {
  successDuration?: number
  errorDuration?: number
  onSuccess?: () => void
  onError?: () => void
}

export function useButtonState(options: UseButtonStateOptions = {}) {
  const {
    successDuration = 2000,
    errorDuration = 3000,
    onSuccess,
    onError
  } = options

  const [state, setState] = useState<ButtonState>('idle')
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  // We use a ref for isExecuting to ensure we have the absolute latest value synchronously
  // to block rapid sequential calls before React state updates
  const isExecutingRef = useRef(false)

  useEffect(() => {
    return () => {
      // Очищаем все таймауты при размонтировании
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  const execute = useCallback(async (asyncFunction: () => Promise<void>) => {
    // Prevent multiple executions synchronously using a ref
    if (isExecutingRef.current) return;

    isExecutingRef.current = true;
    setState('loading')

    try {
      await asyncFunction()
      setState('success')
      onSuccess?.()

      const timeout = setTimeout(() => {
        setState('idle')
      }, successDuration)
      timeoutRefs.current.push(timeout)
    } catch (error) {
      setState('error')
      onError?.()

      const timeout = setTimeout(() => {
        setState('idle')
      }, errorDuration)
      timeoutRefs.current.push(timeout)
    } finally {
      isExecutingRef.current = false;
    }
  }, [successDuration, errorDuration, onSuccess, onError])

  const reset = useCallback(() => {
    setState('idle')
  }, [])

  const setSuccess = useCallback(() => {
    setState('success')
    onSuccess?.()
    const timeout = setTimeout(() => {
      setState('idle')
    }, successDuration)
    timeoutRefs.current.push(timeout)
  }, [successDuration, onSuccess])

  const setError = useCallback(() => {
    setState('error')
    onError?.()
    const timeout = setTimeout(() => {
      setState('idle')
    }, errorDuration)
    timeoutRefs.current.push(timeout)
  }, [errorDuration, onError])

  const setLoading = useCallback(() => {
    setState('loading')
  }, [])

  return {
    state,
    execute,
    reset,
    setSuccess,
    setError,
    setLoading,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle'
  }
}
