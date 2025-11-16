'use client'

import { useEffect } from 'react'
import { Marker, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

interface UserLocationMarkerProps {
  position: [number, number]
  accuracy?: number | null
  flyTo?: boolean
}

// Create custom blue icon for user location
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export default function UserLocationMarker({
  position,
  accuracy,
  flyTo = true,
}: UserLocationMarkerProps) {
  const map = useMap()

  useEffect(() => {
    if (flyTo && position) {
      map.flyTo(position, 14, {
        duration: 1.5,
      })
    }
  }, [map, position, flyTo])

  return (
    <>
      <Marker position={position} icon={userIcon} />
      {accuracy && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      )}
    </>
  )
}
