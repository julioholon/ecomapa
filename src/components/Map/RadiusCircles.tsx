'use client'

import { Circle } from 'react-leaflet'

interface RadiusCirclesProps {
  center: [number, number]
  visible?: boolean
  isSatellite?: boolean
}

const RADII_STREETS = [
  { distance: 1000, color: '#60A5FA', opacity: 0.15 },
  { distance: 2000, color: '#3B82F6', opacity: 0.1 },
  { distance: 5000, color: '#2563EB', opacity: 0.05 },
]

const RADII_SATELLITE = [
  { distance: 1000, color: '#FFFFFF', opacity: 0.2 },
  { distance: 2000, color: '#FFFFFF', opacity: 0.15 },
  { distance: 5000, color: '#FFFFFF', opacity: 0.1 },
]

export default function RadiusCircles({ center, visible = true, isSatellite = false }: RadiusCirclesProps) {
  if (!visible) return null

  const radii = isSatellite ? RADII_SATELLITE : RADII_STREETS

  return (
    <>
      {radii.map((radius) => (
        <Circle
          key={radius.distance}
          center={center}
          radius={radius.distance}
          pathOptions={{
            color: radius.color,
            fillColor: radius.color,
            fillOpacity: radius.opacity,
            weight: 1,
            dashArray: '5, 5',
          }}
        />
      ))}
    </>
  )
}
