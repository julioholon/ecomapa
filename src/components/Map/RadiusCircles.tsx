'use client'

import { Circle } from 'react-leaflet'

interface RadiusCirclesProps {
  center: [number, number]
  visible?: boolean
}

const RADII = [
  { distance: 1000, color: '#22C55E', opacity: 0.1 },
  { distance: 2000, color: '#16A34A', opacity: 0.08 },
  { distance: 5000, color: '#15803D', opacity: 0.05 },
]

export default function RadiusCircles({ center, visible = true }: RadiusCirclesProps) {
  if (!visible) return null

  return (
    <>
      {RADII.map((radius) => (
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
