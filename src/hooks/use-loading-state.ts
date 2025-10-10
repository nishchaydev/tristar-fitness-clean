import { useEffect, useState } from 'react'

interface UseLoadingDataProps<T> {
  data: T
  delay?: number
}

export function useLoadingData<T>({ data, delay = 500 }: UseLoadingDataProps<T>) {
  const [isLoading, setIsLoading] = useState(true)
  const [displayData, setDisplayData] = useState<T>(data)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayData(data)
      setIsLoading(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [data, delay])

  return { isLoading, data: displayData }
}

export function useDelayedRender(delay = 100) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return shouldRender
}