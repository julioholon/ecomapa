'use client'

import { useState, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentPosition: () => void
  isSupported: boolean
}

// São Paulo centro como fallback
const FALLBACK_COORDS = {
  latitude: -23.5505,
  longitude: -46.6333,
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  })

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        ...FALLBACK_COORDS,
        error: 'Geolocalização não suportada neste navegador',
        loading: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        })
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível'
            break
          case error.TIMEOUT:
            errorMessage = 'Tempo esgotado ao obter localização'
            break
        }

        // Use fallback on error
        setState({
          ...FALLBACK_COORDS,
          accuracy: null,
          error: errorMessage,
          loading: false,
        })
      },
      options
    )
  }, [isSupported])

  return {
    ...state,
    getCurrentPosition,
    isSupported,
  }
}
