'use client'

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

interface MarkerData {
  id: string
  lat: number
  lng: number
  icon: L.DivIcon
  popupContent: string
}

interface MarkerClusterGroupProps {
  markers: MarkerData[]
}

export default function MarkerClusterGroup({ markers }: MarkerClusterGroupProps) {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    // Create cluster group
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        let size = 'small'
        let dimensions = 30

        if (count >= 10) {
          size = 'medium'
          dimensions = 40
        }
        if (count >= 20) {
          size = 'large'
          dimensions = 50
        }

        return L.divIcon({
          html: `<div style="
            background: #10b981;
            color: white;
            border-radius: 50%;
            width: ${dimensions}px;
            height: ${dimensions}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: ${dimensions / 2.5}px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(dimensions, dimensions),
        })
      },
    })

    clusterGroupRef.current = clusterGroup
    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
      clusterGroupRef.current = null
    }
  }, [map])

  useEffect(() => {
    if (!clusterGroupRef.current) return

    // Clear existing markers
    clusterGroupRef.current.clearLayers()

    // Add new markers
    markers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: markerData.icon,
      })

      marker.bindPopup(markerData.popupContent)
      clusterGroupRef.current?.addLayer(marker)
    })
  }, [markers])

  return null
}
