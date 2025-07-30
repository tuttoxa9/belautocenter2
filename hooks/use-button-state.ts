import { useState, useCallback } from 'react'

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

  const execute = useCallback(async (asyncFunction: () => Promise<void>) => {
    setState('loading')

    try {
      await asyncFunction()
      setState('success')
      onSuccess?.()

      setTimeout(() => {
        setState('idle')
      }, successDuration)
    } catch (error) {
      setState('error')
      onError?.()

      setTimeout(() => {
        setState('idle')
      }, errorDuration)
    }
  }, [successDuration, errorDuration, onSuccess, onError])

  const reset = useCallback(() => {
    setState('idle')
  }, [])

  const setSuccess = useCallback(() => {
    setState('success')
    onSuccess?.()
    setTimeout(() => {
      setState('idle')
    }, successDuration)
  }, [successDuration, onSuccess])

  const setError = useCallback(() => {
    setState('error')
    onError?.()
    setTimeout(() => {
      setState('idle')
    }, errorDuration)
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
