'use client'

import { useEffect, useRef, memo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PlaceResult } from '@/app/dashboard/importar/page'
import { CATEGORY_MAP } from '@/lib/constants/categories'

interface ImportMapProps {
  center: [number, number]
  places: PlaceResult[]
  onCategoryChange: (id: string, category: string[]) => void
  onImport: (place: PlaceResult) => void
  importingId: string | null
}

export default memo(function ImportMap({
  center,
  places,
  onCategoryChange,
  onImport,
  importingId,
}: ImportMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const callbacksRef = useRef({ onCategoryChange, onImport })
  const placesRef = useRef<PlaceResult[]>([])

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onCategoryChange, onImport }
  }, [onCategoryChange, onImport])

  // Keep places ref updated for popup access
  useEffect(() => {
    placesRef.current = places
  }, [places])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView(center, 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current)

    // User location marker
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    L.marker(center, { icon: userIcon }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [center])

  // Helper to create popup content
  const createPopupContent = (place: PlaceResult, isImporting: boolean) => {
    const container = document.createElement('div')
    container.style.minWidth = '260px'

    // Header
    const header = document.createElement('h3')
    header.style.cssText = 'font-weight: 600; font-size: 16px; margin: 0 0 8px 0; color: #1f2937;'
    header.textContent = place.name
    container.appendChild(header)

    // Address
    const address = document.createElement('p')
    address.style.cssText = 'font-size: 13px; color: #6b7280; margin: 0 0 8px 0;'
    address.textContent = `📍 ${place.address}`
    container.appendChild(address)

    // Rating
    if (place.rating) {
      const rating = document.createElement('p')
      rating.style.cssText = 'font-size: 13px; color: #d97706; margin: 0 0 12px 0;'
      rating.textContent = `⭐ ${place.rating.toFixed(1)} rating`
      container.appendChild(rating)
    }

    if (place.imported) {
      // Already imported message
      const importedMsg = document.createElement('div')
      importedMsg.style.cssText = 'background: #d1fae5; color: #065f46; padding: 12px; border-radius: 8px; text-align: center; font-weight: 500;'
      importedMsg.textContent = '✅ Já importado'
      container.appendChild(importedMsg)
    } else {
      // Category selector with checkboxes
      const categoryDiv = document.createElement('div')
      categoryDiv.style.marginBottom = '12px'

      const label = document.createElement('label')
      label.style.cssText = 'display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;'
      label.textContent = 'Categorias * (primeira = principal)'
      categoryDiv.appendChild(label)

      // Dropdown button
      const dropdownWrapper = document.createElement('div')
      dropdownWrapper.style.cssText = 'position: relative;'

      const dropdownButton = document.createElement('button')
      dropdownButton.type = 'button'
      dropdownButton.style.cssText = `
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        text-align: left;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `

      const updateButtonText = () => {
        if (place.category.length === 0) {
          dropdownButton.innerHTML = '<span style="color: #9ca3af;">Selecione...</span><span>▼</span>'
        } else {
          const selectedNames = place.category.map(key => {
            const cat = CATEGORY_MAP[key]
            return cat ? `${cat.icon} ${cat.name}` : key
          }).join(', ')
          dropdownButton.innerHTML = `<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${selectedNames}</span><span>▼</span>`
        }
      }
      updateButtonText()

      // Dropdown menu
      const dropdownMenu = document.createElement('div')
      dropdownMenu.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      `

      // Create checkbox items
      Object.entries(CATEGORY_MAP).forEach(([key, cat]) => {
        const checkboxItem = document.createElement('label')
        checkboxItem.style.cssText = `
          display: flex;
          align-items: center;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
        `
        checkboxItem.addEventListener('mouseenter', () => {
          checkboxItem.style.backgroundColor = '#f3f4f6'
        })
        checkboxItem.addEventListener('mouseleave', () => {
          checkboxItem.style.backgroundColor = 'transparent'
        })

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.value = key
        checkbox.checked = place.category.includes(key)
        checkbox.style.cssText = 'margin-right: 8px; cursor: pointer;'

        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            // Add to categories (order matters - first is primary)
            place.category.push(key)
          } else {
            // Remove from categories
            const index = place.category.indexOf(key)
            if (index > -1) place.category.splice(index, 1)
          }
          // Update the ref
          const placeInRef = placesRef.current.find(p => p.id === place.id)
          if (placeInRef) placeInRef.category = [...place.category]
          // Update button text
          updateButtonText()
        })

        const labelText = document.createElement('span')
        labelText.textContent = `${cat.icon} ${cat.name}`

        checkboxItem.appendChild(checkbox)
        checkboxItem.appendChild(labelText)
        dropdownMenu.appendChild(checkboxItem)
      })

      // Toggle dropdown
      let isOpen = false
      dropdownButton.addEventListener('click', (e) => {
        e.stopPropagation()
        isOpen = !isOpen
        dropdownMenu.style.display = isOpen ? 'block' : 'none'
      })

      // Close dropdown when clicking outside
      const closeDropdown = () => {
        isOpen = false
        dropdownMenu.style.display = 'none'
      }

      // Store the close handler on the container so we can clean it up
      container.addEventListener('click', (e) => {
        if (!dropdownWrapper.contains(e.target as Node)) {
          closeDropdown()
        }
      })

      dropdownWrapper.appendChild(dropdownButton)
      dropdownWrapper.appendChild(dropdownMenu)
      categoryDiv.appendChild(dropdownWrapper)
      container.appendChild(categoryDiv)

      // Import button
      const button = document.createElement('button')
      button.style.cssText = `
        width: 100%;
        padding: 10px;
        background: ${isImporting ? '#9ca3af' : '#10b981'};
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: ${isImporting ? 'not-allowed' : 'pointer'};
        font-size: 14px;
      `
      button.disabled = isImporting
      button.textContent = isImporting ? 'Importando...' : '📥 Importar este lugar'

      button.addEventListener('click', () => {
        console.log('Import button clicked for:', place.name, 'categories:', place.category)
        // Get the latest place data from ref
        const latestPlace = placesRef.current.find(p => p.id === place.id)
        if (latestPlace) {
          // Merge the category from the local place object
          latestPlace.category = [...place.category]
          callbacksRef.current.onImport(latestPlace)
        } else {
          callbacksRef.current.onImport(place)
        }
      })

      container.appendChild(button)
    }

    return container
  }

  // Create a stable key for places to avoid unnecessary re-renders
  const placesKey = places.map(p => `${p.id}:${p.imported}`).join(',')

  // Update markers when places change (but not when only category changes)
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add new markers
    places.forEach((place) => {
      const icon = L.divIcon({
        className: 'place-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: ${place.imported ? '#10b981' : '#f59e0b'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
          ">
            ${place.imported ? '✓' : '📍'}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([place.lat, place.lng], { icon })

      // Create popup content
      const popupContent = createPopupContent(place, importingId === place.id)
      marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 280 })

      marker.addTo(mapRef.current!)
      markersRef.current.push(marker)
    })

    // Fit bounds if we have places
    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
      bounds.extend(center)
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [placesKey, center, importingId])

  return (
    <div ref={containerRef} className="h-full w-full" />
  )
})
