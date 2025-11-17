'use client'

import { useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export type LayerType = 'streets' | 'satellite'

const LAYERS = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
}

interface LayerToggleProps {
  onLayerChange?: (layer: LayerType) => void
}

export default function LayerToggle({ onLayerChange }: LayerToggleProps) {
  const map = useMap()
  const [activeLayer, setActiveLayer] = useState<LayerType>('streets')

  const switchLayer = (layerType: LayerType) => {
    if (layerType === activeLayer) return

    // Remove current tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Add new tile layer
    const newLayer = LAYERS[layerType]
    L.tileLayer(newLayer.url, {
      attribution: newLayer.attribution,
      maxZoom: 19,
    }).addTo(map)

    setActiveLayer(layerType)
    onLayerChange?.(layerType)
  }

  return (
    <div className="absolute right-4 top-4 z-[1000] flex overflow-hidden rounded-lg bg-white shadow-md">
      <button
        onClick={() => switchLayer('streets')}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
          activeLayer === 'streets'
            ? 'bg-green-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Visualização de ruas"
      >
        <span>🗺️</span>
        <span className="hidden sm:inline">Ruas</span>
      </button>
      <button
        onClick={() => switchLayer('satellite')}
        className={`flex items-center gap-1.5 border-l px-3 py-2 text-sm font-medium transition-colors ${
          activeLayer === 'satellite'
            ? 'bg-green-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Visualização de satélite"
      >
        <span>🛰️</span>
        <span className="hidden sm:inline">Satélite</span>
      </button>
    </div>
  )
}
