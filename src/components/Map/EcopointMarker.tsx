'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getPrimaryCategory } from '@/lib/constants/categories'

interface EcopointMarkerProps {
  id: string
  name: string
  description: string | null
  category: string[]
  status: string
  position: [number, number]
  onClick?: () => void
}

function createCategoryIcon(emoji: string, color: string) {
  return L.divIcon({
    className: 'ecopoint-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        transition: transform 0.2s;
      "
      onmouseover="this.style.transform='scale(1.1)'"
      onmouseout="this.style.transform='scale(1)'"
      >${emoji}</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

export default function EcopointMarker({
  name,
  description,
  category,
  status,
  position,
}: EcopointMarkerProps) {
  const primaryCat = getPrimaryCategory(category)
  const icon = createCategoryIcon(primaryCat.icon, primaryCat.color)

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="min-w-[200px]">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{primaryCat.icon}</span>
            <h3 className="font-semibold">{name}</h3>
          </div>

          <p className="mb-2 text-xs text-gray-600">{primaryCat.name}</p>

          {description && <p className="mb-2 text-sm text-gray-700">{description.slice(0, 100)}...</p>}

          {status === 'validated' && (
            <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              ✓ Validado
            </span>
          )}

          {status === 'pending' && (
            <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
              ⏳ Pendente
            </span>
          )}

          <button className="mt-3 w-full rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
            Ver Detalhes
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
