'use client'

import { useState, useEffect } from 'react'
import MapContainer from '@/components/Map/MapContainer'
import LocationButton from '@/components/Map/LocationButton'
import UserLocationMarker from '@/components/Map/UserLocationMarker'
import LayerToggle from '@/components/Map/LayerToggle'
import RadiusCircles from '@/components/Map/RadiusCircles'
import EcopointMarker from '@/components/Map/EcopointMarker'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useEcopoints } from '@/hooks/useEcopoints'

export default function EcoMap() {
  const { latitude, longitude, accuracy, error, loading, getCurrentPosition } = useGeolocation()
  const { ecopoints, loading: loadingEcopoints } = useEcopoints()
  const [showError, setShowError] = useState(false)
  const [showRadiusCircles, setShowRadiusCircles] = useState(true)

  const handleLocationClick = () => {
    setShowError(false)
    getCurrentPosition()
  }

  const handleErrorDismiss = () => setShowError(false)

  // Show error toast when geolocation fails
  useEffect(() => {
    if (error && !loading) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, loading])

  return (
    <div className="relative h-full w-full">
      {/* Error Toast */}
      {showError && error && (
        <div className="absolute left-1/2 top-4 z-[2000] -translate-x-1/2 transform">
          <div className="flex items-center gap-3 rounded-lg bg-yellow-50 px-4 py-3 shadow-lg">
            <span className="text-yellow-600">⚠️</span>
            <p className="text-sm text-yellow-800">{error}. Usando São Paulo como padrão.</p>
            <button
              onClick={handleErrorDismiss}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <MapContainer>
        {latitude && longitude && (
          <>
            <UserLocationMarker position={[latitude, longitude]} accuracy={accuracy} />
            <RadiusCircles center={[latitude, longitude]} visible={showRadiusCircles} />
          </>
        )}
        {ecopoints.map((point) => (
          <EcopointMarker
            key={point.id}
            id={point.id}
            name={point.name}
            description={point.description}
            category={point.category}
            status={point.status}
            position={[point.lat, point.lng]}
          />
        ))}
        <LayerToggle />
      </MapContainer>

      {/* Loading Ecopoints Indicator */}
      {loadingEcopoints && (
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white px-3 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            <span className="text-sm">Carregando pontos...</span>
          </div>
        </div>
      )}

      {/* Ecopoints Counter */}
      {!loadingEcopoints && ecopoints.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white px-3 py-2 shadow-md">
          <span className="text-sm font-medium">{ecopoints.length} ecopontos</span>
        </div>
      )}

      {/* Location Button */}
      <LocationButton
        onClick={handleLocationClick}
        loading={loading}
        hasLocation={!!(latitude && longitude)}
      />

      {/* Radius Toggle */}
      {latitude && longitude && (
        <button
          onClick={() => setShowRadiusCircles(!showRadiusCircles)}
          className={`absolute bottom-20 left-4 z-[1000] rounded-lg bg-white px-3 py-2 shadow-md transition-all hover:bg-gray-50 ${
            showRadiusCircles ? 'ring-2 ring-green-500' : ''
          }`}
          title="Mostrar/ocultar círculos de raio"
        >
          <span className="text-sm font-medium">
            {showRadiusCircles ? '⭕ Raios' : '○ Raios'}
          </span>
        </button>
      )}
    </div>
  )
}
