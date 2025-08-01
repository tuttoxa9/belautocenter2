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

  useEffect(() => {
    return () => {
      // Очищаем все таймауты при размонтировании
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  const execute = useCallback(async (asyncFunction: () => Promise<void>) => {
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

  return {
    state,
    execute,
    reset,
    setSuccess,
    setError,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle'
  }
}
