'use client'

import { useState, useEffect } from 'react'
import MapContainer from '@/components/Map/MapContainer'
import LocationButton from '@/components/Map/LocationButton'
import UserLocationMarker from '@/components/Map/UserLocationMarker'
import LayerToggle, { type LayerType } from '@/components/Map/LayerToggle'
import RadiusCircles from '@/components/Map/RadiusCircles'
import MarkerClusterGroup from '@/components/Map/MarkerClusterGroup'
import { createCategoryIcon } from '@/components/Map/EcopointMarker'
import CategoryFilter from '@/components/Filters/CategoryFilter'
import RadiusFilter from '@/components/Filters/RadiusFilter'
import DetailModal from '@/components/Ecopoint/DetailModal'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useEcopoints, EcopointLocation } from '@/hooks/useEcopoints'
import { getPrimaryCategory, CATEGORY_MAP } from '@/lib/constants/categories'
import { useMemo } from 'react'

export default function EcoMap() {
  const { latitude, longitude, error, loading, getCurrentPosition } = useGeolocation()
  const { ecopoints, loading: loadingEcopoints } = useEcopoints()
  const [showError, setShowError] = useState(false)
  const [showRadiusCircles, setShowRadiusCircles] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(CATEGORY_MAP))
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [currentLayer, setCurrentLayer] = useState<LayerType>('streets')
  const [selectedEcopoint, setSelectedEcopoint] = useState<EcopointLocation | null>(null)

  // Calculate distance between two points in km
  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter ecopoints based on selected categories and radius
  const filteredEcopoints = useMemo(() => {
    const filtered = ecopoints.filter((point) => {
      // Category filter - check if PRIMARY category (first one) is selected
      const primaryCategory = point.category[0]
      if (!primaryCategory || !selectedCategories.includes(primaryCategory)) return false

      // Radius filter
      if (selectedRadius && latitude && longitude) {
        const distance = getDistanceKm(latitude, longitude, point.lat, point.lng)
        if (distance > selectedRadius) return false
      }

      return true
    })
    return filtered
  }, [ecopoints, selectedCategories, selectedRadius, latitude, longitude])

  // Prepare markers data for clustering
  const markersData = useMemo(() => {
    return filteredEcopoints.map((point) => {
      const primaryCat = getPrimaryCategory(point.category)
      const icon = createCategoryIcon(primaryCat.icon, primaryCat.color)

      const popupContent = `
        <div style="min-width: 200px;">
          <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">${primaryCat.icon}</span>
            <h3 style="font-weight: 600; margin: 0;">${point.name}</h3>
          </div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">${primaryCat.name}</p>
          ${point.description ? `<p style="margin-bottom: 8px; font-size: 14px; color: #374151;">${point.description.slice(0, 100)}...</p>` : ''}
          ${
            point.status === 'validated'
              ? '<span style="display: inline-block; background: #d1fae5; color: #047857; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">✓ Validado</span>'
              : '<span style="display: inline-block; background: #fef3c7; color: #b45309; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">⏳ Pendente</span>'
          }
          <button
            onclick="window.dispatchEvent(new CustomEvent('openEcopointDetail', { detail: '${point.id}' }))"
            style="display: block; width: 100%; margin-top: 12px; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;"
          >
            Ver Detalhes
          </button>
        </div>
      `

      return {
        id: point.id,
        lat: point.lat,
        lng: point.lng,
        icon,
        popupContent,
      }
    })
  }, [filteredEcopoints])

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

  // Listen for ecopoint detail open event from popup button
  useEffect(() => {
    const handleOpenDetail = (e: CustomEvent<string>) => {
      const ecopointId = e.detail
      const ecopoint = ecopoints.find((p) => p.id === ecopointId)
      if (ecopoint) {
        setSelectedEcopoint(ecopoint)
      }
    }

    window.addEventListener('openEcopointDetail', handleOpenDetail as EventListener)
    return () => window.removeEventListener('openEcopointDetail', handleOpenDetail as EventListener)
  }, [ecopoints])

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
            <UserLocationMarker position={[latitude, longitude]} />
            <RadiusCircles center={[latitude, longitude]} visible={showRadiusCircles} isSatellite={currentLayer === 'satellite'} />
          </>
        )}
        <MarkerClusterGroup key={`cluster-${filteredEcopoints.length}-${selectedRadius}-${selectedCategories.join(',')}`} markers={markersData} />
        <LayerToggle onLayerChange={setCurrentLayer} />
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


      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`absolute right-4 top-16 z-[1000] rounded-lg bg-white px-3 py-2 shadow-md transition-all hover:bg-gray-50 ${
          showFilters ? 'ring-2 ring-green-500' : ''
        }`}
        title="Filtros"
      >
        <span className="text-sm font-medium">
          {showFilters ? '✕ Fechar' : '🔍 Filtros'}
        </span>
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <>
          <CategoryFilter selectedCategories={selectedCategories} onChange={setSelectedCategories} />
          <RadiusFilter
            selectedRadius={selectedRadius}
            onChange={setSelectedRadius}
            hasLocation={!!(latitude && longitude)}
          />
        </>
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

      {/* Detail Modal */}
      <DetailModal ecopoint={selectedEcopoint} onClose={() => setSelectedEcopoint(null)} />
    </div>
  )
}
