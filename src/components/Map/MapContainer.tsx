'use client'

import { MapContainer as LeafletMapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue with Next.js
import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
})

interface MapContainerProps {
  center?: [number, number]
  zoom?: number
  className?: string
  children?: React.ReactNode
}

// Default center: Brazil
const DEFAULT_CENTER: [number, number] = [-15.7801, -47.9292]
const DEFAULT_ZOOM = 4

export default function MapContainer({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
  children,
}: MapContainerProps) {
  return (
    <LeafletMapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      className={`h-full w-full ${className}`}
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      {children}
    </LeafletMapContainer>
  )
}
